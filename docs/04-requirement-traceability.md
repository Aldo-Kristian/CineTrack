# CineTrack — Requirement Traceability Matrix & Test Cases

**Document ID:** CT-RTM-001\
**Version:** 2.1\
**Status:** Final\
**Project:** CineTrack\
**Last updated:** 2026-11-28

## Revision History

| Version | Date | Summary | Reason |
| --- | --- | --- | --- |
| 2.1 | 2026-11-28 | Added NFR-13 adaptive-layout traceability and TC-027…TC-036 manual devices/keyboard/safe-area matrix | Perbaikan responsive UI |
| 2.0 | 2026-11-28 | Extended to FR-24, added UC-13…UC-21 mapping, replaced the draft note with real test cases and verification results | Lecturer consultation + QA |
| 1.0 | 2026-11-25 | Initial draft RTM (FR-01…FR-12) | Project setup |

---

## 1. Requirement Traceability Matrix

| Requirement | Use Case | Test ID | Primary Evidence |
| --- | --- | --- | --- |
| FR-01 View Collection | UC-01 | TC-001 | Home/Watchlist code, Android bundle |
| FR-02 Add Entry | UC-02 | TC-002 | Add/Manual forms, `mediaService.addMedia` |
| FR-03 Edit Entry | UC-04 | TC-003 | `EditMediaScreen`, `editMedia` |
| FR-04 Delete Entry | UC-05 | TC-004 | Delete confirm + Undo + delayed file cleanup |
| FR-05 Manage Status | UC-06 | TC-005 | `StatusSegmented`, `editMedia` |
| FR-06 View Details | UC-03 | TC-006 | Hero, provider section, synopsis |
| FR-07 Search Collection | UC-07 | TC-007 | `filterMedia`, SearchBar |
| FR-08 Type Filter | UC-08 | TC-008 | FilterSheet type chips |
| FR-09 Status Filter | UC-09 | TC-009 | FilterSheet status chips |
| FR-10 Personal Rating | UC-10 | TC-010 | RatingInput/RatingSheet, validation |
| FR-11 Statistics | UC-11 | TC-011 | `getStatistics`, StatisticsScreen |
| FR-12 Empty States & Feedback | UC-01 | TC-012 | EmptyState, OfflineBanner, Snackbar |
| FR-13 Sort Collection | UC-12 | TC-013 | `sortMedia`, FilterSheet sort |
| FR-14 Search Title Online | UC-13 | TC-014 | `tmdbClient.searchMulti`, `useTmdbSearch` |
| FR-15 Auto-fill Metadata | UC-13 | TC-015 | `tmdbMapper`, `addMediaFromTmdb` |
| FR-16 Poster/Thumbnail | UC-14 | TC-016 | PosterImage/Placeholder/Picker |
| FR-17 Streaming Availability | UC-15 | TC-017 | `providerService`, ProviderSection |
| FR-18 Open on Platform | UC-16 | TC-018 | `buildProviderLink`, `openProvider` |
| FR-19 Genre-themed Card | UC-01 | TC-019 | `getPrimaryGenre`, 4 card variants |
| FR-20 Quick Status & Rating Prompt | UC-21 | TC-020 | Watchlist/Details completed flow |
| FR-21 Genre Filter | UC-20 | TC-021 | `filterMedia({genre})`, FilterSheet |
| FR-22 Settings (Region/Subscriptions) | UC-17 | TC-022 | `MediaContext`, Region/Subscription pickers |
| FR-23 Enrich Existing Data | UC-18 | TC-023 | `enrichExistingMedia`, Settings progress/review |
| FR-24 Backup v2 | UC-19 | TC-024 | `buildBackup`/`importBackup`, BackupScreen |
| NFR-13 Adaptive Layout | UC-01, UC-02, UC-13, UC-14, UC-21 | TC-027…TC-036 | `BottomSheet`, `ScreenContainer`, `useKeyboardHeight`, FAB overlay |

**Coverage note:** every FR-01…FR-24 maps to at least one use case and one test case. FR-12 and FR-14 are cross-cutting and also appear in other flows.

---

## 2. Test Environment

| Item | Value |
| --- | --- |
| Date | 2026-11-28 |
| OS | Linux (development), Android not attached |
| Node | v22.23.5 |
| Expo | 58.1.0 |
| React Native | 0.88.1 |
| Database | SQLite v2 (migration verified with `node:sqlite`) |
| TMDB token | Present in local `.env`; live API was not exercised in this automated run |
| Device | No physical Android device/emulator attached |

Because no physical device was attached and live API calls were not part of the automated QA, device-only and live-API cases are marked **Blocked** rather than falsely passing. Pure-function behavior is covered by Jest.

---

## 3. Test Cases

| ID | Requirement | Steps | Expected Result | Status |
| --- | --- | --- | --- | --- |
| TC-001 | FR-01 | Launch app with at least one row in `media`; open Home and Watchlist. | Collection renders; summary counts match; cards show title/type/year/status; no blank screen. | Pass (code review + bundle) |
| TC-002 | FR-02 | Tap +, enter a title manually, select type/status, tap Add. | Row saved; snackbar “Added to collection”; list refreshes; only title required. | Pass (code review) |
| TC-003 | FR-03 | Open an item → Edit → change title/status → Save. | Form pre-filled; saved values persist; “More details” expanded by default. | Pass (code review) |
| TC-004 | FR-04 | Delete an item → confirm → tap Undo within 5 s. | Item removed, snackbar shown; Undo re-inserts; local poster file survives. | Pass (code review) |
| TC-005 | FR-05 | Change status from To Watch → Watching → Completed. | Each change persists; Completed opens the rating sheet. | Pass (code review) |
| TC-006 | FR-06 | Open Details for an item with poster/backdrop/providers. | Hero + overlapping poster + genres + status + rating + where-to-watch + synopsis render. | Pass (code review) |
| TC-007 | FR-07 | Type a partial title and a genre keyword in Watchlist. | Case-insensitive matches; no-results state when nothing matches. | Pass (code review) |
| TC-008 | FR-08 | Open Filter & Sort → select Movie → Apply. | Only movies shown; active chip appears; remove chip restores All. | Pass (code review) |
| TC-009 | FR-09 | Filter status Completed. | Only completed items shown; combine with search works. | Pass (code review) |
| TC-010 | FR-10 | Set rating 4.5 in Edit/Details; clear it. | Valid rating persists; clearing sets null; out-of-range rejected. | Pass (unit: validation) |
| TC-011 | FR-11 | Open Statistics with mixed statuses/types/ratings. | Totals, average, status/type bars match the collection. | Pass (unit: getStatistics via tests) |
| TC-012 | FR-12 | Use an empty DB; select filters with no matches; go offline. | CTA empty state, no-results state, offline banner; no red stack traces. | Pass (code review) |
| TC-013 | FR-13 | Sort by Title, Rating, Year, Recent. | Correct order; null ratings/years last; recent uses `updated_at`. | Pass (unit + code review) |
| TC-014 | FR-14 | Enter 2+ characters with a valid token and internet. | Debounced results (400 ms) show movie/TV only; loading/empty/offline states; stale requests cancelled. | Blocked (live API not exercised) |
| TC-015 | FR-15 | Select a TMDB result; confirm Add. | Poster, backdrop, genre, year, synopsis, providers, TMDB id/link saved; duplicate rejected. | Pass (unit: mapper) / Blocked live API |
| TC-016 | FR-16 | Add manually without poster; then choose a gallery poster. | Genre gradient placeholder shown first; chosen file copied to documents and displayed; old file removed on replace. | Blocked (device: gallery) |
| TC-017 | FR-17 | Show a movie with providers in region ID; wait for stale cache. | Groups Stream/Free/Rent/Buy, “Updated … ago”, refresh button; cache stored in SQLite. | Pass (unit: providerService) / Blocked live API |
| TC-018 | FR-18 | Tap a provider button with/without a verified template. | Verified search URL opens; otherwise TMDB/JustWatch opens; failure shows alert and no crash. | Pass (unit: link builder) / Blocked device |
| TC-019 | FR-19 | View Horror, Comedy, Action, Drama items without posters. | Four distinct layouts and themed placeholders; same metadata in all variants. | Pass (code review) |
| TC-020 | FR-20 | Change status to Completed; save a rating; repeat and Skip. | Sheet appears after Completed; save updates rating; Skip leaves rating unchanged. | Pass (code review) |
| TC-021 | FR-21 | Filter genre Sci-Fi; combine with Movie and search. | Only matching genre tokens shown; chip removable; no data modified. | Pass (unit: filterMedia) |
| TC-022 | FR-22 | Change region ID→US; select subscriptions; reopen cards. | Region saved; ≤20 provider caches refreshed; subscription provider becomes primary on cards; attribution visible. | Blocked (live API/device) |
| TC-023 | FR-23 | Run enrichment on old items with exact and non-exact titles. | Progress/cancel works; exact items auto-filled without overwriting user fields; non-exact goes to Needs review with 3 candidates. | Blocked (live API) |
| TC-024 | FR-24 | Export backup; import v2 and v1 files; import duplicate. | v2 excludes local poster/providers; v1 imports; duplicates skipped; counts reported. | Pass (unit: build/parse) / Import blocked device |
| TC-025 | NFR / DB | Create v1 DB with a row; run migration; inspect schema. | `user_version=2`, 18 columns, row preserved, `app_settings` and `idx_media_tmdb` exist. | Pass (`node:sqlite` migration script) |
| TC-026 | NFR / DB | Insert the same `(tmdb_id,type)` twice. | Second insert fails with UNIQUE constraint. | Pass (`node:sqlite`) |
| TC-027 | NFR-13 | On Android with 3-button navigation, open Find poster, Rate, Filter, Action, Confirm Add, Region, Subscription, and Genre sheets. | Each sheet’s footer/action buttons sit above the navigation bar; nothing is clipped. | Not run (device required) |
| TC-028 | NFR-13 | Repeat TC-027 with gesture navigation. | No overlap and no excessive blank gap below the sheet footer. | Not run (device required) |
| TC-029 | NFR-13 | Open Edit → Find poster; focus search. | Sheet rises above the keyboard; search field and at least 2–3 result cards remain visible; closing the keyboard does not close the sheet. | Not run (device required) |
| TC-030 | NFR-13 | Edit/Manual Add: focus Title, scroll to Description and focus it; scroll to submit. | Focused field is visible above the keyboard; Save/Add button is reachable; optional section is not clipped. | Not run (device required) |
| TC-031 | NFR-13 | Home: scroll through carousels to the end; observe FAB. | FAB is above cards, not clipped, and the last card can scroll clear of it. | Not run (device required) |
| TC-032 | NFR-13 | Watchlist with 100+ items: scroll to the last item. | Last card is fully scrollable above the FAB; list remains responsive. | Not run (device required) |
| TC-033 | NFR-13 | Set system font size to Largest; open tabs, cards, chips, sheets. | No text is clipped; tab labels stay stable; buttons remain usable. | Not run (device required) |
| TC-034 | NFR-13 | Set display size to Largest / use a small 360×640 screen. | No action button or essential content is cut off; sheets remain scrollable. | Not run (device required) |
| TC-035 | NFR-13 | Trigger delete Undo snackbar on Home/Watchlist. | Snackbar is above the tab bar and does not cover the FAB. | Not run (device required) |
| TC-036 | FR-10, NFR-13 | In Rate this title, tap left/right halves of stars; Clear; Save/Skip. | Values are 0.5 steps (first star clamped to 1.0 minimum), Clear resets, footer buttons remain above nav bar. | Not run (device required) |

---

## 4. Acceptance Criteria Verification

Reference: `docs/02-srs.md` §8 and the prompt’s acceptance checklist.

| # | Criterion | Result |
| --- | --- | --- |
| 1 | Add ≤ 4 taps + typing from Home | Pass by design: + → type → result → Add. Live tap count not measured on device. |
| 2 | Poster/genre/year/synopsis/providers auto-filled | Pass in mapper/service code; live API not exercised in this run. |
| 3 | Duplicate `(tmdb_id,type)` rejected | Pass in service + DB unique test. |
| 4 | Airplane mode banner + manual save with title only | Pass by code path; device airplane test not executed. |
| 5 | Missing/invalid token → no crash, manual works | Pass by code path; live invalid-token test not run. |
| 6 | 4 visibly different genre cards | Pass by variant mapping; visual device check pending. |
| 7 | Genre placeholder without poster | Pass in PosterPlaceholder; visual device check pending. |
| 8 | Open on provider + card body opens details | Pass by component structure; device navigation test pending. |
| 9 | Compact Watchlist + Filter sheet + removable chips | Pass by code review. |
| 10 | `⋯` menu + Completed rating sheet | Pass by code review. |
| 11 | Detail hero + where-to-watch + expandable synopsis | Pass by code review. |
| 12 | Settings region/subscriptions/attribution | Pass by code review; live refresh blocked. |
| 13 | DB v1→v2 without data loss | Pass (`node:sqlite` migration test). |
| 14 | Backup v2 + v1 import | v2 build/parse pass; document-picker import blocked (device). |
| 15 | Enrichment exact-match rules | Pass by code + mapper tests; live API blocked. |
| 16 | Lint/doctor/test/bundle; no SQL/fetch in screens | Pass: lint, 32 tests, doctor 20/20, Android export. |
| 17 | Docs 2.1, mermaid valid, no outdated claims | Pass. |
| 18 | README roadmap + AGENTS reflect React Navigation and the real architecture | Pass. |
| 19 | No element obscured by status/navigation bars | Code uses safe-area insets in sheets, forms, FAB, snackbar, and tab bar; device matrix TC-027/028 pending. |
| 20 | Bottom sheets rise above keyboard and keep actions visible | Shared `BottomSheet` uses keyboard height, footer slot, and Modal insets; device matrix TC-027–TC-029 pending. |
| 21 | Only one bottom-sheet implementation | Pass: `ModalSheet` removed; all sheets use `BottomSheet`. Genre year picker remains an anchored popover, not a sheet. |
| 22 | FAB above cards and last item clears it | Code uses absolute-fill overlay with zIndex/elevation and bottom padding; device matrix TC-031/032 pending. |

---

## 5. Automated Command Results

Filled after the final QA run in Phase 8:

| Command | Result |
| --- | --- |
| `npm test -- --runInBand` | 5 suites, 32 tests passed |
| `npx expo lint` | 0 errors, 0 warnings |
| `npx expo-doctor` | 20/20 checks passed |
| `npx expo install --check` | Dependencies are up to date |
| `npx expo export --platform android` | Bundle completed successfully |
| `npx expo start --clear` | Metro started (CI smoke test; no device attached) |
| `npx tsc --noEmit` | Not applicable (no `tsconfig.json`) |
| DB migration script (`node:sqlite`) | Fresh v2 and v1→v2 passed; data preserved; unique index enforced |
| Mermaid validation (mermaid-cli) | 30/30 diagrams rendered |
| Local documentation links | 0 broken links |

---

**End of Document**

Document ID: CT-RTM-001\
Version: 2.1\
Project: CineTrack
