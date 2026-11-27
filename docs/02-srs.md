# Software Requirements Specification (SRS)

## CineTrack — Personal Film & Series Tracker

**Document ID:** CT-SRS-001\
**Version:** 2.1\
**Status:** Final\
**Platform:** Android (React Native + Expo)\
**Database:** SQLite (local) + optional TMDB API v3\
**Last updated:** 2026-11-28

## Revision History

| Version | Date | Summary | Reason |
| --- | --- | --- | --- |
| 2.1 | 2026-11-28 | Added NFR-13 Adaptive Layout and measurable safe-area, keyboard, sizing, font-scaling, and touch-target criteria | Perbaikan responsive UI |
| 2.0 | 2026-11-28 | Added FR-14…FR-24, revised NFR-01, external TMDB interface, provider/attribution/offline rules, acceptance criteria | Lecturer consultation + UX fixes |
| 1.0 | 2026-11-25 | Initial offline-only SRS | Project setup |

---

# 1. Introduction

## 1.1 Purpose

This document defines the functional and non-functional requirements of CineTrack 2.1, a mobile application that helps users organize a personal movie and TV-series watchlist and optionally enrich it with metadata from TMDB.

The SRS is the primary reference for design, implementation, and testing.

## 1.2 Product Scope

CineTrack lets a single local user:

- add, view, edit, and delete movies/series;
- track To Watch / Watching / Completed status;
- assign a personal 1–5 rating;
- search, filter (type, status, genre), and sort the collection;
- view statistics and export/import a JSON backup;
- search TMDB and add a title with automatically filled poster, backdrop, genres, year, synopsis, and legal streaming providers;
- view where to watch per region and open a legal platform page;
- choose a region and preferred streaming subscriptions;
- complete metadata for existing titles with automatic exact matching and a manual “Needs review” queue.

Core data is stored locally in SQLite. Online features are an optional enrichment layer and fail safely.

## 1.3 Intended Audience

- Students and developers implementing the project.
- Software testers.
- Project evaluators/lecturers.
- Anyone reviewing the technical requirements.

## 1.4 Definitions and Abbreviations

| Term | Definition |
| --- | --- |
| SRS | Software Requirements Specification |
| CRUD | Create, Read, Update, Delete |
| UI | User Interface |
| SQLite | Embedded relational database |
| TMDB | The Movie Database API v3 |
| JustWatch | Provider-availability data partner used by TMDB |
| Provider | Legal streaming/rental/purchase service (Netflix, Prime Video, …) |
| Region | ISO 3166-1 alpha-2 country code (e.g. `ID`) |
| TTL | Time to live; provider cache is stale after 7 days |
| Enrichment | Filling metadata/poster/providers for a title |
| Exact match | Same title (case-insensitive), same type, and compatible year |
| Needs review | Enrichment candidates that require a user choice |
| Deep link | URL that opens a platform app or web page |

---

# 2. Overall Description

## 2.1 Product Perspective

CineTrack is a standalone Android-first mobile app built with React Native/Expo. It uses local SQLite as the source of truth and TMDB as an optional external system.

Layers:

1. **Presentation** — screens, cards, sheets, navigation.
2. **Application logic** — media rules, validation, mapping, filtering, backup, TMDB orchestration.
3. **Data access** — repositories for `media` and `app_settings`.
4. **External** — TMDB API v3 and image CDN; provider data originates from JustWatch.
5. **Local cache** — SQLite rows and `expo-image` disk cache.

## 2.2 Product Functions

- Display and manage a personal collection.
- Add online (TMDB) or manually.
- View details with hero, synopsis, and where-to-watch.
- Edit/delete with confirmation; delete supports Undo.
- Manage status; prompt for rating when Completed.
- Search/filter/sort, including genre.
- Display statistics.
- Display genre-themed cards with posters/providers.
- Settings: region, subscriptions, enrichment, cache, backup, credits.
- Export/import backup v2; import backup v1.
- Refresh provider cache on demand and in the background.

## 2.3 User Characteristics

General smartphone users with basic familiarity with mobile apps. No account, technical knowledge, or registration is required.

## 2.4 Operating Environment

| Component | Requirement |
| --- | --- |
| Operating System | Android (primary), iOS compatible |
| Development Environment | Expo SDK 58 |
| Runtime | Expo Go during development |
| Programming Language | JavaScript |
| Framework | React Native 0.88 |
| Navigation | React Navigation 7 |
| Database | SQLite via expo-sqlite |
| UI Styling | React Native StyleSheet |
| Online API | TMDB API v3 (optional) |
| Tests | jest-expo + jest |

## 2.5 Design Constraints

- Must use React Native and Expo SDK 58.
- Must run in Expo Go for bundled modules.
- Core data must be stored locally.
- Core features must work without internet.
- Must use a consistent dark interface.
- Must not require authentication.
- Must not play or distribute content; only open legal platform pages.
- Online enrichment must be optional and degrade gracefully.
- No NetInfo dependency; offline is inferred from request failures.
- Bottom sheets must use React Native `Modal` (no reanimated/bottom-sheet library).
- UI copy is English.

## 2.6 Assumptions and Dependencies

- User has an Android device compatible with Expo Go.
- Local app storage is available.
- SQLite is available through expo-sqlite.
- One local user per installation.
- Internet is optional; when available, TMDB is reachable.
- A valid `EXPO_PUBLIC_TMDB_TOKEN` may be provided; without it, online features are off.
- TMDB/JustWatch provider data and deep-link URLs can change.
- The client token is an accepted academic risk.
- Application data is not automatically synchronized to a cloud.

---

# 3. Functional Requirements

## 3.1 Collection

**FR-01 — View Collection**

The system shall display all saved movies and series.

Acceptance Criteria:

- Entries are loaded from SQLite and displayed in a list/carousel.
- Each card shows title, type · year, rating (if any), status, genre chips, and a streaming action when cached providers exist.
- The collection refreshes after successful create/update/delete/restore/import.
- Empty, loading, and error states are explicit.
- Home shows status summary and Continue Watching / Up Next / Recently Completed sections.

## 3.2 Add

**FR-02 — Add Entry**

The system shall allow adding a title online or manually.

Acceptance Criteria:

- Online main flow: tap + → type title (min 2 chars) → tap a TMDB result → choose status (default To Watch) and optional rating → Add to Collection.
- Search is debounced by 400 ms and filtered to movie/TV (people excluded).
- Results show a mini poster, title, year, Movie/Series badge, and an “In collection” badge when `(tmdb_id,type)` already exists.
- Manual flow requires only a title; type defaults Movie and status defaults To Watch.
- The saved item appears in the collection without a full-page reload.

**FR-14 — Search Title Online**

- Queries `GET /search/multi` with `language=en-US`, `include_adult=false`.
- Handles idle/loading/success/empty/error/offline states.
- Cancels stale requests when the query changes.
- On offline/timeout, shows an informative banner and keeps manual add available.

**FR-15 — Auto-fill Metadata**

- Selecting a result fetches details and maps poster, backdrop, genres, year, synopsis, TMDB id/link, and providers.
- Fields are saved to SQLite so they remain available offline.
- If detail fetching fails, the app still allows saving basic search-result metadata.

**FR-16 — Poster/Thumbnail (Automatic + Manual)**

- Automatically use TMDB `poster_path` (and `backdrop_path` for hero/cinematic cards) when available.
- Allow a user-chosen poster from the gallery, cropped/selected at 2:3, copied into app documents, and stored in `poster_uri`.
- The UI priority is `poster_uri` → TMDB `poster_path` → genre-themed placeholder.
- Deleting or replacing a custom poster removes the old local file (replacement immediately; deletion after the Undo window).
- Placeholder uses the primary genre gradient, genre icon, and title initials; it must not be a gray box.
- Image loads are cached on disk by `expo-image` and continue to display offline.

## 3.3 Edit / Delete

**FR-03 — Edit Entry**

- Existing values populate the form.
- “Find poster & info automatically” opens TMDB search and can fill missing metadata/poster.
- If genre/year/description already exist, the user is asked whether to keep or replace them.
- Only title is required; optional fields live under “More details (optional)”.
- Changes are persisted and visible immediately.

**FR-04 — Delete Entry**

- Confirmation is required.
- Deletion is permanent after confirmation.
- A snackbar “Deleted … — Undo” appears for 5 seconds; Undo re-inserts the previous row.
- Local poster files are deleted after the Undo windowunless restored.
- Canceling the confirmation keeps the entry.

**FR-24 — Backup v2**

- Export writes a JSON file with `version: 2`.
- Export includes `tmdb_id`, `poster_path`, `backdrop_path`, `tmdb_link`.
- Export excludes `poster_uri` (device-local) and `providers_*` (cache).
- Import accepts v2 and v1 backups.
- Duplicate key: `tmdb_id|type` when `tmdb_id` exists; otherwise `title|type|year`.
- Existing data is preserved; duplicates are skipped and counted.

## 3.4 Status & Rating

**FR-05 — Manage Viewing Status**

- Exactly one of `TO_WATCH`, `WATCHING`, `COMPLETED`.
- Status can be changed from Details, the card overflow menu, or the item form.
- Changes persist in SQLite.
- Changing to Completed offers the quick rating sheet (FR-20).

**FR-10 — Assign Personal Rating**

- Scale 1.0–5.0, step 0.5.
- Optional; can be cleared or changed.
- Rating is persisted and reflected in cards/statistics.
- Details allows tapping the rating to change it without entering Edit.

**FR-20 — Quick Status & Rating Prompt**

- When a status change results in Completed, a rating sheet appears.
- The sheet is skippable.
- Saving the rating updates the same record.
- Canceling/skipping leaves the status change intact.

## 3.5 Details

**FR-06 — View Details**

- Hero: backdrop (fallback poster/gradient theme), overlapping poster, title, type · year, genre chips.
- Tappable rating and status segmented control.
- Where to watch groups: Stream / Free & Ads / Rent / Buy.
- “Updated … ago” and a refresh button.
- Synopsis is expandable/collapsible above 4 lines.
- Additional info and Edit/Delete actions.
- Missing optional information is handled gracefully.

**FR-17 — Streaming Availability**

- Providers are normalized from `watch/providers.results[region]`.
- Categories: `flatrate` → stream, `free` + `ads` → free, `rent`, `buy`.
- Sorted by `display_priority`.
- Region comes from Settings (default device region or `ID`).
- Cache TTL is 7 days; stale/absent cache refreshes in the background when online.
- If offline with cache, cached data is shown. If there is no cache, a neutral message is shown (no red error).
- If no provider data exists, no dead streaming button is rendered.

**FR-18 — Open on Platform**

- Primary button label is “Open on {Provider}” for stream/free or “Rent/Buy on {Provider}” for rent/buy.
- Link strategy:
  1. Verified provider search template (Netflix, Prime Video, Apple TV/Apple TV+, YouTube, Google Play Movies, Vidio, Viu).
  2. Otherwise the TMDB/JustWatch `link` for that title.
  3. Otherwise an alert “Cannot open the link”; no crash.
- `{title}` is `encodeURIComponent`-encoded.
- Up to three secondary provider logos are tappable.

## 3.6 Cards & Genre

**FR-19 — Genre-themed Card**

- Primary genre is deterministic using: Horror > Sci-Fi > Fantasy > Animation > Romance > Comedy > Thriller > Crime > War > Western > Action > Adventure > Music > Documentary > History > Mystery > Family > Drama.
- Four layout variants: cinematic, poster, vibrant, atmospheric.
- Each genre has an accent, gradient, icon, and radius.
- All variants show the same content: title, type · year, rating, status badge, max 2 genre chips, streaming action.
- Without a genre, the poster variant uses a neutral theme.
- Without a poster, a genre-themed gradient + icon + initials placeholder is shown.
- Cards are memoized; no heavy shadows; `expo-image` uses caching/recycling.

## 3.7 Search / Filter / Sort

**FR-07 — Search Collection**

- Case-insensitive partial match on title or genre.
- No results message.

**FR-08 / FR-09 — Type and Status Filters**

- Type: All/Movie/Series.
- Status: All/To Watch/Watching/Completed.
- Filtering never modifies stored data.

**FR-21 — Genre Filter**

- Genre filter is available in the Filter & Sort sheet.
- Matches any genre token in the stored comma-separated string.
- Can be combined with query, type, status, and sort.

**FR-13 — Sort Collection**

- Options: Recent (default), Title A–Z, Rating (descending, nulls last), Year (descending, nulls last).

**FR-12 — Empty States & Feedback**

- Loading, empty, no-results, offline, and error states are distinct.
- Destructive actions use confirmation and snackbar feedback.
- No stack traces or blank screens.

## 3.8 Statistics

**FR-11 — Display Collection Statistics**

- Total titles and average rating (rated count).
- Breakdown by status and type.
- Updates from the same collection data used by Home/Watchlist.

## 3.9 Settings & Data Enrichment

**FR-22 — Settings (Region & Subscriptions)**

- Region is initialized from `expo-localization` (`regionCode`, fallback `ID`) and stored in `app_settings.region`.
- Region can be changed via a country list or an ISO two-letter input.
- Changing region refreshes up to 20 provider caches and updates cards.
- My streaming subscriptions is a multi-select from the provider catalog for the region (fallback to a known list when offline).
- Selected subscriptions are stored as a JSON array in `app_settings.subscriptions` and prioritize the card’s primary button.
- Settings also exposes Backup, Clear image cache, and About/Credits.
- TMDB/JustWatch attribution is displayed.

**FR-23 — Enrich Existing Data**

- Applies to items without `tmdb_id`.
- Processes sequentially with ~250 ms delay; shows progress `current/total`; can be cancelled.
- Auto-applies only when title matches exactly (case-insensitive), type matches, and year is empty or equal.
- Auto-apply never overwrites title, type, status, rating, or existing genre/year/description.
- Non-exact items go to “Needs review” with up to three candidates; user selects one.
- Selecting a candidate can keep or replace existing genre/year/description.

---

# 4. Non-Functional Requirements

## 4.1 Offline Degradation

**NFR-01 (revised)**

Core features must function without internet: viewing the collection, manual add, edit, delete, status, rating, search/filter/sort, statistics, and backup. Enrichment features require internet and must fail safely with friendly feedback. Cached metadata, posters (disk), and providers must remain usable offline.

## 4.2 Data Persistence

**NFR-02**

Saved entries remain after the app closes/reopens unless app data is cleared or the app is uninstalled. Migrations preserve existing rows.

## 4.3 Offline Availability

**NFR-03**

All primary features work without an active internet connection.

## 4.4 Usability

**NFR-04**

Navigation is understandable; text is readable; feedback is explicit. Touch targets are at least 44×44 dp. Icon-only buttons have accessibility labels. Keyboard avoidance is used on form/search screens.

## 4.5 UI Consistency

**NFR-05**

Consistent dark theme, colors, typography, spacing, and interactive elements. UI copy is English.

## 4.6 Data Integrity

**NFR-06**

Input is validated before saving. Required title must be non-blank. Type/status are constrained. Rating is 1–5. `tmdb_id` + `type` is unique. Imported invalid rows are counted and skipped.

## 4.7 Compatibility

**NFR-07**

Runs on supported Android devices with Expo Go SDK 58. Native packages are installed with `npx expo install`.

## 4.8 Maintainability

**NFR-08**

Code is separated into screens, components, hooks, context, services, repositories, constants, and utils. Screens do not run SQL or `fetch`.

## 4.9 Timeout & Error Handling

**NFR-09**

TMDB requests use an 8-second `AbortController` timeout, one retry for network/timeout errors, clear handling for 401 (token) and 429 (rate limit), and friendly messages. No stack traces are shown.

## 4.10 Attribution Compliance

**NFR-10**

Settings/About and README display: “This product uses the TMDB API but is not endorsed or certified by TMDB.” and “Streaming availability data provided by JustWatch.” TMDB logo is not bundled; text attribution is used.

## 4.11 Performance with Images

**NFR-11**

Cards are memoized. FlatList uses `initialNumToRender`, `windowSize`, `maxToRenderPerBatch`, and Android `removeClippedSubviews`. Images use `expo-image` disk caching and `recyclingKey`. Scrolling 100+ items should remain smooth on a mid-range Android device.

## 4.12 Client Token Risk

**NFR-12**

The `EXPO_PUBLIC_TMDB_TOKEN` is bundled in the client. This is an accepted academic risk. Documentation must state the risk and the backend-proxy alternative.

## 4.13 Adaptive Layout

**NFR-13**

The UI must remain usable and unclipped across Android edge-to-edge system bars, keyboard states, small/large screens, and system font scaling.

Acceptance criteria:

- Every element attached to a screen edge uses safe-area insets. Content is not obscured by a 3-button navigation bar (±48 dp) or gesture navigation (±16–24 dp).
- Every bottom sheet uses the shared `BottomSheet`, rises above the keyboard, and keeps its footer actions above the navigation bar/keyboard.
- The “Find poster & info” sheet keeps its search field and as many result rows as fit visible above the keyboard; at 360×640 dp with the keyboard open, at least 2 result cards are visible.
- Form fields (Title and Description) remain visible when focused; the submit action is reachable by scrolling; content below “More details (optional)” is not clipped.
- The FAB is never clipped or covered by cards, sits above the tab bar, and the last list item can scroll clear of it.
- Text and controls remain usable at system font scale 1.5×; limited-space chips/badges/buttons use `numberOfLines` and `maxFontSizeMultiplier` ≤ 1.3.
- Forms and sheets are centered with a maximum content width of 640 dp on tablets/foldables; lists do not stretch absurdly.
- Interactive targets are at least 44×44 dp and icon-only buttons expose accessibility labels.
- Snackbar does not overlap the FAB or tab bar.
- Only one bottom-sheet implementation exists.

---

# 5. Data Requirements

## 5.1 `media` Entity (v2)

| Attribute | Type | Constraint |
| --- | --- | --- |
| id | INTEGER | Primary key, auto increment |
| title | TEXT | NOT NULL, non-blank |
| type | TEXT | NOT NULL, MOVIE or SERIES |
| genre | TEXT | Nullable, comma-separated |
| release_year | INTEGER | Nullable |
| status | TEXT | NOT NULL, TO_WATCH/WATCHING/COMPLETED |
| rating | REAL | Nullable, 1.0–5.0 |
| description | TEXT | Nullable |
| created_at | TEXT | NOT NULL |
| updated_at | TEXT | NOT NULL |
| tmdb_id | INTEGER | Nullable; unique with type |
| poster_path | TEXT | Nullable |
| backdrop_path | TEXT | Nullable |
| poster_uri | TEXT | Nullable; device-local |
| tmdb_link | TEXT | Nullable |
| providers_json | TEXT | Nullable; normalized cache |
| providers_region | TEXT | Nullable |
| providers_fetched_at | TEXT | Nullable |

Unique partial index: `(tmdb_id, type) WHERE tmdb_id IS NOT NULL`.

## 5.2 `app_settings` Entity

| Key | Value | Allowed |
| --- | --- | --- |
| region | ISO 3166-1 alpha-2 | `^[A-Z]{2}$` |
| subscriptions | JSON array of provider ids | integers |

## 5.3 Data Validation

- Title must contain at least one non-whitespace character.
- Type must be MOVIE or SERIES (defaults to MOVIE if omitted).
- Status must be TO_WATCH, WATCHING, or COMPLETED (defaults to TO_WATCH if omitted).
- Rating must be 1.0–5.0 when provided.
- Release year must be a valid integer within a plausible range.
- `tmdb_id` must be a positive integer when provided.
- Provider JSON is not user-validated; it is parsed safely and falls back to empty groups.

---

# 6. External Interface Requirements

## 6.1 User Interface

Screens: Home, Watchlist, Add Media (search-first), Manual Add, Media Details, Edit Media, Statistics, Settings, Backup & Restore. Bottom sheets: confirm add, filter/sort, actions, rating, region, subscriptions, TMDB search.

## 6.2 Hardware Interface

Android smartphone; no specialized hardware. Photo library access only when the user chooses a custom poster.

## 6.3 Software Interface — TMDB

- Base URL: `https://api.themoviedb.org/3`
- Auth header: `Authorization: Bearer <EXPO_PUBLIC_TMDB_TOKEN>`
- Language: `en-US`
- Endpoints:
  - `GET /search/multi?query=&include_adult=false&language=en-US&page=1`
  - `GET /movie/{id}?language=en-US&append_to_response=watch/providers`
  - `GET /tv/{id}?language=en-US&append_to_response=watch/providers`
  - `GET /movie/{id}/watch/providers`
  - `GET /tv/{id}/watch/providers`
  - `GET /watch/providers/movie?watch_region={region}`
  - `GET /watch/providers/tv?watch_region={region}`
  - `GET /genre/movie/list`, `GET /genre/tv/list` (verification)
  - `GET /configuration` (image sizes)
- Image base: `https://image.tmdb.org/t/p/{size}{path}` with `w185`, `w342`, `w780`, `w92` (logos).
- Error handling: timeout 8 s, one retry, 401/429 mapping, abort support.
- If the token is absent/invalid, online features are off and manual features remain.

## 6.4 Software Interface — Local

- Android OS, Expo runtime, React Native, expo-sqlite, expo-image, expo-file-system.
- No backend server.

---

# 7. Business Rules

| ID | Rule |
| --- | --- |
| BR-01 | Every entry must have a title. |
| BR-02 | Every entry must have a content type. |
| BR-03 | Every entry must have exactly one viewing status. |
| BR-04 | Personal ratings are optional. |
| BR-05 | Ratings must be between 1.0 and 5.0. |
| BR-06 | Each entry must have a unique database ID. |
| BR-07 | Deletion requires user confirmation. |
| BR-08 | Search and filtering must not modify records. |
| BR-09 | Only `title` is user-required; type/status have defaults. |
| BR-10 | `(tmdb_id, type)` must be unique when `tmdb_id` exists. |
| BR-11 | Provider cache is valid for 7 days and is region-specific. |
| BR-12 | Online enrichment must never overwrite user fields without consent. |
| BR-13 | Auto-enrichment requires exact title + same type + compatible year. |
| BR-14 | Streaming playback is out of scope; only legal platform pages are opened. |
| BR-15 | TMDB/JustWatch attribution must remain visible in Settings/About and README. |
| BR-16 | Backup v2 excludes device-local poster URIs and provider caches. |
| BR-17 | Region must be a two-letter ISO code. |
| BR-18 | A failed online request must not block manual add/edit. |

---

# 8. Acceptance Criteria

The application satisfies v2 when:

1. From Home, a user can add a movie with: tap + → type title → tap result → tap Add to Collection (≤ 4 taps + typing).
2. The saved item has poster, genre, year, synopsis, and providers filled automatically (when online).
3. Adding an existing `(tmdb_id,type)` is rejected with “Already in your collection.”
4. Airplane mode shows an offline banner; manual form can save with only a title.
5. Empty/invalid token does not crash; a clear message appears and manual add works.
6. At least four visibly different card layouts appear for Horror, Comedy, Action, and Drama.
7. Without a poster, a genre-themed placeholder is shown.
8. Cards show “Open on {Provider}” when data exists; tapping opens a platform/fallback; tapping the card body opens details.
9. Watchlist header is compact (search + Filter), filters include type/status/genre/sort in a sheet, and active chips can be removed.
10. The `⋯` menu opens; changing status to Completed shows a skippable rating sheet.
11. Details shows hero, where-to-watch with “Updated … ago” + refresh, and expandable synopsis.
12. Settings changes region and refreshes providers; subscriptions affect the primary card button; attribution is visible.
13. DB v1 with data upgrades to v2 without loss; old items show genre-themed placeholders.
14. Backup v2 exports/imports; v1 backups still import.
15. “Complete my existing titles automatically” follows the exact-match rule and never overwrites without consent.
16. Lint, tests, doctor, and Android export pass; no SQL/fetch in screens/components.
17. All v2.1 documents are consistent with the code and describe the optional online enrichment accurately.
18. README roadmap reflects the real status; AGENTS describes React Navigation and the actual layered structure.
19. No UI element is obscured by status/navigation bars in 3-button or gesture mode.
20. Bottom sheets and forms remain usable with the keyboard open; the FAB is never clipped; the UI is usable at 1.5× font scale and on small/large screens.

---

# 9. Out of Scope

- User registration/authentication.
- Cloud database/synchronization.
- Streaming or content distribution.
- Social features and sharing.
- Multiple user profiles.
- Online recommendations.
- Payment/subscription management inside the app.
- Guaranteed per-title deep links for every provider.
- Backend proxy for the TMDB token (future work).

---

**End of Document**

Document ID: CT-SRS-001\
Version: 2.1\
Project: CineTrack
