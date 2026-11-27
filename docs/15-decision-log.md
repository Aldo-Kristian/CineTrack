# CineTrack — Decision Log

**Document ID:** CT-DL-001\
**Version:** 2.0\
**Status:** Final\
**Project:** CineTrack\
**Last updated:** 2026-11-28

## Revision History

| Version | Date | Summary | Reason |
| --- | --- | --- | --- |
| 2.0 | 2026-11-28 | New document: v2 architecture/product decisions and implementation trade-offs | Lecturer consultation + UX fixes + implementation |

---

This log records decisions that shape the product, including decisions made during implementation when the prompt left room for judgment. “Accepted risk” means the team is aware of the downside and has documented a future alternative.

## 1. Product & Data Source

| ID | Context | Options | Decision | Reason |
| --- | --- | --- | --- | --- |
| D-01 | Metadata provider | TMDB, OMDb, manual only | **TMDB API v3** | Free, broad movie/TV coverage, images, genres, and watch providers in one API |
| D-02 | Provider availability | Build own, use TMDB/JustWatch | **TMDB watch providers (JustWatch)** | Legal, maintained, region-aware; avoids scraping |
| D-03 | Offline model | Online-first, offline-first | **Offline-first with optional online enrichment** | Core tracker must work on a plane/without token; online is a bonus |
| D-04 | Online data storage | Memory only, SQLite cache | **Persist mapped metadata + provider cache in SQLite** | Posters/providers stay visible offline; one source of truth |
| D-05 | Provider cache location | Separate table, JSON column | **`media.providers_json` + region/timestamp columns** | One-row read for cards/details; simpler than a join for this scale |
| D-06 | Genre source | TMDB names, TMDB IDs | **Map TMDB genre IDs** | Names are translated by `language`; IDs are stable |
| D-07 | Metadata language | `id-ID`, `en-US` | **`en-US`** | Consistent with the existing English genre constants and UI copy |
| D-08 | Search scope | Movies only, multi | **`search/multi`, filter out people** | One field handles movies and series |

## 2. Security & Configuration

| ID | Context | Options | Decision | Reason |
| --- | --- | --- | --- | --- |
| D-09 | Token location | Backend proxy, client env | **`EXPO_PUBLIC_TMDB_TOKEN` in the client** | No backend in this academic project; read token is free. Risk documented in docs/14 |
| D-10 | Token absence | Crash, disable online, silent failure | **Disable online + informational banner + manual add** | Graceful degradation; app stays usable |
| D-11 | `.env` handling | Commit, ignore | **Ignore `.env`; commit `.env.example`** | Avoid leaking a real token; clear setup |
| D-12 | Backend | Add API proxy now, no backend | **No backend in v2** | Scope/time; proxy listed as future work |
| D-13 | Attribution | Logo + text, text only | **Text-only TMDB/JustWatch attribution** | Avoid logo licensing uncertainty; still satisfies attribution text |

## 3. Deep Links & Streaming

| ID | Context | Options | Decision | Reason |
| --- | --- | --- | --- | --- |
| D-14 | “Open on Netflix” | Per-title deep link, search page, fallback | **Layered: verified template → TMDB/JustWatch → alert** | TMDB does not provide per-title deep links; never crash |
| D-15 | Template verification | Trust memory, verify HTTP | **Verify each template; discard 403/redirect** | Avoid shipping broken links; Crunchyroll/Hotstar fell back |
| D-16 | Unknown providers | Hide, show with fallback | **Show with name/logo from TMDB + fallback link** | Do not hide legal availability just because there is no template |
| D-17 | WeTV/iQIYI/Paramount+ | Invent IDs/templates, omit | **Omit templates; rely on API + fallback** | IDs were not in the verified ID dataset; no guessing |
| D-18 | Prime Video ID | Use one ID, support both | **Support both `9` and `119`** | TMDB uses different provider entries by region |
| D-19 | Max/HBO Max ID | Guess, use verified | **Show whatever TMDB returns; no guessed template** | `384`/`1899` ambiguity; avoid broken links |
| D-20 | Streaming playback | Implement player, out of scope | **Never play content; only open legal pages** | Legal/scope constraints |

## 4. UX & Cards

| ID | Context | Options | Decision | Reason |
| --- | --- | --- | --- | --- |
| D-21 | Add flow | Long form first, search-first | **Search-first with manual fallback** | Target: title → result → save; fewer steps |
| D-22 | Manual form | All fields required, title only | **Only title required; type/status defaults; other fields collapsible** | Fast fallback, less friction |
| D-23 | Genre card layouts | One layout with colors, multiple layouts | **4 variants + per-genre accent/icon** | Visible variation without maintaining 18 unique layouts |
| D-24 | Primary genre | First stored, priority list | **Deterministic priority list** | Stable theme selection regardless of storage order |
| D-25 | No poster | Gray box, themed placeholder | **Gradient + genre icon + initials** | Genre variation remains visible offline |
| D-26 | Card actions | Long-press only, overflow menu | **`⋯` menu + long-press shortcut** | Discoverability for new users |
| D-27 | Delete feedback | Alert only, snackbar + undo | **Snackbar with Undo** | Safer and less modal; reinsert deleted row |
| D-28 | Rating on complete | Force rating, optional sheet | **Skippable sheet** | Encourages rating without blocking status change |
| D-29 | Watchlist header | 4 rows of controls, search + filter sheet | **Search + Filter button + active chips** | Reclaims vertical space; filters remain discoverable |
| D-30 | Filter state | Persist, session-only | **Session-only** | Simple and predictable; no requirement to persist |
| D-31 | Home sections | Single recent list, multiple sections | **Continue Watching / Up Next / Recently Completed** | More useful than one generic list |
| D-32 | Status summary tap | Static, navigate with filter | **Navigate to Watchlist with status param** | Faster drill-down |
| D-33 | UI language | Indonesian, English | **English UI** | Existing app copy is English; consistency |

## 5. Technical Architecture

| ID | Context | Options | Decision | Reason |
| --- | --- | --- | --- | --- |
| D-34 | Navigation | File-based router, React Navigation | **Keep React Navigation** | Existing `RootNavigator`/`TabNavigator`; migration would be risky and out of scope |
| D-35 | Offline detection | NetInfo, request failure | **No NetInfo; infer from failures/timeouts** | One less dependency; “offline” is only meaningful when a request fails |
| D-36 | Bottom sheets | Reanimated/bottom-sheet lib, native Modal | **Native `Modal`** | Simple, stable, Expo Go-safe |
| D-37 | Snackbar | Library, custom Animated | **Custom `Animated` snackbar** | Tiny requirement; no dependency |
| D-38 | Images | RN Image, expo-image | **expo-image** | Disk cache, transition, recyclingKey |
| D-39 | Posters | Remote only, local + remote | **`poster_uri` → `poster_path` → placeholder** | User choice overrides TMDB; offline fallback |
| D-40 | Backup v2 | Include everything, portable only | **Exclude `poster_uri` + `providers_*`** | Local paths/caches are not portable |
| D-41 | Dedup key | title/type/year, TMDB id | **`tmdb_id|type` first, else title/type/year** | Prevents online duplicates while keeping v1 import |
| D-42 | Migration | Rebuild table, additive ALTER | **Additive ALTER inside a transaction** | Lower risk; preserves data; v1/v2 schema parity tested |
| D-43 | Provider refresh timestamp | Bump `updated_at`, leave it | **Do not bump `updated_at`** | Recent ordering reflects user activity, not network |
| D-44 | Background refresh | Refresh all, max 20 | **Sequential, max 20/session, 250 ms delay** | Balance freshness with rate limits/battery |
| D-45 | Enrichment overwrite | Always overwrite, never | **Fill missing fields; ask before replacing existing** | Never destroy user-entered data |
| D-46 | Enrichment matching | Fuzzy, exact | **Exact title + same type + compatible year** | Avoid wrong matches; non-exact goes to review |
| D-47 | Search pagination | Infinite, page 1 | **Page 1 only** | Scope; 20 results is enough for title lookup |
| D-48 | TypeScript | Add TS, stay JS | **Stay JavaScript** | Existing codebase and team preference |
| D-49 | UI kit | Add large kit, StyleSheet | **StyleSheet + Lucide** | Keep visual control and bundle small |
| D-50 | Tests | E2E + unit, unit only | **Jest unit tests for pure functions** | No device in CI; pure logic gives high value |
| D-51 | Token default | Hardcode, env | **Env with empty fallback** | App must boot without a token |
| D-52 | Region default | Always ID, device locale | **Device locale, fallback ID** | Better default for non-Indonesian users |
| D-53 | Provider catalog fallback | Empty list, known list | **`KNOWN_PROVIDERS` fallback** | Subscription picker remains usable offline |
| D-54 | App version | Keep 1.0, bump | **2.0.0** | Major UX/data/API revision |
| D-55 | Legacy filters | Keep unused, remove | **Remove `FilterTabs`, `StatusFilter`, `SortSelector`, `utils/alerts`, `BackupScreen.js.bak`** | Dead code cleanup; no imports remained |
| D-56 | TMDB logo | Bundle logo, text only | **Text only** | Licensing uncertainty; text attribution is sufficient |
| D-57 | User-facing error style | Red alerts everywhere, banners | **Banners for offline/token; alerts for destructive failures** | Avoid alarming users for normal offline states |
| D-58 | Theme colors | Purple from old wireframes, keep red | **Keep Netflix-style red primary with genre accents** | Actual app theme; docs updated |
| D-59 | Expired cache behavior | Hide, show with warning | **Show cache + “older than 7 days” hint** | Offline value; user can refresh |
| D-60 | App start refresh | Block UI, background | **Background, silent, non-blocking** | UX; failures are logged only |

## 6. Decisions Made During Implementation

These were not fully specified in the brief:

1. **Degraded add:** if TMDB details fail after a search result is selected, the app still saves basic metadata instead of blocking the add. Providers remain empty and the cache timestamp is null so a later refresh can fill them.
2. **Undo file lifecycle:** deletion of the local poster is delayed 6 seconds. Undo within the 5-second snackbar cancels the timer, so the custom poster survives the restore.
3. **Favorite provider across categories:** the primary provider is chosen from stream → free → rent → buy, and a subscribed provider is preferred within the first non-empty group.
4. **Provider catalog merge:** movie and TV provider lists are merged/deduplicated for Settings.
5. **Region change refresh cap:** a region change refreshes up to 20 cached titles immediately; the rest refresh on Details/background.
6. **Search result limit:** page 1 only; people are filtered out rather than shown with a disabled state.
7. **No TMDB logo:** text attribution only.
8. **Removed `.bak`:** the unused `BackupScreen.js.bak` was deleted after confirming it was not imported.
9. **No persisted filters:** filters reset when the app restarts; this keeps the Watchlist predictable.
10. **Unverified provider templates:** Crunchyroll (HTTP 403) and Hotstar (301 to a Disney+ app helper) were discarded rather than shipped untested.

## 7. Accepted Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Client token extraction | Quota abuse | Documented; backend proxy future |
| Provider data changes | Stale/wrong availability | 7-day TTL, refresh, fallback link |
| Template URL changes | Broken search link | Fallback to TMDB/JustWatch; alert |
| No live API test in CI | Undetected API drift | Typed mapping + docs + manual test checklist |
| Device-only features untested in CI | Visual/UX regressions | Manual checklist in docs/04 |
| TMDB rate limits | Search temporarily unavailable | Friendly 429 message; manual add |

**End of Document**

Document ID: CT-DL-001\
Version: 2.0\
Project: CineTrack
