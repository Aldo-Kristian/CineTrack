# CineTrack — Data Dictionary

**Phase:** 3 — System Design\
**Document:** 11-data-dictionary\
**Project:** CineTrack\
**Status:** Draft

Data Dictionary menjelaskan atribut tabel `media` secara terperinci.

## 1. Table: `media`

| Field        | Type    | Required | Description                 |
| ------------ | ------- | -------- | --------------------------- |
| id           | INTEGER | Yes      | Unique identifier           |
| title        | TEXT    | Yes      | Movie or series title       |
| type         | TEXT    | Yes      | MOVIE / SERIES              |
| genre        | TEXT    | No       | Content genre               |
| release_year | INTEGER | No       | Original release year       |
| status       | TEXT    | Yes      | Viewing status              |
| rating       | REAL    | No       | Personal rating             |
| description  | TEXT    | No       | Short description           |
| created_at   | TEXT    | Yes      | Creation timestamp          |
| updated_at   | TEXT    | Yes      | Last modification timestamp |

## 2. Allowed Values

**Type**

| Stored Value | Display Label |
| ------------ | ------------- |
| `MOVIE`      | Movie         |
| `SERIES`     | Series        |

**Status**

| Stored Value | Display Label |
| ------------ | ------------- |
| `TO_WATCH`   | To Watch      |
| `WATCHING`   | Watching      |
| `COMPLETED`  | Completed     |

**Rating**

- Minimum: 1.0
- Maximum: 5.0
- Increment: 0.5 (proposed UI behavior)
- Nullable: Yes

## 3. Sample Data

| id | title        | type   | status    | rating |
| -- | ------------ | ------ | --------- | ------ |
| 1  | Interstellar | MOVIE  | TO_WATCH  | NULL   |
| 2  | Breaking Bad | SERIES | WATCHING  | 4.5    |
| 3  | Inception    | MOVIE  | COMPLETED | 5.0    |
