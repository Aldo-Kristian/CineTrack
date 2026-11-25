# CineTrack

**Personal Film & Series Tracker**

![Platform](https://img.shields.io/badge/platform-Android-3DDC84?logo=android&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-Expo-6C4DF6?logo=expo&logoColor=white)
![Database](https://img.shields.io/badge/database-SQLite-003B57?logo=sqlite&logoColor=white)
![Language](https://img.shields.io/badge/language-JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Status](https://img.shields.io/badge/status-in%20development-orange)

CineTrack is an offline-first mobile app for managing the movies and TV series you want to watch, are currently watching, or have already finished. Everything is stored locally on your device with SQLite. No account, no internet connection, and no external API are required.

> **Project status:** In development. The planning, requirements, and design phases are complete; implementation is progressing milestone by milestone (see [Roadmap](#roadmap)).

---

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
- [Development Workflow](#development-workflow)
- [License](#license)

---

## Features

**Core**

- View your entire movie and series collection
- Add, edit, and delete titles
- Track viewing status: *To Watch*, *Watching*, *Completed*
- View full details of each title

**Organization**

- Search by title (case-insensitive, partial match)
- Filter by content type (Movie / Series) and viewing status
- Combine search and filters at the same time
- Personal rating from 1.0 to 5.0 (optional)

**Extras**

- Collection statistics dashboard
- Sorting (A–Z, Z–A, recently added)
- Empty states for new or filtered-out collections
- Consistent dark theme

**Design principles**

- Works fully offline
- Data persists after the app is closed
- Single local user, no registration or login
- Input validation before any data is saved

---

## Tech Stack

| Technology                      | Purpose                         |
| ------------------------------- | ------------------------------- |
| React Native                    | Mobile UI framework             |
| Expo / Expo Go                  | Development environment/runtime |
| JavaScript                      | Programming language            |
| expo-sqlite                     | Local persistent database       |
| React Navigation                | Bottom tabs and native stack    |
| React Context + `useReducer`    | Shared application state        |
| StyleSheet                      | Component styling               |
| Lucide React Native             | Icons                           |
| Git & GitHub                    | Version control                 |

---

## Getting Started

### Prerequisites

- **Windows 11** (commands below use PowerShell; macOS/Linux work with the same npm commands)
- **Node.js** (LTS recommended) and **npm**
- **Git**
- An **Android phone** with the [Expo Go](https://expo.dev/go) app installed
- Phone and computer connected to the **same Wi-Fi network**

Verify your tools:

```powershell
node -v
npm -v
git --version
```

### Installation

Clone the repository and install dependencies:

```powershell
git clone https://github.com/<your-username>/CineTrack.git
cd CineTrack
npm install
```

Check that all packages match the installed Expo SDK:

```powershell
npx expo install --check
npx expo-doctor
```

### Run the App

```powershell
npx expo start
```

Then open **Expo Go** on your Android phone and scan the QR code shown in the terminal.

### Starting From Scratch

This is how the project was initialized, in case you need to recreate it:

```powershell
# 1. Create the project (blank JavaScript template)
cd "$HOME\Documents"
npx create-expo-app@latest CineTrack --template blank
cd CineTrack

# 2. Install navigation
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context

# 3. Install SQLite
npx expo install expo-sqlite

# 4. Install icons
npx expo install react-native-svg
npm install lucide-react-native
```

> Use `npx expo install` for native packages so versions stay compatible with your Expo SDK.

### Troubleshooting

| Problem                              | Suggestion                                                                 |
| ------------------------------------ | -------------------------------------------------------------------------- |
| QR code scans but the app won't load | Confirm phone and PC are on the same Wi-Fi; check the Windows firewall prompt for Node.js |
| Dependency version warnings          | Run `npx expo install --check` and accept the suggested fixes              |
| Stale bundle or odd behavior         | Restart with `npx expo start --clear`                                      |
| Setup problems of unknown cause      | Run `npx expo-doctor` and review its report                                |

---

## Project Structure

Planned structure (folders are created progressively from Milestone 3):

```
CineTrack/
├── docs/                      # Project documentation (01–13)
├── assets/
│   ├── images/
│   └── icons/
├── src/
│   ├── components/            # Reusable UI components
│   ├── screens/               # Application screens
│   ├── navigation/            # Tab and stack navigators
│   ├── database/              # SQLite setup and repository
│   ├── services/              # Business logic and validation
│   ├── context/               # Shared state (Context + useReducer)
│   ├── hooks/                 # Custom hooks (useMedia)
│   ├── constants/             # Colors and media options
│   └── utils/                 # Helper functions
├── App.js
├── app.json
├── package.json
└── README.md
```

---

## Architecture

CineTrack follows a layered architecture so that UI code never talks to the database directly.

```
Screens (Presentation)
        │
        ▼
useMedia Hook → Media Context (useReducer)
        │
        ▼
Media Service (rules, validation, search & filter)
        │
        ▼
Media Repository (SQL queries)
        │
        ▼
SQLite Database (local storage)
```

- **SQLite** is the permanent source of truth.
- **React Context** holds only the active application state (`mediaList`, `isLoading`, `error`).
- Search, filter, and sort state live in the Watchlist screen and are computed from the same shared list, keeping Home, Watchlist, and Statistics consistent.

**Navigation:** a root stack contains the main bottom tabs (**Home**, **Watchlist**, **Statistics**) plus the **AddMedia**, **MediaDetails**, and **EditMedia** screens.

---

## Data Model

CineTrack uses a single `media` table for both movies and series.

| Field          | Type    | Required | Notes                              |
| -------------- | ------- | -------- | ---------------------------------- |
| `id`           | INTEGER | Yes      | Primary key, auto increment        |
| `title`        | TEXT    | Yes      | Must not be blank                  |
| `type`         | TEXT    | Yes      | `MOVIE` or `SERIES`                |
| `genre`        | TEXT    | No       |                                    |
| `release_year` | INTEGER | No       |                                    |
| `status`       | TEXT    | Yes      | `TO_WATCH`, `WATCHING`, `COMPLETED` |
| `rating`       | REAL    | No       | 1.0 – 5.0                          |
| `description`  | TEXT    | No       |                                    |
| `created_at`   | TEXT    | Yes      | Creation timestamp                 |
| `updated_at`   | TEXT    | Yes      | Updated by application logic       |

See [`docs/10-database-design.md`](docs/10-database-design.md) and [`docs/11-data-dictionary.md`](docs/11-data-dictionary.md) for the full schema.

---

## Documentation

The project is developed with a structured, document-first approach. All documents live in [`docs/`](docs/).

| Phase | Document                                                        | Description                            |
| ----- | --------------------------------------------------------------- | -------------------------------------- |
| 1     | [01-project-planning](docs/01-project-planning.md)              | Scope, objectives, stack, risks        |
| 2     | [02-srs](docs/02-srs.md)                                        | Software Requirements Specification    |
| 2     | [03-use-case](docs/03-use-case.md)                              | Use case diagram and descriptions      |
| 2     | [04-requirement-traceability](docs/04-requirement-traceability.md) | Requirement Traceability Matrix     |
| 3     | [05-user-flow](docs/05-user-flow.md)                            | User flow diagrams                     |
| 3     | [06-wireframes](docs/06-wireframes.md)                          | Low-fidelity wireframes                |
| 3     | [07-activity-diagrams](docs/07-activity-diagrams.md)            | Activity diagrams                      |
| 3     | [08-sequence-diagrams](docs/08-sequence-diagrams.md)            | Sequence diagrams                      |
| 3     | [09-system-architecture](docs/09-system-architecture.md)        | Layered architecture and data flow     |
| 3     | [10-database-design](docs/10-database-design.md)                | ERD and SQLite schema                  |
| 3     | [11-data-dictionary](docs/11-data-dictionary.md)                | Field definitions and allowed values   |
| 3     | [12-component-design](docs/12-component-design.md)              | Component and folder design            |
| 4     | [13-implementation-plan](docs/13-implementation-plan.md)        | Stack, structure, milestones, workflow |

---

## Roadmap

Development proceeds one milestone at a time. A feature is not started until the previous foundation works.

| Milestone | Task                        | Priority | Status      |
| --------- | --------------------------- | -------- | ----------- |
| M1        | Project initialization      | Must     | In progress |
| M2        | Install dependencies        | Must     | In progress |
| M3        | Folder structure            | Must     | Planned     |
| M4        | Theme & reusable components | Must     | Planned     |
| M5        | Navigation setup            | Must     | Planned     |
| M6        | SQLite initialization       | Must     | Planned     |
| M7        | Create & Read               | Must     | Planned     |
| M8        | Update & Delete             | Must     | Planned     |
| M9        | Search & Filter             | Must     | Planned     |
| M10       | Rating functionality        | Must     | Planned     |
| M11       | Statistics                  | Should   | Planned     |
| M12       | Sorting                     | Could    | Planned     |
| M13       | Testing & bug fixing        | Must     | Planned     |

---

## Scope & Limitations

CineTrack is intentionally small and focused.

- Single local user; no registration or login
- No cloud sync or backup
- No streaming or content distribution
- No external movie API; posters use local placeholders
- Data exists only on the device where the app is installed
- Target platform: Android via Expo Go

---

## Development Workflow

- `main` always contains a stable version.
- Each feature is built on its own branch (for example `feature/database`, `feature/media-crud`).
- Changes are tested before merging.
- Commit messages follow a simple convention:

```bash
git commit -m "feat: add media CRUD operations"
git commit -m "fix: validate media form inputs"
git commit -m "docs: update implementation plan"
```

---

## License

This project is developed for academic and learning purposes. Add a license of your choice (for example MIT) before publishing publicly.

---

**CineTrack** — built with React Native, Expo, and SQLite.
