# CineTrack — Wireframe Design

**Phase:** 3 — System Design\
**Document:** 06-wireframes\
**Project:** CineTrack\
**Status:** Draft

Wireframes digunakan untuk menentukan posisi elemen UI sebelum masuk ke tahap visual styling.

Pendekatan yang digunakan adalah *low-fidelity wireframe*: fokus pada layout, navigasi, dan fungsi, bukan warna atau dekorasi. Seluruh wireframe merepresentasikan **dark theme** dengan aksen ungu.

**Legenda:** `[ ... ]` = input atau tombol, `( ... )` = badge atau pilihan, `( + )` = tombol tambah, `<` = tombol kembali.

## 1. Home Screen

**Tujuan:** memberikan ringkasan koleksi dan akses cepat ke fitur utama.\
**Related:** FR-01, FR-11, UC-01, UC-03

```
┌─────────────────────────────────────┐
│ GOOD AFTERNOON                      │
│ My Collection                       │
│                                     │
│ YOUR WATCHLIST                      │
│ 24 Titles                           │
│                                     │
│   12          5           7         │
│   To Watch    Watching    Completed │
│                                     │
│ Recently Added              See All │
│ ─────────────────────────────────── │
│ [Poster]  Interstellar              │
│           Movie · 2014              │
│ ─────────────────────────────────── │
│ [Poster]  Breaking Bad              │
│           Series · 2008             │
│ ─────────────────────────────────── │
│                                     │
│                             ( + )   │
│ ─────────────────────────────────── │
│   Home      Watchlist     Statistics│
└─────────────────────────────────────┘
```

## 2. Watchlist Screen

**Tujuan:** menampilkan seluruh koleksi dan menyediakan search, filter, serta sorting.\
**Related:** FR-01, FR-07, FR-08, FR-09, FR-12, UC-07, UC-08, UC-09, UC-12

```
┌─────────────────────────────────────┐
│ My Watchlist                        │
│                                     │
│ [ Search movies or series...      ] │
│                                     │
│ Type:   [All] [Movie] [Series]      │
│ Status: [All Status] [To Watch]     │
│         [Watching] [Completed]      │
│                                     │
│ 24 results      Sort: Recently Added│
│ ─────────────────────────────────── │
│ [Poster]  Interstellar              │
│           Movie · 2014              │
│           (To Watch)                │
│ ─────────────────────────────────── │
│ [Poster]  Breaking Bad              │
│           Series · 2008             │
│           (Watching)                │
│ ─────────────────────────────────── │
│ [Poster]  Inception                 │
│           Movie · 2010              │
│           (Completed)               │
│ ─────────────────────────────────── │
│                             ( + )   │
│ ─────────────────────────────────── │
│   Home      Watchlist     Statistics│
└─────────────────────────────────────┘
```

Chip filter dapat di-scroll secara horizontal pada layar kecil. Saat tidak ada hasil, tampilkan Empty State.

## 3. Add / Edit Media Screen

**Tujuan:** menyediakan form untuk memasukkan atau memperbarui informasi tontonan.\
**Related:** FR-02, FR-03, FR-05, FR-10, UC-02, UC-04, UC-10

```
┌─────────────────────────────────────┐
│ <  Add New Title                    │
│                                     │
│ Title *                             │
│ [ Enter movie or series title     ] │
│                                     │
│ Content Type *                      │
│ ( Movie )  ( Series )               │
│                                     │
│ Genre                               │
│ [ e.g. Sci-Fi, Action, Drama       ]│
│                                     │
│ Release Year                        │
│ [ e.g. 2025                        ]│
│                                     │
│ Viewing Status *                    │
│ ( To Watch ) ( Watching )           │
│ ( Completed )                       │
│                                     │
│ Personal Rating (optional)          │
│   *  *  *  *  *      - / 5.0        │
│                                     │
│ Description                         │
│ [ Write a short description...     ]│
│ [                                  ]│
│                                     │
│ [           Save Title             ]│
└─────────────────────────────────────┘
```

Tanda `*` menandakan field wajib (title, content type, viewing status). Pada mode Edit, judul halaman menjadi **Edit Title**, seluruh field terisi data yang ada, dan tombol berubah menjadi **Save Changes**.

## 4. Media Details Screen

**Tujuan:** menampilkan informasi lengkap tontonan serta akses ke Edit, Delete, dan perubahan status.\
**Related:** FR-03, FR-04, FR-05, FR-06, UC-03, UC-05, UC-06

```
┌─────────────────────────────────────┐
│ <  Details                      Edit│
│                                     │
│ +--------------------------------+  │
│ |                                |  │
│ |       Poster Placeholder       |  │
│ |                                |  │
│ +--------------------------------+  │
│                                     │
│ Interstellar                        │
│ Movie · 2014 · Sci-Fi               │
│ (To Watch)                          │
│                                     │
│ Personal Rating                     │
│ 4.0 / 5.0                           │
│                                     │
│ Description                         │
│ A science fiction film about a      │
│ journey through space and time.     │
│                                     │
│ Change Viewing Status               │
│ [To Watch] [Watching] [Completed]   │
│                                     │
│ [          Delete Title          ]  │
└─────────────────────────────────────┘
```

Delete selalu menampilkan dialog konfirmasi sebelum data dihapus (BR-07). Field opsional yang kosong ditampilkan sebagai "-".

## 5. Statistics Screen

**Tujuan:** menampilkan ringkasan koleksi pengguna.\
**Related:** FR-11, UC-11

```
┌─────────────────────────────────────┐
│ Your Statistics                     │
│                                     │
│ TOTAL COLLECTION                    │
│ 24 Titles                           │
│                                     │
│   14           10                   │
│   Movies       Series               │
│                                     │
│   5            7                    │
│   Watching     Completed            │
│                                     │
│ Viewing Progress                    │
│ Completed                    7 / 24 │
│ [███████░░░░░░░░░░░░░░░░░░░░░░]     │
│ ─────────────────────────────────── │
│   Home      Watchlist     Statistics│
└─────────────────────────────────────┘
```

## 6. Wireframe Decisions

- Dark background dengan aksen ungu.
- Poster menggunakan placeholder lokal, bukan API.
- Informasi utama ditampilkan dalam card.
- Bottom navigation digunakan untuk tiga area utama.
- Add dan Edit menggunakan struktur form yang sama.
- Detail menyediakan akses ke Edit, Delete, dan perubahan status.
