# CineTrack — Sequence Diagrams

**Document ID:** CT-SEQ-001\
**Version:** 2.0\
**Status:** Final\
**Phase:** 3 — System Design\
**Project:** CineTrack\
**Last updated:** 2026-11-28

## Revision History

| Version | Date | Summary | Reason |
| --- | --- | --- | --- |
| 2.0 | 2026-11-28 | Added TMDB add, provider refresh, open platform, offline manual, enrichment sequences | Lecturer consultation + UX fixes |
| 1.0 | 2026-11-25 | Initial add/edit/delete/search sequences | Project setup |

---

## Participants

| Participant | Responsibility |
| --- | --- |
| User | Interacts with the app |
| Screen | UI screen/sheet |
| Context | `MediaContext` state and async actions |
| Service | `mediaService`, `tmdbMapper`, `providerService`, `validationService` |
| TMDBClient | `tmdbClient` request wrapper (timeout/retry/errors) |
| TMDB | External TMDB API (metadata + JustWatch providers) |
| Repo | `mediaRepository` / `settingsRepository` |
| SQLite | Local database v2 |
| Linking | OS/browser/platform app |

## 1. Add via TMDB

Related: FR-02, FR-14, FR-15, UC-13.

```mermaid
sequenceDiagram
    actor User
    participant Screen as Add Media Screen
    participant Context as MediaContext
    participant Service as mediaService
    participant Client as tmdbClient
    participant TMDB as TMDB API
    participant Repo as mediaRepository
    participant DB as SQLite

    User->>Screen: Type title (>= 2 chars)
    Screen->>Screen: Debounce 400 ms
    Screen->>Client: searchMulti(query)
    Client->>TMDB: GET /search/multi
    TMDB-->>Client: results
    Client-->>Screen: movies/TV only
    Screen-->>User: Results + In collection badges

    User->>Screen: Tap result
    Screen->>Context: previewTmdb(result)
    Context->>Service: fetchTmdbPreview(result, region)
    Service->>Client: getDetails(type, id)
    Client->>TMDB: GET /movie|tv/{id}?append_to_response=watch/providers
    TMDB-->>Client: details + providers
    Client-->>Service: details
    Service->>Service: mapTmdbDetails + normalize providers
    Service-->>Context: mapped data
    Context-->>Screen: preview
    Screen-->>User: Confirm Add Sheet

    User->>Screen: Add to Collection (status/rating)
    Screen->>Context: addFromTmdb(result, options)
    Context->>Service: addMediaFromTmdb(db, result, options)
    Service->>Repo: findByTmdbId(tmdbId, type)
    Repo->>DB: SELECT by tmdb_id + type
    DB-->>Repo: existing? 
    alt Duplicate
        Service-->>Screen: { ok:false, duplicate:true }
        Screen-->>User: Already in your collection
    else New
        Service->>Service: map payload + validate
        Service->>Repo: createMedia(payload)
        Repo->>DB: INSERT media
        DB-->>Repo: row
        Repo-->>Service: created row
        Service-->>Context: { ok:true, media }
        Context->>Context: refresh()
        Context->>Repo: getAllMedia()
        Repo-->>Context: collection
        Screen-->>User: Snackbar Added + goBack
    end
```

## 2. Add Manually / Offline

Related: FR-02, FR-16, UC-14.

```mermaid
sequenceDiagram
    actor User
    participant Screen as Manual Add Screen
    participant Form as MediaForm
    participant Context as MediaContext
    participant Service as mediaService
    participant Repo as mediaRepository
    participant DB as SQLite
    participant FS as expo-file-system

    User->>Screen: Open manual form
    Screen-->>User: Title + type/status defaults
    User->>Form: Enter title (only required)
    User->>Form: Optional More details
    User->>Form: Choose poster from gallery
    Form->>FS: Copy picked file to Paths.document
    FS-->>Form: poster_uri
    User->>Form: Add to Collection
    Form->>Context: add(formData)
    Context->>Service: addMedia(db, formData)
    Service->>Service: validateMediaForm (title only)
    alt Invalid
        Service-->>Context: { ok:false, errors }
        Context-->>Screen: inline errors
    else Valid
        Service->>Repo: createMedia(payload)
        Repo->>DB: INSERT media
        DB-->>Repo: row
        Service-->>Context: { ok:true, media }
        Context->>Context: refresh()
        Screen-->>User: Snackbar Added + goBack
    end
```

## 3. Refresh Providers (Cache/TTL)

Related: FR-17, UC-15.

```mermaid
sequenceDiagram
    actor User
    participant Screen as Media Details
    participant Context as MediaContext
    participant Service as mediaService
    participant Client as tmdbClient
    participant TMDB as TMDB API
    participant Repo as mediaRepository
    participant DB as SQLite

    User->>Screen: Open details
    Screen->>Screen: parseProviders(cache), isStale(7 days)
    alt Cache stale or region changed
        Screen->>Context: refreshProviders(media)
        Context->>Service: refreshProvidersForMedia(db, media, region)
        Service->>Client: getWatchProviders(type, tmdbId)
        Client->>TMDB: GET /movie|tv/{id}/watch/providers
        alt Network/API error
            TMDB-->>Client: error/timeout
            Client-->>Service: TmdbError
            Service-->>Context: { ok:false, error }
            Screen-->>User: Keep cache / neutral message
        else Success
            TMDB-->>Client: results
            Client-->>Service: results
            Service->>Service: normalizeProviders(results, region)
            Service->>Repo: updateProviders(id, cache)
            Repo->>DB: UPDATE providers_json/region/fetched_at
            DB-->>Repo: row
            Service-->>Context: { ok:true, media }
            Context->>Context: refresh()
            Screen-->>User: Updated groups + timestamp
        end
    else Fresh cache
        Screen-->>User: Cached providers
    end
```

## 4. Open on Streaming Platform

Related: FR-18, UC-16.

```mermaid
sequenceDiagram
    actor User
    participant Card as Card / Detail button
    participant ProviderService as providerService
    participant Linking as Linking / OS

    User->>Card: Tap Open on Provider
    Card->>ProviderService: buildProviderLink(provider, media, tmdbLink)
    alt Verified template
        ProviderService-->>Card: https://provider/search?q=encoded-title
    else No template
        ProviderService-->>Card: TMDB/JustWatch link
    end
    Card->>Linking: openURL(link)
    alt Success
        Linking-->>User: Platform app or browser
    else Failure
        Linking-->>Card: rejection
        Card-->>User: Alert Cannot open the link
    end
```

## 5. Enrich Existing Titles

Related: FR-23, UC-18.

```mermaid
sequenceDiagram
    actor User
    participant Screen as Settings
    participant Context as MediaContext
    participant Service as mediaService
    participant Client as tmdbClient
    participant TMDB as TMDB API
    participant Repo as mediaRepository
    participant DB as SQLite

    User->>Screen: Complete existing titles
    Screen->>Context: enrichItems({ signal, onProgress })
    Context->>Service: enrichExistingMedia(db, items, region, options)
    loop Each item without tmdb_id
        Service-->>Screen: onProgress(current,total,title)
        Service->>Client: searchMulti(title)
        Client->>TMDB: GET /search/multi
        TMDB-->>Client: candidates
        alt Exact title + type + year
            Service->>Client: getDetails + getWatchProviders
            Client->>TMDB: details + providers
            TMDB-->>Client: data
            Service->>Service: merge missing fields only
            Service->>Repo: updateMedia(id, payload)
            Repo->>DB: UPDATE media
        else Not exact
            Service->>Service: add to review (top 3)
        end
        Service->>Service: delay 250 ms
    end
    Service-->>Context: { applied, review, cancelled }
    Context->>Context: refresh()
    Screen-->>User: Summary + Needs review list
    User->>Screen: Pick candidate
    Screen->>Context: applyMatch(media, candidate, overwrite?)
    Context->>Service: applyTmdbMatch(...)
    Service->>Repo: updateMedia
    Repo->>DB: UPDATE media
    Screen-->>User: Metadata updated
```

## 6. Delete with Undo

Related: FR-04, UC-05.

```mermaid
sequenceDiagram
    actor User
    participant Screen as Watchlist / Details
    participant Context as MediaContext
    participant Service as mediaService
    participant Repo as mediaRepository
    participant DB as SQLite
    participant FS as expo-file-system

    User->>Screen: Delete + confirm
    Screen->>Context: remove(id)
    Context->>Service: removeMedia(db, id)
    Service->>Repo: deleteMedia(id)
    Repo->>DB: DELETE FROM media
    Service-->>Context: true
    Context->>Context: schedule poster deletion after 6 s
    Context->>Context: refresh()
    Screen-->>User: Snackbar Deleted - Undo

    alt User taps Undo within 5 s
        User->>Screen: Undo
        Screen->>Context: restore(media)
        Context->>Context: cancel poster deletion
        Context->>Service: restoreMedia(db, media)
        Service->>Repo: createMedia(payload)
        Repo->>DB: INSERT media
        Screen-->>User: Item restored
    else No Undo
        Context->>FS: deleteLocalFile(poster_uri) after 6 s
    end
```

**Design note:** search/filter/sort run in memory from the loaded collection. This keeps Home, Watchlist, and Statistics consistent. SQL is only used in repositories.
