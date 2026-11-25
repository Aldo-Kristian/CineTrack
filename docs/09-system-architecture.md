# CineTrack — System Architecture

**Phase:** 3 — System Design\
**Document:** 09-system-architecture\
**Project:** CineTrack\
**Status:** Draft

CineTrack menggunakan pendekatan **Layered Architecture** dengan pemisahan tanggung jawab.

## 1. Architecture Diagram

```mermaid
flowchart TB
    subgraph PL["Presentation Layer"]
        HS[Home Screen]
        WS[Watchlist Screen]
        MD[Media Details Screen]
        AE[Add / Edit Screen]
        SS[Statistics Screen]
        UI[Reusable UI Components]
    end

    subgraph AL["Application Logic Layer"]
        MS[Media Service]
        VS[Validation Service]
        SF[Search & Filter Logic]
        ST[Statistics Logic]
    end

    subgraph DL["Data Access Layer"]
        MR[Media Repository]
    end

    DB[(SQLite Database)]

    HS --> MS
    WS --> SF
    MD --> MS
    AE --> VS
    SS --> ST
    MS --> MR
    VS --> MS
    SF --> MR
    ST --> MR
    MR --> DB
```

## 2. Layer Responsibilities

| Layer             | Responsibilities                                      |
| ----------------- | ----------------------------------------------------- |
| Presentation      | Screens, forms, cards, navigation                     |
| Application Logic | CRUD rules, validation, search, filtering, statistics |
| Data Access       | Database queries and data persistence                 |
| Database          | Local SQLite storage                                  |

**Kenapa menggunakan arsitektur ini?**

Kita tidak ingin seluruh logika database ditulis langsung di dalam komponen UI. Dengan memisahkan layer, perubahan database tidak harus membuat seluruh halaman ditulis ulang.

## 3. Data Flow

```mermaid
flowchart LR
    A([User Interaction]) --> B[React Native UI]
    B --> C[Application Logic]
    C --> D[Media Repository]
    D --> E[(SQLite)]
    E -.->|Result| D
    D -.->|Data| C
    C -.->|State| B
    B --> F([Updated UI])
```

## 4. Architecture Decisions Summary

| Area             | Decision                    |
| ---------------- | --------------------------- |
| Framework        | React Native                |
| Runtime          | Expo Go                     |
| Language         | JavaScript                  |
| Navigation       | React Navigation            |
| Database         | SQLite                      |
| Database Library | expo-sqlite                 |
| Architecture     | Layered Architecture        |
| Database Entity  | Single `media` table        |
| Main Navigation  | Home, Watchlist, Statistics |
| UI Theme         | Dark                        |
| External API     | Not required                |
| Authentication   | Not required                |

## 5. Implementation Notes

Tiga hal yang perlu diingat ketika implementasi nanti:

1. Expo Go memiliki batas kompatibilitas library. Dependency harus dipasang menggunakan `npx expo install` agar versinya sesuai dengan Expo SDK proyek.
2. SQLite perlu diinisialisasi sebelum halaman yang membutuhkan data dijalankan.
3. Statistik, search, dan filter harus mengambil data dari sumber yang sama agar hasilnya konsisten.
