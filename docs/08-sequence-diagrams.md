# CineTrack — Sequence Diagrams

**Phase:** 3 — System Design\
**Document:** 08-sequence-diagrams\
**Project:** CineTrack\
**Status:** Draft

Sequence Diagram menggambarkan komunikasi antar komponen sistem berdasarkan urutan waktu.

## Participants

| Participant | Responsibility                                                       |
| ----------- | -------------------------------------------------------------------- |
| User        | Melakukan interaksi                                                  |
| UI          | Menampilkan halaman dan menerima input                               |
| Logic       | Memproses aturan aplikasi (`mediaService`, `validationService`, `mediaRepository`) |
| SQLite      | Menyimpan dan mengambil data                                         |

## 1. Add Media Sequence

```mermaid
sequenceDiagram
    actor User
    participant UI as Add Media Screen
    participant Logic as Application Logic
    participant DB as SQLite

    User->>UI: Open Add Form
    UI-->>User: Display Form
    User->>UI: Submit Media Information
    UI->>Logic: Validate Input
    alt Invalid Input
        Logic-->>UI: Validation Errors
        UI-->>User: Display Error Messages
    else Valid Input
        Logic->>DB: INSERT Media Record
        DB-->>Logic: Insert Result
        alt Insert Successful
            Logic-->>UI: Success
            UI-->>User: Display Success Feedback
        else Insert Failed
            Logic-->>UI: Database Error
            UI-->>User: Display Error Message
        end
    end
```

## 2. Edit Media Sequence

```mermaid
sequenceDiagram
    actor User
    participant UI as Edit Media Screen
    participant Logic as Application Logic
    participant DB as SQLite

    User->>UI: Open Edit Screen
    UI->>Logic: Request Media Details
    Logic->>DB: SELECT Media by ID
    DB-->>Logic: Existing Media Data
    Logic-->>UI: Return Media Data
    UI-->>User: Display Existing Information
    User->>UI: Submit Updated Information
    UI->>Logic: Validate Changes
    alt Invalid Input
        Logic-->>UI: Validation Errors
        UI-->>User: Display Errors
    else Valid Input
        Logic->>DB: UPDATE Media Record (incl. updated_at)
        DB-->>Logic: Update Result
        Logic-->>UI: Update Response
        UI-->>User: Display Updated Information
    end
```

## 3. Delete Media Sequence

```mermaid
sequenceDiagram
    actor User
    participant UI as Media Details Screen
    participant Logic as Application Logic
    participant DB as SQLite

    User->>UI: Select Delete
    UI-->>User: Show Confirmation Dialog
    alt User Cancels
        User->>UI: Cancel
        UI-->>User: Return to Details
    else User Confirms
        User->>UI: Confirm Deletion
        UI->>Logic: Delete Media by ID
        Logic->>DB: DELETE FROM media WHERE id = ?
        DB-->>Logic: Delete Result
        Logic-->>UI: Delete Response
        UI-->>User: Show Result
    end
```

## 4. Search & Filter Sequence

```mermaid
sequenceDiagram
    actor User
    participant UI as Watchlist Screen
    participant Logic as Application Logic
    participant DB as SQLite

    User->>UI: Open Watchlist
    UI->>Logic: Request Collection
    Logic->>DB: SELECT All Media
    DB-->>Logic: Collection Data
    Logic-->>UI: Return Collection
    UI-->>User: Display Collection
    User->>UI: Enter Search and Select Filters
    UI->>Logic: Apply Search and Filters
    Logic->>Logic: Combine Filter Conditions
    Logic-->>UI: Filtered Results
    UI-->>User: Display Matching Entries
```

**Catatan desain:** Search dan filter dapat diproses terhadap data yang sudah dimuat dari SQLite untuk koleksi berukuran kecil. Jika koleksi berkembang besar, pemrosesan dapat dipindahkan ke query SQLite.
