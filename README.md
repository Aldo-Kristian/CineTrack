# CineTrack

**Personal Film & Series Tracker — Version 2.0**

![Platform](https://img.shields.io/badge/platform-Android-3DDC84?logo=android&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-Expo-6C4DF6?logo=expo&logoColor=white)
![Database](https://img.shields.io/badge/database-SQLite-003B57?logo=sqlite&logoColor=white)
![Language](https://img.shields.io/badge/language-JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Status](https://img.shields.io/badge/status-2.0.0%20stable-brightgreen)
![Tests](https://img.shields.io/badge/tests-jest--expo-99424F?logo=jest&logoColor=white)

CineTrack is an offline-first mobile app for managing the movies and TV series you want to watch, are currently watching, or have already finished. The collection lives on the device in SQLite. TMDB is an **optional enrichment layer**: search a title once, and CineTrack fills in the poster, backdrop, genres, year, synopsis, and legal streaming providers. If the network or API token is unavailable, every core feature still works.

> **Version 2.0.** New in this release: search-first add flow, automatic posters, genre-themed cards, where-to-watch data, Settings (region + subscriptions), data enrichment for old titles, and backup v2.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Data Model](#data-model)
- [Documentation](#documentation)
- [Roadmap](#roadmap)
- [Scope & Limitations](#scope--limitations)
- [Credits & Attribution](#credits--attribution)
- [Development Workflow](#development-workflow)
- [Revision History](#revision-history)
- [License](#license)

---

## Features

**Search-first collection**

- Tap **+** → type a title → tap a TMDB result → confirm status/rating → **Add to Collection**
- Poster, backdrop, genres, release year, synopsis, and streaming providers fill automatically
- “In collection” badge prevents accidental duplicates (`tmdb_id` + `type` is unique)
- “Can’t find it? Add manually” fallback keeps the app usable offline
- Friendly banners when offline or when `EXPO_PUBLIC_TMDB_TOKEN` is missing/invalid

**Posters**

- Remote TMDB posters cached on disk by `expo-image`
- Custom poster from the photo gallery (`expo-image-picker`), copied into app documents
- Genre-themed placeholder (gradient + icon + initials) when no image exists

**Streaming providers**

- Where to watch grouped by **Stream**, **Free & Ads**, **Rent**, and **Buy**
- Primary card button: **Open on {Provider}** (or **Rent/Buy on {Provider}**)
- Up to three additional provider logos on each card
- Provider availability cached in SQLite with a 7-day TTL; background refresh on app open
- Deep links use verified search templates where available, otherwise the TMDB/JustWatch “Where to watch” page

**Genre-themed cards**

- Four layout variants: `cinematic`, `poster`, `vibrant`, `atmospheric`
- Deterministic primary genre (e.g. Horror > Sci-Fi > Fantasy > … > Drama)
- Accent color and icon per genre; all variants expose the same information

**Organization & tracking**

- Search (case-insensitive, partial), filter by type/status/**genre**, sort by recent/title/rating/year
- Compact Watchlist header with a Filter & Sort bottom sheet and removable active-filter chips
- Overflow `⋯` menu on cards: Change status, Edit, Delete (long-press still works)
- Marking a title **Completed** offers a skippable quick rating sheet
- Delete with confirmation + **Undo** snackbar (data restored, local poster preserved for 6 seconds)
- Personal rating from 1.0 to 5.0

**Home & details**

- Tappable status summary, **Continue Watching**, **Up Next**, **Recently Completed**
- Hero backdrop + overlapping poster, tappable rating, status segmented control
- Where to watch with “Updated … ago” and refresh
- Collapsible synopsis and edit/delete actions

**Settings**

- Region (auto-detected, editable, ISO two-letter code)
- My streaming subscriptions (multi-select; affects card priority)
- Complete existing titles automatically with progress, cancel, and “Needs review”
- Backup & Restore (v2 export; v1 import supported)
- Clear image cache
- About & Credits with TMDB/JustWatch attribution

**Core**

- Add, edit, delete titles; track To Watch / Watching / Completed
- Statistics dashboard (totals, average rating, status and type breakdown)
- JSON backup/restore
- Single local user, no account, dark theme

---

## Tech Stack

| Technology | Purpose |
| --- | --- |
| React Native 0.88 / Expo SDK 58 | Mobile UI framework and runtime |
| JavaScript | Application language (no TypeScript) |
| React Navigation 7 | Bottom tabs + native stack |
| React Context + hooks | Shared collection, settings, snackbar |
| expo-sqlite | Local persistent database (v2 schema) |
| TMDB API v3 | Search, metadata, posters, watch providers |
| expo-image | Cached posters/backdrops/provider logos |
| expo-linear-gradient | Genre gradients and card overlays |
| expo-image-picker | Custom poster from gallery |
| expo-localization | Default region detection |
| expo-file-system | Copying/deleting custom poster files |
| expo-document-picker / expo-sharing | Backup export/import |
| Lucide React Native | Icons |
| StyleSheet | Styling (no UI kit) |
| jest-expo + jest | Unit tests for pure functions |

---

## Getting Started

### Prerequisites

- Node.js LTS and npm
- Git
- An Android phone with **Expo Go** (SDK 58)
- Phone and computer on the same Wi-Fi network
- Optional: a free TMDB account for online features

### Installation

```bash
git clone https://github.com/<your-username>/CineTrack.git
cd CineTrack
npm install
```

Check SDK compatibility:

```bash
npx expo install --check
npx expo-doctor
```

### TMDB token (optional but recommended)

1. Create an account at <https://www.themoviedb.org/signup>.
2. Open <https://www.themoviedb.org/settings/api> and request an API key.
3. Copy the **API Read Access Token (Bearer)** — not the short API key.
4. Create `.env` from the example:

   ```bash
   cp .env.example .env
   ```

5. Fill in:

   ```env
   EXPO_PUBLIC_TMDB_TOKEN=eyJhbGciOi...
   ```

6. Restart with a clean cache:

   ```bash
   npx expo start --clear
   ```

If the token is missing or invalid, the app still runs. The Add screen shows an informational banner and directs you to the manual form.

> **Security note:** `EXPO_PUBLIC_*` variables are embedded in the client bundle. Anyone with the APK can extract the token. This is an accepted risk for this academic project. A production app should use a backend proxy that keeps the token server-side. See [`docs/14-external-api-integration.md`](docs/14-external-api-integration.md).

### EAS builds

The token must also exist in the EAS build environment; `.env` is not uploaded by default.

- EAS dashboard → your project → **Environment variables** → add `EXPO_PUBLIC_TMDB_TOKEN` for the `preview` and `production` environments.
- Or with EAS CLI:

  ```bash
  npx eas-cli@latest env:create \
    --name EXPO_PUBLIC_TMDB_TOKEN \
    --value "<your-token>" \
    --environment preview \
    --visibility sensitive
  ```

Build:

```bash
npx eas-cli@latest build --profile preview
```

`eas.json` defines an internal-distribution APK profile (`preview`) and a production profile.

### Run the app

```bash
npx expo start
```

Scan the QR code with Expo Go.

### Tests and quality checks

```bash
npm test              # jest-expo unit tests
npx expo lint         # ESLint (expo config)
npx expo-doctor       # dependency/config diagnostics
npx expo export --platform android   # production bundle smoke test
```

There is no `tsconfig.json`; the project is JavaScript-only.

### Troubleshooting

| Problem | Suggestion |
| --- | --- |
| QR scans but app won’t load | Same Wi-Fi; allow Node.js through the firewall |
| Dependency warnings | `npx expo install --check` then `npx expo install --fix` |
| Stale bundle or env change | `npx expo start --clear` |
| Online search always fails | Check `.env`, restart with `--clear`, verify the token is the **Read Access Token** |
| No providers for a country | Change region in Settings and refresh |
| Poster picker does not open | Ensure Expo Go has photo access in system settings |

---

## Project Structure

```
CineTrack/
├── __tests__/                     # Jest unit tests (pure functions)
├── assets/                        # App icons and splash assets
├── docs/                          # 01–15 project documentation
├── src/
│   ├── components/                # Reusable UI (cards, sheets, posters, providers)
│   ├── config/                    # Environment helpers (TMDB token)
│   ├── constants/                 # Colors, spacing, genres, themes, providers
│   ├── context/                   # MediaContext + SnackbarContext
│   ├── database/                  # Migrations + repositories
│   ├── hooks/                     # useMedia, useTmdbSearch, useSnackbar, …
│   ├── navigation/                # RootNavigator (stack) + TabNavigator
│   ├── screens/                   # Home, Watchlist, Add, ManualAdd, Details, Edit,
│   │                              # Statistics, Settings, Backup
│   ├── services/                  # mediaService, tmdbClient, tmdbMapper,
│   │                              # providerService, validationService
│   └── utils/                     # formatters, files, links
├── App.js
├── app.json
├── eas.json
├── jest.config.js
├── package.json
└── README.md
```

---

## Architecture

CineTrack keeps a strict layered flow. Screens and components never run SQL or call `fetch` directly.

```mermaid
flowchart TD
    UI["Screens & Components"] --> HOOK["useMedia / useTmdbSearch"]
    HOOK --> CTX["MediaContext / SnackbarContext"]
    CTX --> SVC["mediaService"]
    SVC --> MAPPER["tmdbMapper / providerService"]
    SVC --> CLIENT["tmdbClient"]
    SVC --> REPO["mediaRepository / settingsRepository"]
    REPO --> DB[("SQLite v2")]
    CLIENT --> TMDB["TMDB API v3"]
    CLIENT --> IMG["image.tmdb.org (expo-image disk cache)"]
    TMDB --> JW["JustWatch provider data"]
```

- **SQLite is the source of truth.** Online results are mapped and persisted; cards render from SQLite.
- **Online is optional.** Add, manual add, edit, delete, status, rating, search/filter/sort, statistics, and backup work offline.
- **Provider cache** is stored per title (`providers_json`, `providers_region`, `providers_fetched_at`) with a 7-day TTL.
- **Images** are disk-cached by `expo-image`; custom posters live in the app documents directory.
- **Settings** (`region`, `subscriptions`) live in the `app_settings` table.

**Navigation:** a root native stack contains the bottom tabs (**Home**, **Watchlist**, **Statistics**) plus **AddMedia**, **ManualAdd**, **MediaDetails**, **EditMedia**, **Backup**, and **Settings**.

---

## Data Model

### `media` (v2)

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | INTEGER | Yes | Primary key, auto increment |
| `title` | TEXT | Yes | Must not be blank |
| `type` | TEXT | Yes | `MOVIE` or `SERIES` |
| `genre` | TEXT | No | Comma-separated genres (e.g. `Action, Sci-Fi`) |
| `release_year` | INTEGER | No | |
| `status` | TEXT | Yes | `TO_WATCH`, `WATCHING`, `COMPLETED` |
| `rating` | REAL | No | 1.0–5.0 |
| `description` | TEXT | No | Synopsis |
| `created_at` | TEXT | Yes | Creation timestamp |
| `updated_at` | TEXT | Yes | Updated by application logic |
| `tmdb_id` | INTEGER | No | TMDB id; unique together with `type` |
| `poster_path` | TEXT | No | TMDB poster path (portable) |
| `backdrop_path` | TEXT | No | TMDB backdrop path (portable) |
| `poster_uri` | TEXT | No | Local custom poster URI (not portable) |
| `tmdb_link` | TEXT | No | TMDB/JustWatch watch page |
| `providers_json` | TEXT | No | Normalized provider cache JSON |
| `providers_region` | TEXT | No | Region used for the cache |
| `providers_fetched_at` | TEXT | No | Cache timestamp (ISO 8601) |

`CREATE UNIQUE INDEX idx_media_tmdb ON media(tmdb_id, type) WHERE tmdb_id IS NOT NULL;`

### `app_settings`

| Key | Value example | Purpose |
| --- | --- | --- |
| `region` | `ID` | ISO 3166-1 alpha-2 streaming region |
| `subscriptions` | `[8,119]` | JSON array of TMDB provider ids prioritized on cards |

Migrations are versioned with `PRAGMA user_version`. Fresh installs create schema v2; upgrades from v1 only add columns/tables and preserve all rows. See [`docs/10-database-design.md`](docs/10-database-design.md) and [`docs/11-data-dictionary.md`](docs/11-data-dictionary.md).

---

## Documentation

| Phase | Document | Description |
| --- | --- | --- |
| 1 | [01-project-planning](docs/01-project-planning.md) | Scope, objectives, stack, risks, Definition of Done |
| 2 | [02-srs](docs/02-srs.md) | Software Requirements Specification (FR-01…FR-24) |
| 2 | [03-use-case](docs/03-use-case.md) | Use case diagram and UC-01…UC-21 |
| 2 | [04-requirement-traceability](docs/04-requirement-traceability.md) | RTM + test cases TC-001…TC-024 |
| 3 | [05-user-flow](docs/05-user-flow.md) | Search-first, filter, detail, settings flows |
| 3 | [06-wireframes](docs/06-wireframes.md) | Wireframes incl. four card variants |
| 3 | [07-activity-diagrams](docs/07-activity-diagrams.md) | Add, refresh, deep link, enrichment activities |
| 3 | [08-sequence-diagrams](docs/08-sequence-diagrams.md) | Online/offline sequences |
| 3 | [09-system-architecture](docs/09-system-architecture.md) | Layers, external systems, data flow |
| 3 | [10-database-design](docs/10-database-design.md) | ERD, v2 SQL, v1→v2 migration |
| 3 | [11-data-dictionary](docs/11-data-dictionary.md) | Every column, JSON formats, allowed values |
| 3 | [12-component-design](docs/12-component-design.md) | Components, props, genre→theme table |
| 4 | [13-implementation-plan](docs/13-implementation-plan.md) | Stack, milestones M1–M20, real status |
| 5 | [14-external-api-integration](docs/14-external-api-integration.md) | TMDB endpoints, mapping, cache, risks |
| 5 | [15-decision-log](docs/15-decision-log.md) | Design decisions and trade-offs |
| — | [CHANGELOG](CHANGELOG.md) | Release notes |

---

## Roadmap

The roadmap now reflects the actual code. All milestones below are implemented.

| Milestone | Task | Priority | Status |
| --- | --- | --- | --- |
| M1 | Project initialization | Must | Done |
| M2 | Install dependencies | Must | Done |
| M3 | Folder structure | Must | Done |
| M4 | Theme & reusable components | Must | Done |
| M5 | Navigation setup | Must | Done |
| M6 | SQLite initialization | Must | Done |
| M7 | Create & Read | Must | Done |
| M8 | Update & Delete | Must | Done |
| M9 | Search & Filter | Must | Done |
| M10 | Rating functionality | Must | Done |
| M11 | Statistics | Should | Done |
| M12 | Sorting | Could | Done |
| M13 | Testing & bug fixing | Must | Done (unit tests, migration test, bundle) |
| M14 | Database v2 migration | Must | Done |
| M15 | TMDB service & genre mapping | Must | Done |
| M16 | Search-first Add flow | Must | Done |
| M17 | Posters & genre-themed cards | Must | Done |
| M18 | Home, Watchlist, Detail UX | Must | Done |
| M19 | Settings, enrichment, background refresh | Should | Done |
| M20 | Documentation & QA | Must | Done |

---

## Scope & Limitations

CineTrack is intentionally small and focused.

- Single local user; no registration or login.
- Core features are fully offline. Online enrichment requires internet and a TMDB token, and fails safely.
- **The app does not stream or distribute content.** “Open on …” only opens a legal platform page or the TMDB/JustWatch watch page.
- Streaming availability is region-specific and comes from TMDB/JustWatch. It can lag behind the real world.
- TMDB does not provide per-title deep links for every provider. Verified search templates are used where possible; otherwise the app opens the TMDB/JustWatch page.
- Provider list coverage depends on the region dataset. WeTV, iQIYI, and Paramount+ were not present in the verified `watch_region=ID` dataset at implementation time; if they appear in a future response they are displayed automatically with the fallback link.
- `EXPO_PUBLIC_TMDB_TOKEN` is bundled in the client. A backend proxy is the production-grade alternative.
- No cloud sync. Backup/restore is a manual JSON file; backup v2 excludes local poster paths and provider caches.
- Data exists only on the device where the app is installed.
- Target platform: Android via Expo Go; iOS is supported by the same React Native code but is not the primary test target.

---

## Credits & Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB.

Streaming availability data provided by JustWatch.

TMDB: <https://www.themoviedb.org/> · JustWatch: <https://www.justwatch.com/>

TMDB and JustWatch trademarks belong to their respective owners. The app displays text attribution only (no TMDB logo assets are bundled).

---

## Development Workflow

- `main` contains a stable version.
- Each phase/feature is committed separately.
- Lint, tests, doctor, and a bundle smoke test run before a task is declared done.
- Commit messages follow `feat:`, `fix:`, `docs:`, `refactor:`.

```bash
npm test
npx expo lint
npx expo-doctor
npx expo export --platform android
```

---

## Revision History

| Version | Date | Summary | Reason |
| --- | --- | --- | --- |
| 2.0.0 | 2026-11-28 | Search-first add, TMDB metadata/posters/providers, genre-themed cards, Home/Watchlist/Detail redesign, Settings, enrichment, backup v2, full docs revision | Lecturer consultation + UX fixes |
| 1.0.0 | 2026-11-25 | Initial offline CRUD, search/filter/sort, rating, statistics, backup | Initial release |

---

## License

This project is developed for academic and learning purposes. Add a license of your choice (for example MIT) before publishing publicly.

---

**CineTrack 2.0** — built with React Native, Expo, SQLite, and optional TMDB enrichment.
