# CineTrack — Wireframe Design

**Document ID:** CT-WF-001\
**Version:** 2.1\
**Status:** Final\
**Phase:** 3 — System Design\
**Project:** CineTrack\
**Last updated:** 2026-11-28

## Revision History

| Version | Date | Summary | Reason |
| --- | --- | --- | --- |
| 2.1 | 2026-11-28 | Updated FAB placement/bottom padding, keyboard-aware sheet layout, sticky rating footer, responsive content width | Perbaikan responsive UI |
| 2.0 | 2026-11-28 | Search-first add, confirm sheet, Home carousels, Watchlist filter sheet/chips, Detail hero/where-to-watch, Settings, four genre card variants, themed placeholder | Lecturer consultation + UX fixes |
| 1.0 | 2026-11-25 | Initial low-fidelity wireframes | Project setup |

---

Low-fidelity wireframes focus on layout, hierarchy, and function. The real app uses the Netflix-style dark theme (`#141414` background, `#E50914` primary). Accent colors vary by genre.

**Legend:** `[ ... ]` = input/button, `( ... )` = badge/choice, `( + )` = add button, `<` = back, `⋯` = overflow.

## 1. Home

**Purpose:** status overview and fast access to active/recent titles.\
**Related:** FR-01, FR-11, FR-19, UC-01.

```
┌─────────────────────────────────────┐
│ CINETRACK                       [⚙] │
│ Your personal film & series tracker │
│                                     │
│ [  12  ]   [  5  ]   [  7  ]        │
│ To Watch   Watching  Completed      │
│  (tap → Watchlist with filter)      │
│                                     │
│ Continue Watching          5         │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐        │
│ │pst │ │pst │ │pst │ │pst │  →     │
│ └────┘ └────┘ └────┘ └────┘        │
│                                     │
│ Up Next                    8         │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐        │
│ │pst │ │pst │ │pst │ │pst │  →     │
│ └────┘ └────┘ └────┘ └────┘        │
│                                     │
│ Recently Completed                   │
│ ┌─────────────────────────────────┐ │
│ │ [poster] Title · 2021    ★ 4.5  │ │
│ │          (Completed) (Genre)     │ │
│ │          [▶ Open on Netflix]     │ │
│ └─────────────────────────────────┘ │
│                             ( + )   │
│ ─────────────────────────────────── │
│   Home      Watchlist     Statistics│
└─────────────────────────────────────┘
```

Empty state: icon + “Your collection is empty” + large CTA **Find your first movie**.

## 2. Watchlist

**Purpose:** full collection with compact search + filter access.\
**Related:** FR-01, FR-07…FR-09, FR-13, FR-20, FR-21.

```
┌─────────────────────────────────────┐
│ Watchlist                24 titles  │
│ [ Search movies or series...      ] │
│                              [☰ 2]  │
│ (Movie ×) (Sci-Fi ×) (Sort: Rating ×)│
│ ─────────────────────────────────── │
│ ┌─────────────────────────────────┐ │
│ │ [poster] Title          ★ 4.5 ⋯│ │
│ │          Movie · 2021           │ │
│ │          (Action) (Sci-Fi)      │ │
│ │          (Completed)            │ │
│ │          [▶ Open on Netflix]    │ │
│ │          Also on (◦)(◦)(◦)      │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ [poster] Comedy · 2023      ⋯  │ │
│ │          (Comedy) (Family)      │ │
│ └─────────────────────────────────┘ │
│                             ( + )   │
│ ─────────────────────────────────── │
│   Home      Watchlist     Statistics│
└─────────────────────────────────────┘
```

- `[☰ 2]` is the Filter button with active-filter count.
- Long-press and `⋯` open the same action sheet.

## 3. Filter & Sort Sheet

```
┌─────────────────────────────────────┐
│              ────                   │
│ Filter & Sort                   [×] │
│                                     │
│ Type                                │
│ (All) (Movie) (Series)              │
│ Status                              │
│ (All) (To Watch) (Watching)         │
│ (Completed)                         │
│ Genre                               │
│ (All) (Action) (Adventure) (… )     │
│ Sort by                             │
│ (Recent) (Title A-Z) (Rating) (Year)│
│                                     │
│ [        Reset      ] [  Apply  ]   │
└─────────────────────────────────────┘
```

## 4. Add Media — Search First

```
┌─────────────────────────────────────┐
│ <  Add to Collection                │
│                                     │
│ Find a movie or series              │
│ Search once — poster, year, genres, │
│ synopsis, providers fill in.        │
│ [ Search movie or series...       ] │
│                                     │
│ + Can't find it? Add manually       │
│ ─────────────────────────────────── │
│ [pst] Inception                     │
│       (Movie) 2010                  │
│ ─────────────────────────────────── │
│ [pst] Breaking Bad     (In collection)│
│       (Series) 2008                 │
│ ─────────────────────────────────── │
│ [pst] Dune                          │
│       (Movie) 2021                  │
└─────────────────────────────────────┘
```

States: idle hint, loading spinner, empty, offline banner, token/API error banner.

## 5. Confirm Add Sheet

```
┌─────────────────────────────────────┐
│              ────                   │
│ Add to collection               [×] │
│                                     │
│ ┌──────┐  Dune                       │
│ │poster│  Movie · 2021               │
│ │      │  (Sci-Fi) (Adventure)       │
│ └──────┘  Loading details...         │
│                                     │
│ Paul Atreides travels to Arrakis…   │
│                                     │
│ Status                              │
│ (To Watch) (Watching) (Completed)   │
│                                     │
│ (jika Completed) Your rating        │
│  ✕  −  ★ 4.5 / 5  +                 │
│                                     │
│ [        Add to Collection       ]  │
└─────────────────────────────────────┘
```

## 6. Manual Add / Edit

```
┌─────────────────────────────────────┐
│ <  Add Manually / Edit Title        │
│ [ ✦ Find poster & info automatically]│
│                                     │
│ Title *                             │
│ [ Enter movie or series title     ] │
│                                     │
│ Type                                │
│ (Movie) (Series)                    │
│ Viewing Status                      │
│ (To Watch) (Watching) (Completed)   │
│                                     │
│ ▾ More details (optional)           │
│   Genre                             │
│   [ Choose genres               ▾ ] │
│   Release Year                      │
│   [ Select release year         ▾ ] │
│   Personal Rating                   │
│   [ Your rating  − + ]              │
│   Description                       │
│   [ Write a short description...  ] │
│   Poster                            │
│   [No custom poster]                │
│   [ Choose poster from gallery    ] │
│                                     │
│ [           Add to Collection    ]  │
└─────────────────────────────────────┘
```

Edit mode expands “More details” by default.

## 7. Details

```
┌─────────────────────────────────────┐
│ <  Details                          │
│ ┌─────────────────────────────────┐ │
│ │        BACKDROP / gradient      │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│ ┌──────┐ Dune                        │
│ │poster│ Movie · 2021                │
│ └──────┘ (Sci-Fi) (Adventure)        │
│          (Completed)                │
│                                     │
│ ★ Personal rating 4.5    Tap to rate│
│                                     │
│ Status                              │
│ (To Watch) (Watching) (Completed)   │
│                                     │
│ Where to watch      Updated today ↻ │
│ Stream                              │
│ (logo) Netflix      [▶ Open on …]   │
│ Free & Ads                          │
│ (logo) YouTube      [▶ Open on …]   │
│ Rent                                │
│ (logo) Apple TV     [Rent/Buy on …] │
│ [ Open Where to Watch page        ] │
│                                     │
│ Synopsis                            │
│ Paul Atreides travels to Arrakis…   │
│ Read more                           │
│                                     │
│ Details                             │
│ Type / Year / Added / Updated / TMDB│
│                                     │
│ [ Edit ]              [ Delete ]    │
└─────────────────────────────────────┘
```

## 8. Settings

```
┌─────────────────────────────────────┐
│ <  Settings                         │
│ PREFERENCES                         │
│ [📍] Region                     ID >│
│      Streaming availability country │
│ [📺] My streaming subscriptions     │
│      2 selected                     │
│ [ⓘ] Online metadata              On │
│                                     │
│ COLLECTION TOOLS                    │
│ [✨] Complete my existing titles    │
│      3 titles without a TMDB match  │
│      Working 12/40  [Cancel]        │
│      [████████░░░░░░]               │
│      Needs review (2)               │
│      Old Title → (candidate 1) …    │
│                                     │
│ DATA                                │
│ [🗄] Backup & Restore             > │
│ [🚫] Clear image cache            > │
│                                     │
│ ABOUT & CREDITS                     │
│ This product uses the TMDB API but  │
│ is not endorsed or certified by TMDB│
│ Streaming availability data provided│
│ by JustWatch.                       │
│ CineTrack 2.1.0                     │
└─────────────────────────────────────┘
```

## 9. Four Card Variants

All variants show title, type · year, rating, status, max 2 genre chips, and a streaming action.

### 9.1 Cinematic — Action, Adventure, Thriller, Crime, War, Western

```
┌─────────────────────────────────────┐
│ ███████ BACKDROP 16:9 ██████████████│
│ ████████████████████████████████████│
│ ████████████████████ gradient ██████│
│ Title                      ★ 4.5  ⋯ │
│ Movie · 2021                        │
│ (Action) (Adventure)                │
│ (Completed)  [▶ Open on Netflix]    │
│              Also on (◦)(◦)         │
└─────────────────────────────────────┘
```

### 9.2 Poster — Drama, Mystery, History, Documentary

```
┌─────────────────────────────────────┐
│ ┌──────┐ Title              ★ 4.5 ⋯│
│ │poster│ Movie · 2021               │
│ │ 2:3  │ (Drama) (Mystery)           │
│ └──────┘ (Completed)                 │
│ [▶ Open on Netflix]  Also on (◦)(◦) │
└─────────────────────────────────────┘
```

### 9.3 Vibrant — Comedy, Animation, Family, Music

```
╭─────────────────────────────────────╮
│ (✿ sticker)                     ⋯   │
│ ┌────────┐ Title           ★ 4.5    │
│ │ poster │ Movie · 2023              │
│ │ radius │ (Comedy) (Family)         │
│ └────────┘ (Watching)                │
│ [▶ Open on Prime Video]             │
╰─────────────────────────────────────╯
```

### 9.4 Atmospheric — Horror, Sci-Fi, Fantasy, Romance

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ ┌──────┐ Title              ★ 4.5  ┃
┃ ┃poster┃ ◉ Movie · 2024            ┃
┃ ┃ glow ┃ (Horror) (Thriller)        ┃
┃ └──────┘ (Completed)          ⋯    ┃
┃ [▶ Open on Netflix]                ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### 9.5 Poster placeholder (no image)

```
┌───────────────┐
│  gradient     │
│   (genre icon)│
│      DT       │
│  (initials)   │
└───────────────┘
```

## 10. Responsive Layout Wireframes

### 10.1 Home — FAB and scroll clearance

```
┌─────────────────────────────────────┐
│ CINETRACK                       [⚙] │
│ Home content                        │
│ ┌────┐ ┌────┐ ┌────┐                │
│ │pst │ │pst │ │pst │  →             │
│ └────┘ └────┘ └────┘                │
│ ...                                 │
│ last card ends above FAB padding    │
│                          [ + ]      │  ← FAB above cards, below header
│ ─────────────────────────────────── │
│   Home      Watchlist     Statistics│  ← tab bar owns bottom inset
└─────────────────────────────────────┘
```

- FAB is the last sibling in an absolute-fill overlay (`pointerEvents="box-none"`).
- Scroll content bottom padding = `FAB_SIZE + 2×margin + insets.bottom`.
- FAB hides while the keyboard is open.

### 10.2 Bottom sheet with keyboard

```
Tanpa keyboard                         Keyboard terbuka
┌─────────────────────┐                ┌─────────────────────┐
│ backdrop            │                │ backdrop            │
│ ┌─────────────────┐ │                │ ┌─────────────────┐ │
│ │ Find poster… [×]│ │                │ │ Find poster… [×]│ │
│ │ [ search…     ] │ │                │ │ [ search…     ] │ │
│ │ [result 1]      │ │                │ │ [result 1]      │ │
│ │ [result 2]      │ │                │ │ [result 2]      │ │
│ │ [result 3]      │ │                │ └─────────────────┘ │
│ └─────────────────┘ │                │  keyboard            │
│ nav bar inset       │                │  (sheet bottom =     │
└─────────────────────┘                │   keyboardHeight)    │
                                       └─────────────────────┘
```

- Sheet bottom = `keyboardHeight`; maximum height = `windowHeight − keyboardHeight − insets.top − gap`.
- Search input stays fixed in the sheet header; results scroll in a `FlatList`.
- When the keyboard is hidden, the sheet uses `insets.bottom + spacing.md` padding.

### 10.3 Rating sheet — sticky footer

```
┌─────────────────────────────────────┐
│ Rate this title                 [×] │
│ Pom Poko                            │
│ Completed! Add a rating or skip.    │
│                                     │
│ Your Rating            4.0 / 5      │
│ [★] [★] [★] [★] [☆]   Clear       │
│                                     │
│ ┌─────────────┐ ┌─────────────────┐ │  ← footer sticky
│ │    Skip     │ │   Save rating   │ │
│ └─────────────┘ └─────────────────┘ │
│        nav bar inset padding        │
└─────────────────────────────────────┘
```

### 10.4 Wide screens

- Forms, sheets, settings, details, statistics, and backup content are centered with `maxWidth: 640`.
- Poster carousels calculate card width from `useWindowDimensions` (clamped 140–200 dp).
- The shared content width prevents absurdly wide cards on tablets/foldables.

## 11. Wireframe Decisions

- Dark background with genre accents; red remains the global primary action color.
- Watchlist header is reduced to search + Filter button; type/status/genre/sort move into a sheet.
- Active filters are visible as removable chips.
- Add is search-first; manual add is a deliberate fallback, not the default.
- Cards expose the same information in every variant to keep scanning consistent.
- Streaming is optional: no provider data = no dead button.
- Touch targets are at least 44×44 dp; icon buttons have accessibility labels.
- Bottom sheets use the native `Modal` component; no extra sheet library.
