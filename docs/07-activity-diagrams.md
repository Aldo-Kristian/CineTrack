# CineTrack — Activity Diagrams

**Phase:** 3 — System Design\
**Document:** 07-activity-diagrams\
**Project:** CineTrack\
**Status:** Draft

Activity Diagram menggambarkan alur aktivitas secara lebih detail, termasuk kondisi, percabangan, dan proses yang dilakukan sistem. Diagram dibuat untuk empat proses utama.

## 1. Add Media Activity

Related: FR-02, UC-02.

```mermaid
flowchart TD
    A([Start]) --> B[Open Add Media Form]
    B --> C[Enter Media Information]
    C --> D[Submit Form]
    D --> E{Required Fields Valid?}
    E -->|No| F[Display Validation Error]
    F --> C
    E -->|Yes| G[Validate Optional Fields]
    G --> H{Optional Values Valid?}
    H -->|No| F
    H -->|Yes| I[Insert Record into SQLite]
    I --> J{Insert Successful?}
    J -->|No| K[Display Error Message]
    K --> C
    J -->|Yes| L[Refresh Collection]
    L --> M[Display Success Feedback]
    M --> N([End])
```

## 2. Edit Media Activity

Related: FR-03, UC-04.

```mermaid
flowchart TD
    A([Start]) --> B[Select Media]
    B --> C[Open Media Details]
    C --> D[Select Edit]
    D --> E[Load Existing Data]
    E --> F[Display Edit Form]
    F --> G[Modify Information]
    G --> H[Submit Changes]
    H --> I{Input Valid?}
    I -->|No| J[Display Validation Error]
    J --> G
    I -->|Yes| K[Update SQLite Record]
    K --> L{Update Successful?}
    L -->|No| M[Display Error Message]
    M --> G
    L -->|Yes| N[Refresh Media Details]
    N --> O[Display Success Feedback]
    O --> P([End])
```

## 3. Delete Media Activity

Related: FR-04, UC-05, BR-07.

```mermaid
flowchart TD
    A([Start]) --> B[Select Media]
    B --> C[Open Media Details]
    C --> D[Select Delete]
    D --> E[Display Confirmation Dialog]
    E --> F{Confirm Deletion?}
    F -->|No| G[Close Dialog]
    G --> H[Return to Details]
    H --> Z([End])
    F -->|Yes| I[Delete Record from SQLite]
    I --> J{Deletion Successful?}
    J -->|No| K[Display Error Message]
    K --> H
    J -->|Yes| L[Refresh Collection]
    L --> M[Display Success Feedback]
    M --> Z
```

## 4. Search & Filter Activity

Related: FR-07, FR-08, FR-09, UC-07, UC-08, UC-09, BR-08.

```mermaid
flowchart TD
    A([Start]) --> B[Open Watchlist]
    B --> C[Retrieve Collection]
    C --> D[Enter Search Query]
    D --> E[Select Content Type]
    E --> F[Select Viewing Status]
    F --> G[Apply Combined Filters]
    G --> H{Results Available?}
    H -->|Yes| I[Display Matching Entries]
    H -->|No| J[Display Empty Results]
    I --> K{Modify Search or Filter?}
    J --> K
    K -->|Yes| D
    K -->|No| L([End])
```
