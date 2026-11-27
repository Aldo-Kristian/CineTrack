# CineTrack — Data Dictionary

**Document ID:** CT-DD-001\
**Version:** 2.0\
**Status:** Final\
**Phase:** 3 — System Design\
**Project:** CineTrack\
**Last updated:** 2026-11-28

## Revision History

| Version | Date | Summary | Reason |
| --- | --- | --- | --- |
| 2.0 | 2026-11-28 | Added v2 columns, `app_settings`, provider JSON format, allowed values, poster path/uri distinction | Lecturer consultation + UX fixes |
| 1.0 | 2026-11-25 | Initial `media` dictionary | Project setup |

---

## 1. Table: `media` (Schema v2)

| Field | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | INTEGER | Yes | auto | Unique identifier (primary key) |
| `title` | TEXT | Yes | — | Movie/series title; non-blank |
| `type` | TEXT | Yes | — | `MOVIE` or `SERIES` |
| `genre` | TEXT | No | NULL | Comma-separated genres, e.g. `Action, Sci-Fi` |
| `release_year` | INTEGER | No | NULL | Original release year |
| `status` | TEXT | Yes | `TO_WATCH` | Viewing status |
| `rating` | REAL | No | NULL | Personal rating 1.0–5.0 |
| `description` | TEXT | No | NULL | Synopsis/notes |
| `created_at` | TEXT | Yes | `CURRENT_TIMESTAMP` | Creation timestamp (UTC `YYYY-MM-DD HH:MM:SS`) |
| `updated_at` | TEXT | Yes | `CURRENT_TIMESTAMP` | Last user modification timestamp |
| `tmdb_id` | INTEGER | No | NULL | TMDB id; unique together with `type` |
| `poster_path` | TEXT | No | NULL | TMDB poster path, e.g. `/abc.jpg` |
| `backdrop_path` | TEXT | No | NULL | TMDB backdrop path, e.g. `/def.jpg` |
| `poster_uri` | TEXT | No | NULL | Local custom poster `file://…` in app documents |
| `tmdb_link` | TEXT | No | NULL | TMDB/JustWatch watch page |
| `providers_json` | TEXT | No | NULL | Normalized provider cache (JSON) |
| `providers_region` | TEXT | No | NULL | Region used for the cache (e.g. `ID`) |
| `providers_fetched_at` | TEXT | No | NULL | ISO 8601 timestamp of the last provider fetch |

### Field semantics

- **`poster_path` vs `poster_uri`:** `poster_path` is a TMDB path and is portable. `poster_uri` is a device-local file and is excluded from backup. The UI prefers `poster_uri`, then `poster_path`, then the themed placeholder.
- **`providers_region`:** If it differs from the current Settings region, the cache is treated as stale and refreshed when online.
- **`providers_fetched_at`:** Empty/null means “never fetched”. Older than 7 days means stale.
- **`updated_at`:** Provider cache refresh does not change it.

## 2. Table: `app_settings`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `key` | TEXT | Yes | Primary key |
| `value` | TEXT | Yes | String value (JSON for arrays) |

### Known keys

| Key | Format | Example | Purpose |
| --- | --- | --- | --- |
| `region` | ISO 3166-1 alpha-2 | `ID` | Streaming availability region |
| `subscriptions` | JSON array of TMDB provider ids | `[8,119,158]` | Preferred providers for the primary card button |

Unknown keys are allowed but ignored. `setSetting` uses an upsert (`ON CONFLICT DO UPDATE`).

## 3. `providers_json` Format

Stored as a JSON string. Each provider keeps the TMDB `provider_id`, name, `logo_path`, `display_priority`, and a `kind` used by the UI.

```json
{
  "stream": [
    {
      "provider_id": 8,
      "provider_name": "Netflix",
      "logo_path": "/t2yyOv40HZeVlLjYsCsPHnWLk4W.jpg",
      "display_priority": 0,
      "kind": "stream"
    }
  ],
  "free": [
    {
      "provider_id": 192,
      "provider_name": "YouTube",
      "logo_path": "/oIkQkEkwfmcG7IGpRR1NB8frZZM.jpg",
      "display_priority": 15,
      "kind": "free"
    }
  ],
  "rent": [
    {
      "provider_id": 2,
      "provider_name": "Apple TV",
      "logo_path": "/peURlLlr8jggOwK53fJ5wdQl05y.jpg",
      "display_priority": 4,
      "kind": "rent"
    }
  ],
  "buy": [
    {
      "provider_id": 3,
      "provider_name": "Google Play Movies",
      "logo_path": "/tbEdFQDwx5LEVr8WpSeXQSIirVq.jpg",
      "display_priority": 6,
      "kind": "buy"
    }
  ],
  "link": "https://www.themoviedb.org/movie/550-fight-club/watch?locale=ID"
}
```

Normalization rules:

- `flatrate` → `stream`
- `free` + `ads` → `free` (deduplicated by provider id)
- `rent` → `rent`
- `buy` → `buy`
- Sorted by `display_priority` ascending.
- `link` is the TMDB/JustWatch watch page.
- Unknown/malformed JSON → empty groups `{ stream: [], free: [], rent: [], buy: [], link: null }`.

## 4. Allowed Values

### Type

| Stored Value | Display Label |
| --- | --- |
| `MOVIE` | Movie |
| `SERIES` | Series |

### Status

| Stored Value | Display Label |
| --- | --- |
| `TO_WATCH` | To Watch |
| `WATCHING` | Watching |
| `COMPLETED` | Completed |

### Rating

- Minimum: 1.0
- Maximum: 5.0
- Step: 0.5
- Nullable: Yes
- Cleared rating stored as `NULL`

### Genre

- Stored as a comma-separated string: `Action, Sci-Fi`.
- Canonical values: Action, Adventure, Animation, Comedy, Crime, Documentary, Drama, Family, Fantasy, History, Horror, Music, Mystery, Romance, Sci-Fi, Thriller, War, Western.
- Unknown/free-text genres are preserved.
- Primary genre priority: Horror > Sci-Fi > Fantasy > Animation > Romance > Comedy > Thriller > Crime > War > Western > Action > Adventure > Music > Documentary > History > Mystery > Family > Drama.

### Region

- Format: `^[A-Z]{2}$` (ISO 3166-1 alpha-2)
- Default: device region from `expo-localization`, fallback `ID`.

### Provider ID

- Positive integer from TMDB. Examples verified for `watch_region=ID`:
  - Netflix `8`
  - Amazon Prime Video `119` (also `9` in some regions)
  - Hotstar/Disney+ Hotstar `122`
  - Apple TV `2`, Apple TV Plus `350`
  - Google Play Movies `3`
  - YouTube `192` (not present in the ID snapshot)
  - Viu `158`, Vidio `489`
  - MUBI `11`, Crunchyroll `283`
  - HBO Go `425`, MAX Stream `483`
  - Catchplay `159`, iflix `160`
  - Sun Nxt `309`, Curiosity Stream `190`

## 5. Validation Summary

| Field | Rule | Error message |
| --- | --- | --- |
| `title` | Non-empty after trim | “Title is required.” |
| `type` | `MOVIE` / `SERIES` (default `MOVIE`) | “Please choose a valid type.” |
| `status` | `TO_WATCH` / `WATCHING` / `COMPLETED` (default `TO_WATCH`) | “Please choose a valid status.” |
| `release_year` | Integer 1888…current+10 when provided | “Release year must be between …” |
| `rating` | Number 1–5 when provided | “Rating must be between 1 and 5.” |
| `tmdb_id` | Positive integer when provided | “TMDB id must be a positive integer.” |
| New text fields | Stored as string or NULL | No hard validation |

## 6. Sample Data

### `media`

| id | title | type | genre | year | status | rating | tmdb_id | poster_path | providers_region |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Interstellar | MOVIE | Adventure, Drama, Sci-Fi | 2014 | TO_WATCH | NULL | 157336 | `/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg` | ID |
| 2 | Breaking Bad | SERIES | Crime, Drama | 2008 | WATCHING | 4.5 | 1396 | `/3xnWaLQjelJDDF7LT1WBo6f4BRe.jpg` | ID |
| 3 | Inception | MOVIE | Action, Sci-Fi, Thriller | 2010 | COMPLETED | 5.0 | 27205 | `/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg` | ID |
| 4 | Local Documentary | MOVIE | Documentary | 2024 | COMPLETED | NULL | NULL | NULL | NULL |

### `app_settings`

| key | value |
| --- | --- |
| `region` | `ID` |
| `subscriptions` | `[8,119]` |

**End of Document**

Document ID: CT-DD-001\
Version: 2.0\
Project: CineTrack
