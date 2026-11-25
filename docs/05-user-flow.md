# CineTrack — User Flow Diagram

**Phase:** 3 — System Design\
**Document:** 05-user-flow\
**Project:** CineTrack\
**Status:** Draft

User Flow menggambarkan perjalanan pengguna dari satu halaman ke halaman lainnya. Dokumen ini mengacu pada requirement di `02-srs.md` dan use case di `03-use-case.md`.

## 1. Screen Inventory

Berdasarkan requirement Phase 2, CineTrack memiliki lima area utama:

| Screen        | Fungsi                            | Related FR              |
| ------------- | --------------------------------- | ----------------------- |
| Home          | Menampilkan koleksi dan ringkasan | FR-01, FR-11            |
| Add Media     | Menambahkan film atau series      | FR-02                   |
| Media Details | Melihat informasi tontonan        | FR-06, FR-04, FR-05     |
| Edit Media    | Mengubah informasi tontonan       | FR-03, FR-10            |
| Statistics    | Melihat statistik koleksi         | FR-11                   |

Selain itu, **Watchlist** menjadi halaman koleksi lengkap yang menyediakan search, filter, dan sorting (FR-07, FR-08, FR-09, FR-12).

Untuk navigasi utama (bottom navigation), digunakan tiga bagian:

- Home
- Watchlist
- Statistics

Add Media dapat diakses melalui tombol tambah pada halaman Home atau Watchlist. Media Details diakses dengan memilih sebuah item dari Home atau Watchlist.

## 2. Main Navigation Flow

```mermaid
flowchart TD
    A([Launch App]) --> B[Initialize SQLite]
    B --> C[Load Saved Collection]
    C --> D[Home Screen]

    D <--> E[Watchlist Screen]
    D <--> F[Statistics Screen]
    E <--> F

    D -->|Tap Add Button| G[Add Media Screen]
    E -->|Tap Add Button| G
    D -->|Select Item| H[Media Details]
    E -->|Select Item| H

    G --> G1[Validate Input]
    G1 -->|Valid| G2[Save to SQLite]
    G1 -->|Invalid| G3[Show Validation Error]
    G3 --> G
    G2 --> E

    H -->|Edit| I[Edit Media Screen]
    I --> I1[Validate Changes]
    I1 -->|Valid| I2[Update SQLite]
    I1 -->|Invalid| I3[Show Validation Error]
    I3 --> I
    I2 --> H

    H -->|Delete| J[Delete Confirmation]
    J -->|Confirm| J1[Delete from SQLite]
    J -->|Cancel| H
    J1 --> E
```

## 3. Add Media Flow

```mermaid
flowchart TD
    A([User]) --> B[Tap Add Button]
    B --> C[Display Add Form]
    C --> D[Enter Title]
    D --> E[Select Movie or Series]
    E --> F[Select Viewing Status]
    F --> G[Enter Optional Information]
    G --> H[Tap Save]
    H --> I{Input Valid?}
    I -->|No| J[Display Validation Errors]
    J --> C
    I -->|Yes| K[Insert into SQLite]
    K --> L[Display Success Feedback]
    L --> M[Refresh Collection]
    M --> N([Finish])
```

## 4. Search & Filter Flow

```mermaid
flowchart TD
    A([Open Watchlist]) --> B[Load Collection]
    B --> C[Enter Search Query]
    C --> D[Select Content Type]
    D --> E[Select Viewing Status]
    E --> F[Apply Search and Filters]
    F --> G{Matching Entries?}
    G -->|Yes| H[Display Filtered Collection]
    G -->|No| I[Display No Results]
    H --> J{Change Search or Filter?}
    I --> J
    J -->|Yes| C
    J -->|No| K([Finish])
```

**Design decision:** Search, content-type filter, dan status filter harus bisa digunakan bersamaan. Contohnya, pengguna dapat mencari "Batman", memilih Movie, lalu memilih Completed. Sesuai BR-08, search dan filter tidak boleh mengubah data di database.
