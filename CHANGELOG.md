# Changelog

All notable changes to CineTrack are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project follows semantic versioning for releases.

## [2.1.0] — 2026-11-28

### Added

- Shared `BottomSheet` with nested `SafeAreaProvider`, keyboard-aware positioning, fixed header, scrollable body, sticky footer, and max width 640 dp.
- `ScreenContainer` for keyboard-aware form screens.
- `useKeyboardHeight` hook (Android `keyboardDidShow/Hide`, iOS `keyboardWillShow/Hide`).
- `src/constants/layout.js` tokens (`MAX_CONTENT_WIDTH`, FAB, sheet, tab bar, minimum touch size).
- Manual adaptive-layout test matrix TC-027…TC-036 in `docs/04`.
- NFR-13 Adaptive Layout in the SRS.

### Changed

- All bottom sheets (Find poster, Confirm Add, Filter, Action, Rating, Region, Subscription, Genre) now use the single `BottomSheet`; `ModalSheet` removed.
- `RatingInput` replaced the −/+/× row with five tappable stars (left half = .5, right half = full), a Clear action, and accessible values.
- Forms use `ScreenContainer` with KAV `behavior="padding"` on both platforms; focused Description scrolls above the keyboard.
- `FloatingAddButton` is a last-sibling absolute overlay with `pointerEvents="box-none"`, high zIndex/elevation, and keyboard hiding.
- Home/Watchlist reserve scroll bottom padding for the FAB; poster carousel width is computed from the window (140–200 dp).
- Snackbar sits above the FAB and tab bar.
- Tab bar hides on keyboard and disables label font scaling.
- Content width is capped at 640 dp for forms, sheets, lists, settings, details, statistics, and backup.
- App/package version bumped to 2.1.0; documentation revised to 2.1.

### Fixed

- Edit/Manual Add: keyboard no longer covers the lower form; focused Title/Description and the submit action remain reachable.
- “Find poster & info”: sheet rises above the keyboard, keeps the search field/header visible, uses a scrollable FlatList, and no longer clips under the navigation bar.
- “Rate this title”: Skip/Save footer is always above the navigation bar; the rating control no longer overlaps/cuts “Not rated”.
- Home: FAB is no longer clipped or drawn under carousel cards; the last item can scroll clear of it.
- Year picker panel accounts for the bottom navigation inset.
- Bottom sheets respect both 3-button and gesture navigation insets.

## [2.0.0] — 2026-11-28

### Added

- Search-first add flow: type a title, pick a TMDB result, confirm status/rating, add.
- TMDB API v3 integration (`search/multi`, movie/TV details, watch providers, provider catalog, genres, images).
- Automatic poster/backdrop, genres, release year, synopsis, TMDB id/link, and streaming providers.
- “In collection” detection and duplicate rejection via unique `(tmdb_id, type)`.
- Manual add fallback with only Title required and collapsible “More details (optional)”.
- Custom poster picker (2:3 gallery image, copied into app documents).
- CineTrack logo, adaptive app icon, monochrome Android icon, splash screen, and in-app `BrandLogo` branding (Home wordmark + Settings/About mark).
- Genre-themed placeholder (gradient + icon + initials) when no poster exists.
- Four genre card variants: `cinematic`, `poster`, `vibrant`, `atmospheric`.
- Provider buttons/logos on cards and grouped where-to-watch on Details.
- Verified deep-link templates for Netflix, Prime Video, Apple TV/Apple TV+, YouTube, Google Play Movies, Vidio, Viu; TMDB/JustWatch fallback otherwise.
- Home sections: Continue Watching, Up Next, Recently Completed; tappable status summary.
- Watchlist Filter & Sort bottom sheet (type, status, genre, sort) with active-filter chips and a filter count badge.
- Card overflow `⋯` actions: Change status, Edit, Delete; long-press remains a shortcut.
- Skippable quick-rating sheet when a title becomes Completed.
- Delete confirmation with snackbar Undo (reinserts data; local poster preserved for 6 s).
- Settings screen: Region, My streaming subscriptions, Complete existing titles, Backup & Restore, Clear image cache, About & Credits.
- Region detection via `expo-localization`, fallback `ID`; region stored in `app_settings`.
- Provider catalog for subscriptions (online) with known-provider fallback.
- “Complete my existing titles automatically”: sequential progress, cancel, exact-match auto-apply, “Needs review” with top 3 candidates, keep/replace prompt.
- Background provider refresh on app open for eligible `TO_WATCH`/`WATCHING` titles (max 20, 250 ms delay).
- Database schema v2: 8 new `media` columns, partial unique index, `app_settings` table, transactional v1→v2 migration.
- Backup v2: portable fields only; v1 import support.
- Jest + jest-expo unit tests (32 tests) for genres, TMDB mapping, providers, validation, backup/filtering.
- Documentation: revised README/AGENTS and docs 01–13; added docs 14 (external API), docs 15 (decision log), and this changelog.
- `.env.example`, `.gitignore` for `.env`, `jest.config.js`, ESLint flat config.

### Changed

- Add flow is now search-first; the old long manual form became the fallback.
- Watchlist header reduced from four control rows to search + Filter button + chips.
- Details redesigned with hero overlay, tappable rating, status control, where-to-watch, expandable synopsis.
- Home replaces a single “Recently Updated” list with carousels and genre-themed completed cards.
- Genre theme selection is deterministic via `getPrimaryGenre`.
- Provider cache refresh no longer bumps `updated_at`.
- `Auth` and `429` errors have explicit friendly messages.
- App version bumped to `2.0.0`; package version bumped to `2.0.0`.
- `MediaContext` now exposes settings, TMDB add/preview, provider refresh, enrichment, match apply, and restore actions.
- README roadmap marks M1–M20 as done and reflects the real architecture.

### Fixed

- v1 data is preserved during schema upgrade; fresh installs and upgrades converge to the same v2 schema.
- Deleting a title no longer leaves an orphan local poster after the Undo window.
- Provider cache is invalidated when the region changes or after 7 days.
- Empty/offline/token errors no longer produce blank screens or stack traces.
- `GenderPicker`/`YearPicker` lint issues from legacy ref access and effect state updates.
- Removed dead components (`FilterTabs`, `StatusFilter`, `SortSelector`), unused `utils/alerts.js`, and `BackupScreen.js.bak`.
- Removed BOM characters from source files.

### Documentation

- README: new features, tech stack, TMDB setup/EAS env, real structure, data model, roadmap, limitations, credits.
- AGENTS: React Navigation (not Expo Router), layered rules, DB v2, env, tests, EAS.
- docs/01–13: revised to v2.0 with revision history.
- docs/14: external API integration, mapping, cache, errors, provider IDs, deep-link limits, token risk.
- docs/15: decision log.
- CHANGELOG: this file.

## [1.0.0] — 2026-11-25

### Added

- Initial offline-first CineTrack release.
- Local SQLite collection (single `media` table).
- Add/edit/delete movies and series.
- Viewing status: To Watch, Watching, Completed.
- Personal rating (1–5).
- Search, type/status filters, sorting.
- Statistics dashboard.
- JSON backup/restore.
- Dark Netflix-style theme, React Navigation tabs/stack, Lucide icons.
- Initial project documentation (01–13).

---

**Attribution:** This product uses the TMDB API but is not endorsed or certified by TMDB. Streaming availability data provided by JustWatch.
