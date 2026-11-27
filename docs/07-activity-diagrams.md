# CineTrack — Activity Diagrams

**Document ID:** CT-ACT-001\
**Version:** 2.0\
**Status:** Final\
**Phase:** 3 — System Design\
**Project:** CineTrack\
**Last updated:** 2026-11-28

## Revision History

| Version | Date | Summary | Reason |
| --- | --- | --- | --- |
| 2.0 | 2026-11-28 | Added search/add TMDB, provider refresh/TTL, open-on-platform fallback, enrichment, rating-on-complete; revised edit/delete | Lecturer consultation + UX fixes |
| 1.0 | 2026-11-25 | Initial add/edit/delete/search activities | Project setup |

---

Activity diagrams describe branches, decisions, and system actions. Provider/network failures always end in a safe, explainable state.

## 1. Search & Add from TMDB

Related: FR-02, FR-14, FR-15, FR-16, FR-21, UC-13.

```mermaid
flowchart TD
    A([Start]) --> B[Open Add Media]
    B --> C[Focus search field]
    C --> D[User types query]
    D --> E{Length >= 2?}
    E -->|No| D
    E -->|Yes| F[Debounce 400 ms]
    F --> G{Token configured?}
    G -->|No| H[Show info banner + manual link]
    H --> Z([Manual add])
    G -->|Yes| I[GET /search/multi]
    I --> J{Request result}
    J -->|Timeout/offline| K[Show offline banner + manual link]
    K --> Z
    J -->|401/429/error| L[Show friendly error]
    L --> Z
    J -->|Empty| M[Show empty state]
    M --> Z
    J -->|Results| N[Filter people, show movie/TV]
    N --> O{Already tmdb_id + type?}
    O -->|Yes| P[Badge In collection, disabled]
    O -->|No| Q[User taps result]
    Q --> R[GET details + watch/providers]
    R --> S{Details ok?}
    S -->|No| T[Use basic search metadata]
    S -->|Yes| U[Map metadata + providers]
    T --> V[Show Confirm Add Sheet]
    U --> V
    V --> W[Choose status / optional rating]
    W --> X[Add to Collection]
    X --> Y{Valid + unique?}
    Y -->|No| V
    Y -->|Yes| AA[INSERT SQLite]
    AA --> AB[Refresh + snackbar]
    AB --> AC([End])
```

## 2. Manual Add (Offline Fallback)

Related: FR-02, FR-16, UC-14.

```mermaid
flowchart TD
    A([Start]) --> B[Open Manual Add]
    B --> C[Enter title]
    C --> D[Type defaults Movie / Status To Watch]
    D --> E{Open More details?}
    E -->|No| F[Submit]
    E -->|Yes| G[Genre / Year / Rating / Description]
    G --> H{Choose poster?}
    H -->|Yes| I[Open gallery picker]
    I --> J[Crop 2:3 + copy to documents]
    J --> F
    H -->|No| F
    F --> K{Title valid?}
    K -->|No| L[Inline error]
    L --> C
    K -->|Yes| M[INSERT SQLite]
    M --> N[Snackbar Added]
    N --> O([End])
```

## 3. Refresh Provider Cache (TTL)

Related: FR-17, UC-15, NFR-09.

```mermaid
flowchart TD
    A([Open Details / App Start]) --> B[Read providers_json + region + fetched_at]
    B --> C{Same region?}
    C -->|No| D[Mark stale]
    C -->|Yes| E{Age > 7 days or empty?}
    E -->|No| F[Use cache]
    E -->|Yes| D
    D --> G{Token + online?}
    G -->|No| H[Keep cache / neutral offline message]
    G -->|Yes| I[GET /movie or /tv watch/providers]
    I --> J{Request ok?}
    J -->|No| K[Log / keep cache, no blocking]
    J -->|Yes| L[Normalize Stream/Free/Rent/Buy]
    L --> M[UPDATE providers_* only]
    M --> N[Refresh UI]
    F --> N
    H --> N
    K --> N
    N --> O([End])
```

## 4. Open on Streaming Platform

Related: FR-18, UC-16.

```mermaid
flowchart TD
    A([Tap provider button]) --> B[provider_id + media title + tmdb link]
    B --> C{Verified template?}
    C -->|Yes| D["Replace {title} with encodeURIComponent"]
    C -->|No| E{TMDB/JustWatch link?}
    E -->|No| F[Alert Cannot open the link]
    E -->|Yes| G[Use fallback link]
    D --> H[Linking.openURL]
    G --> H
    H --> I{Opened?}
    I -->|Yes| J([Platform or browser])
    I -->|No| F
```

## 5. Enrich Existing Titles

Related: FR-23, UC-18.

```mermaid
flowchart TD
    A([Start enrichment]) --> B[Collect items without tmdb_id]
    B --> C{Any items?}
    C -->|No| D[Alert Already complete]
    C -->|Yes| E[For each item sequentially]
    E --> F[Search TMDB by title]
    F --> G{Exact title + type + year?}
    G -->|Yes| H[Fetch details + providers]
    H --> I[Fill only missing fields + tmdb_id/poster]
    I --> J[UPDATE SQLite]
    G -->|No| K{Results exist?}
    K -->|Yes| L[Add to Needs review with top 3]
    K -->|No| M[Count as failed/skip]
    J --> N{More items?}
    L --> N
    M --> N
    N -->|Yes| O[Wait ~250 ms]
    O --> E
    N -->|No| P[Show summary + review list]
    P --> Q([End])
    E --> R{Cancelled?}
    R -->|Yes| S[Stop after current request]
    S --> P
```

## 6. Quick Rate on Complete

Related: FR-20, UC-21.

```mermaid
flowchart TD
    A([User changes status]) --> B{New status Completed?}
    B -->|No| C[Persist status]
    C --> D([End])
    B -->|Yes| E[Persist Completed]
    E --> F[Show rating sheet]
    F --> G{User action}
    G -->|Skip| H([Status kept, rating unchanged])
    G -->|Save| I{Valid 1-5?}
    I -->|No| F
    I -->|Yes| J[UPDATE rating]
    J --> K([End])
```
