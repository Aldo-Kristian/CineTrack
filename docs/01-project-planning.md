# Phase 1 — Project Planning

Phase 1 of 6

Kita akan mengembangkan aplikasi **Film & Series To-Do List** menggunakan React Native dan Expo Go dengan pendekatan pengembangan software yang terstruktur.

Sebelum membuat SRS, diagram, dan wireframe, kita harus menetapkan fondasi proyek terlebih dahulu. Semua dokumentasi berikutnya akan mengacu pada keputusan di Phase 1.

## 1.1 Project Overview

# CineTrack

Personal Film & Series Tracker

| Informasi         | Detail                        |
| ----------------- | ----------------------------- |
| Project Name      | CineTrack                     |
| Project Type      | Mobile Application            |
| Platform          | Android                       |
| Framework         | React Native                  |
| Development Tool  | Expo / Expo Go                |
| Storage           | Offline SQLite                |
| UI Theme          | Dark Mode                     |
| Complexity        | Balanced                      |
| Application Model | Single-user application       |
| Main Purpose      | Personal watchlist management |

**Deskripsi proyek**

CineTrack adalah aplikasi mobile untuk membantu pengguna mengelola daftar film dan serial televisi yang ingin ditonton, sedang ditonton, maupun telah selesai ditonton.

Pengguna dapat menyimpan informasi tontonan, mengatur status tontonan, memberikan rating pribadi, serta mencari dan memfilter koleksi mereka. Seluruh data disimpan secara lokal sehingga aplikasi dapat digunakan tanpa koneksi internet.

## 1.2 Problem Statement

Beberapa permasalahan yang ingin diselesaikan:

1. Pengguna sering lupa judul film atau serial yang ingin ditonton.
2. Daftar tontonan tersebar di berbagai tempat seperti catatan pribadi atau aplikasi lain.
3. Pengguna kesulitan membedakan tontonan yang belum dimulai, sedang berlangsung, dan sudah selesai.
4. Pengguna tidak memiliki catatan terpusat mengenai tontonan dan rating pribadi mereka.

**Problem statement:**

Belum adanya pengelolaan watchlist yang sederhana dan terorganisasi dapat menyulitkan pengguna dalam mencatat, melacak, dan mengelola aktivitas menonton film maupun serial.

## 1.3 Project Objectives

Tujuan pengembangan CineTrack:

- Menyediakan tempat penyimpanan daftar film dan series secara terpusat.
- Memungkinkan pengguna melakukan operasi CRUD.
- Mempermudah pelacakan status tontonan.
- Menyediakan fitur pencarian dan filter.
- Memungkinkan pengguna memberikan rating pribadi.
- Menyediakan penyimpanan offline menggunakan database lokal.

## 1.4 Target Users

Target pengguna aplikasi:

- Pengguna yang gemar menonton film dan series.
- Pengguna yang ingin memiliki watchlist pribadi.
- Pengguna yang ingin melacak riwayat tontonan.
- Pengguna yang membutuhkan aplikasi sederhana tanpa registrasi akun.

Aplikasi ini tidak ditujukan untuk streaming atau distribusi konten film.

## 1.5 Project Scope

Bagian ini penting untuk mencegah fitur proyek berkembang terlalu jauh (*scope creep*).

### A. Functional Scope

**Must Have**

| ID    | Fitur             | Deskripsi                                  |
| ----- | ----------------- | ------------------------------------------ |
| FR-01 | View Collection   | Menampilkan seluruh daftar film dan series |
| FR-02 | Add Item          | Menambahkan film atau series               |
| FR-03 | Edit Item         | Mengubah informasi tontonan                |
| FR-04 | Delete Item       | Menghapus tontonan                         |
| FR-05 | Status Management | Mengubah status tontonan                   |
| FR-06 | View Details      | Melihat informasi lengkap tontonan         |

**Should Have**

| ID    | Fitur           | Deskripsi                     |
| ----- | --------------- | ----------------------------- |
| FR-07 | Search          | Mencari berdasarkan judul     |
| FR-08 | Category Filter | Memfilter Movie dan Series    |
| FR-09 | Status Filter   | Memfilter berdasarkan status  |
| FR-10 | Personal Rating | Memberikan rating pribadi 1–5 |

**Could Have**

| ID    | Fitur                | Deskripsi                      |
| ----- | -------------------- | ------------------------------ |
| FR-11 | Dashboard Statistics | Ringkasan jumlah tontonan      |
| FR-12 | Empty State          | Tampilan ketika belum ada data |
| FR-13 | Sort Collection      | Mengurutkan daftar tontonan    |

### B. Non-Functional Scope

| ID     | Requirement      | Target                                                 |
| ------ | ---------------- | ------------------------------------------------------ |
| NFR-01 | Offline Support  | Fitur utama dapat digunakan tanpa internet             |
| NFR-02 | Data Persistence | Data tetap tersedia setelah aplikasi ditutup           |
| NFR-03 | Usability        | Navigasi mudah dipahami                                |
| NFR-04 | Performance      | Daftar tontonan dapat dimuat dengan lancar             |
| NFR-05 | Consistency      | Tampilan menggunakan tema dark secara konsisten        |
| NFR-06 | Compatibility    | Berjalan pada perangkat Android yang mendukung Expo Go |

## 1.6 Project Limitations

Untuk menjaga proyek tetap realistis, berikut batasannya:

1. Aplikasi hanya mendukung satu pengguna lokal.
2. Tidak tersedia fitur registrasi dan login.
3. Tidak ada sinkronisasi cloud.
4. Tidak menyediakan streaming film atau series.
5. Tidak menggunakan API eksternal untuk mengambil informasi film.
6. Poster film tidak wajib menggunakan gambar dari internet.
7. Database hanya tersedia pada perangkat tempat aplikasi diinstal.

Dengan demikian, aplikasi tetap dapat berjalan tanpa bergantung pada layanan eksternal.

## 1.7 Technology Stack

Teknologi yang direncanakan:

| Technology       | Penggunaan                               |
| ---------------- | ---------------------------------------- |
| React Native     | Pengembangan mobile UI                   |
| Expo             | Development environment                  |
| Expo Go          | Menjalankan aplikasi selama pengembangan |
| JavaScript       | Bahasa pemrograman                       |
| SQLite           | Database lokal                           |
| expo-sqlite      | Integrasi SQLite dengan Expo             |
| React Navigation | Navigasi antarhalaman                    |
| StyleSheet       | Styling komponen                         |
| Lucide Icons     | Ikon aplikasi                            |

**Arsitektur penyimpanan**

```
CineTrack Mobile App
React Native + Expo
        │
        ▼
SQLite Database
Local persistent storage
```

Data disimpan di perangkat, bukan pada server eksternal.

**Catatan:** Kita menggunakan `expo-sqlite`, bukan SQLite server. Database akan dikelola langsung oleh aplikasi.

## 1.8 Initial Data Model

Sebagai gambaran awal, satu entitas utama akan digunakan untuk menyimpan film dan series.

| Attribute    | Data Type | Description                     |
| ------------ | --------- | ------------------------------- |
| id           | INTEGER   | Primary key                     |
| title        | TEXT      | Judul film atau series          |
| type         | TEXT      | Movie / Series                  |
| genre        | TEXT      | Genre tontonan                  |
| release_year | INTEGER   | Tahun rilis                     |
| status       | TEXT      | To Watch / Watching / Completed |
| rating       | REAL      | Rating pribadi (1–5)            |
| description  | TEXT      | Deskripsi singkat               |
| created_at   | TEXT      | Waktu data dibuat               |
| updated_at   | TEXT      | Waktu data diperbarui           |

Ini masih rancangan awal, bukan skema database final. Nanti kita lengkapi pada Phase 3.

## 1.9 Project Constraints & Risks

| Risiko / Kendala                     | Penanganan                                         |
| ------------------------------------ | -------------------------------------------------- |
| Keterbatasan pengalaman React Native | Pengembangan bertahap                              |
| Kesalahan operasi database           | Pengujian setiap operasi CRUD                      |
| Data hilang saat aplikasi ditutup    | Menggunakan persistent SQLite                      |
| Scope terlalu luas                   | Memprioritaskan Must Have                          |
| Ketidaksesuaian Expo SDK dan library | Memilih dependency yang kompatibel dengan Expo SDK |
| Tampilan tidak konsisten             | Menggunakan design system sederhana                |

## 1.10 Definition of Done

Phase pengembangan nantinya dianggap berhasil jika:

- Pengguna dapat menambahkan film dan series.
- Pengguna dapat melihat daftar tontonan.
- Pengguna dapat mengedit informasi tontonan.
- Pengguna dapat menghapus tontonan.
- Pengguna dapat mengubah status tontonan.
- Search dan filter berfungsi.
- Rating dapat disimpan.
- Data tetap tersedia setelah aplikasi ditutup dan dibuka kembali.
- Aplikasi dapat digunakan tanpa koneksi internet.

## 1.11 Phase 1 Deliverables

**Project Planning** — Draft completed

Baseline dokumen yang akan menjadi acuan pengembangan.

- Project Overview
- Problem Statement
- Project Objectives
- Target Users
- Functional Scope
- Non-Functional Scope
- Project Limitations
- Technology Stack
- Initial Data Model
- Project Constraints & Risks
- Definition of Done