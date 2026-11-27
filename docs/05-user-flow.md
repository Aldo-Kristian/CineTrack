# CineTrack — User Flow Diagram

**Document ID:** CT-UF-001\
**Version:** 2.0\
**Status:** Final\
**Phase:** 3 — System Design\
**Project:** CineTrack\
**Last updated:** 2026-11-28

## Revision History

| Version | Date | Summary | Reason |
| --- | --- | --- | --- |
| 2.0 | 2026-11-28 | Search-first add, offline/manual fallback, filter sheet, where-to-watch, settings, enrichment, rating-on-complete | Lecturer consultation + UX fixes |
| 1.0 | 2026-11-25 | Initial five-screen flow | Project setup |

---

## 1. Screen Inventory

| Screen | Function | Related FR |
| --- | --- | --- |
| Home | Status summary, Continue Watching, Up Next, Recently Completed | FR-01, FR-11, FR-19 |
| Watchlist | Full collection, search, filter sheet, chips, card actions | FR-01, FR-04, FR-07…FR-09, FR-13, FR-20, FR-21 |
| Add Media | Search-first TMDB add + manual link | FR-02, FR-14, FR-15, FR-16 |
| Manual Add | Offline/manual form (title only required) | FR-02, FR-16 |
| Media Details | Hero, rating, status, where to watch, synopsis | FR-06, FR-17, FR-18, FR-20 |
| Edit Media | Edit form + “Find poster & info automatically” | FR-03, FR-15, FR-16 |
| Statistics | Collection statistics | FR-11 |
| Settings | Region, subscriptions, enrichment, cache, about | FR-22, FR-23 |
| Backup & Restore | Export/import JSON v2, import v1 | FR-24 |

Bottom tabs: **Home**, **Watchlist**, **Statistics**. Add/Manual/Details/Edit/Backup/Settings are stack screens.

## 2. Main Navigation Flow

```mermaid
flowchart TD
    A([Launch App]) --> B[Initialize SQLite v2]
    B --> C[Load collection + settings]
    C --> D[Home]

    D <--> E[Watchlist]
    D <--> F[Statistics]
    E <--> F

    D -->|Gear| S[Settings]
    D -->|Tap +| G[Add Media]
    E -->|Tap +| G
    D -->|Status card| E
    D -->|Poster card| H[Media Details]
    E -->|Card| H

    G -->|Search result| Q[Confirm Add Sheet]
    Q -->|Add| C
    G -->|Add manually| M[Manual Add]
    M -->|Save| C

    S --> R[Region / Subscriptions]
    S --> T[Enrich Existing Titles]
    S --> U[Backup & Restore]
    S --> V[About & Credits]

    H -->|Edit| I[Edit Media]
    I -->|Find info| W[TMDB Search Sheet]
    W --> I
    I -->|Save| H
    H -->|Delete| X[Confirm Delete]
    X -->|Undo| E
```

## 3. Search-First Add Flow (Online)

```mermaid
flowchart TD
    A([Tap +]) --> B[Add Media screen]
    B --> C[Type title]
    C --> D{At least 2 chars?}
    D -->|No| C
    D -->|Yes| E[Debounce 400 ms]
    E --> F[Search TMDB multi]
    F --> G{Results?}
    G -->|No| H[Empty state + Add manually]
    G -->|Yes| I[Show poster/title/year/type]
    I --> J{Already in collection?}
    J -->|Yes| K[Badge disabled]
    J -->|No| L[Tap result]
    L --> M[Fetch details + watch providers]
    M --> N[Confirm Add Sheet]
    N --> O[Choose status / optional rating]
    O --> P[Add to Collection]
    P --> Q[Persist to SQLite + refresh]
    Q --> R[Snackbar Added]
    R --> S([Back to previous screen])
```

## 4. Add Flow — Offline / Invalid Token

```mermaid
flowchart TD
    A([Add Media]) --> B{Token configured?}
    B -->|No| C[Info banner: online search off]
    B -->|Yes| D[Search]
    D --> E{Network/API ok?}
    E -->|No| F[Offline banner]
    E -->|Yes| G[Normal online flow]
    C --> H[Add manually]
    F --> H
    H --> I[Manual Add form]
    I --> J[Title required; type/status default]
    J --> K[More details optional]
    K --> L[Save]
    L --> M[Persist to SQLite]
    M --> N([Collection updated])
```

## 5. Watchlist Filter & Sort Flow

```mermaid
flowchart TD
    A([Open Watchlist]) --> B[Search bar + Filter button]
    B --> C[Type query]
    B --> D[Tap Filter]
    D --> E[Filter & Sort sheet]
    E --> F[Choose type/status/genre/sort]
    F --> G[Apply]
    G --> H[Update chips + list]
    H --> I{Remove a chip?}
    I -->|Yes| J[Reset that filter]
    J --> H
    I -->|No| K([Done])
```

## 6. Card Action & Rating Flow

```mermaid
flowchart TD
    A([Watchlist card]) --> B{Tap ⋯ or long-press}
    B --> C[Action sheet]
    C --> D[Change status]
    C --> E[Edit]
    C --> F[Delete]
    D --> G{Completed?}
    G -->|No| H[Persist status]
    G -->|Yes| I[Persist Completed]
    I --> J[Rating sheet]
    J --> K{Skip?}
    K -->|Yes| L([Done])
    K -->|No| M[Save rating]
    M --> L
    F --> N[Confirm delete]
    N -->|Confirm| O[Delete + snackbar Undo]
    N -->|Cancel| C
```

## 7. Details → Where to Watch → Open Platform

```mermaid
flowchart TD
    A([Open Details]) --> B[Read providers_json cache]
    B --> C{Providers available?}
    C -->|Yes| D[Show Stream / Free / Rent / Buy]
    C -->|No| E{Cache stale/absent + online?}
    E -->|Yes| F[Background refresh]
    F --> D
    E -->|No| G[Neutral: unavailable offline]
    D --> H[Tap Open on Provider]
    H --> I{Verified template?}
    I -->|Yes| J[Open search URL]
    I -->|No| K[Open TMDB/JustWatch link]
    J --> L([Platform/browser])
    K --> L
    L --> M{Open failed?}
    M -->|Yes| N[Alert Cannot open the link]
    M -->|No| O([Done])
```

## 8. Settings & Enrichment Flow

```mermaid
flowchart TD
    A([Settings]) --> B[Region]
    A --> C[Subscriptions]
    A --> D[Complete existing titles]
    A --> E[Backup]
    A --> F[Clear image cache]
    A --> G[About & Credits]

    B --> B1[Pick country/code]
    B1 --> B2[Save app_settings.region]
    B2 --> B3[Refresh up to 20 provider caches]

    C --> C1[Load provider catalog for region]
    C1 --> C2[Multi-select]
    C2 --> C3[Save subscriptions JSON]

    D --> D1[Find items without tmdb_id]
    D1 --> D2[Sequential search, ~250 ms]
    D2 --> D3{Exact title/type/year?}
    D3 -->|Yes| D4[Fill missing fields only]
    D3 -->|No| D5[Needs review: top 3 candidates]
    D5 --> D6[User picks candidate]
    D6 --> D7[Keep or replace existing details]
```

## 9. Design Notes

- Search/filter/sort are computed in memory from the same collection used by Home and Statistics, keeping numbers consistent.
- Search and filtering never modify SQLite.
- The online add flow always exposes a manual escape hatch.
- Destructive actions are confirmed; delete is reversible for 5 seconds.
- Provider cache is region-specific and stale after 7 days.
- UI text remains English; documentation stays Indonesian where it was Indonesian.
