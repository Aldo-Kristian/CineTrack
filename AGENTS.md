# CineTrack — Agent Guide

This is an **Expo SDK 58 / React Native 0.88 JavaScript** mobile application. Prioritize Android-first behavior, performance, and cross-platform compatibility. The app is offline-first with an optional TMDB enrichment layer.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing code that touches an Expo, EAS, React Native, or third-party API:

1. Read the major version of the `expo` package in `package.json` (currently `~58.1.0`).
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v58.0.0/`
3. For anything else, fetch `https://docs.expo.dev/llms.txt` and follow its links.
4. TMDB work must follow `https://developer.themoviedb.org/reference` — never guess endpoint shapes.

## Commands

Use `npx` (no Bun lockfile in this project).

```bash
npm install                  # install dependencies
npx expo install <package>   # ALWAYS use for native packages; resolves SDK-compatible versions
npx expo start --clear       # start Metro with a clean cache
npx expo lint                # ESLint (eslint-config-expo flat config)
npm test                     # jest-expo unit tests
npx expo-doctor              # dependency/config diagnostics
npx expo install --check     # verify SDK-compatible versions
npx expo export --platform android   # production bundle smoke test
```

There is **no `tsconfig.json`** and no TypeScript. Do not add `tsc --noEmit` to the workflow unless a TS migration is explicitly requested.

Run lint, tests, doctor, and an Android export before declaring a task done.

## Navigation — React Navigation

- Navigation lives in `src/navigation/`: `RootNavigator.js` (native stack) and `TabNavigator.js` (bottom tabs).
- Root stack: `MainTabs`, `AddMedia`, `ManualAdd`, `MediaDetails`, `EditMedia`, `Backup`, `Settings`.
- Tabs: `Home`, `Watchlist`, `Statistics`.
- Import hooks/types from `@react-navigation/native` / `@react-navigation/native-stack`.
- Navigation is not file-based: do not create `src/app/` or `_layout.tsx`.

## Architecture rules

Strict layered flow:

```
Screens/Components → useMedia / context → mediaService → repositories (SQLite)
                                                  └──→ tmdbClient → TMDB API
```

- Screens and components must **never** run SQL or call `fetch` directly.
- All persistence goes through `src/database/mediaRepository.js` and `src/database/settingsRepository.js`.
- Business rules, mapping, filtering, backup, and TMDB orchestration live in `src/services/`.
- TMDB calls go through `src/services/tmdbClient.js` only (timeout, retry, 401/429 handling).
- Pure mapping/normalization lives in `tmdbMapper.js` and `providerService.js`; keep them unit-testable.
- `MediaContext` owns the in-memory collection, settings, and exposed async actions.
- `Image`/`Linking`/`expo-image-picker` calls belong in components/hooks, not in the service layer.

## Environment

- TMDB bearer token is read from `EXPO_PUBLIC_TMDB_TOKEN` in `src/config/env.js`.
- `.env` is git-ignored; `.env.example` is committed.
- `EXPO_PUBLIC_*` values are bundled into the client. This is an accepted academic risk; document it in `docs/14`.
- If the token is absent/invalid, online features must degrade gracefully and manual add must still work.

## Database

- `DATABASE_VERSION` is currently **2**.
- Never edit an existing migration after release; add a new versioned block.
- Fresh installs (`user_version = 0`) must end with the same schema as upgrades from v1.
- Preserve user data. Migrations run inside a transaction.
- Custom posters are local files (`poster_uri`) and must be copied into `Paths.document`; TMDB paths (`poster_path`, `backdrop_path`) are portable.
- Provider cache is stored in `media.providers_*`; refresh must not bump `updated_at`.

## UI conventions

- JavaScript, `StyleSheet`, dark theme, constants in `src/constants/`.
- Icons: `lucide-react-native`.
- Bottom sheets use the shared `BottomSheet` (see `src/components/BottomSheet.js`). Do not add `reanimated` or a bottom-sheet library.
- Minimum touch target 44×44 dp; every icon-only button needs an `accessibilityLabel`.
- UI copy is **English**. Comments may be Indonesian, matching existing style.
- All four card variants must expose the same information: title, type · year, rating, status, max 2 genre chips, streaming action.
- Use `React.memo` for cards and tune FlatList props; avoid heavy shadows.
- **Safe areas are mandatory:** every element attached to a screen edge uses `useSafeAreaInsets`/`SafeAreaView`. Android runs edge-to-edge (3-button and gesture nav).
- **All bottom sheets use `BottomSheet`** (`src/components/BottomSheet.js`). Do not create a second sheet/Modal implementation. It handles keyboard height, nested `SafeAreaProvider`, sticky footer, and max width.
- **All screens with `TextInput` use `ScreenContainer`** (or an equivalent KAV `behavior="padding"` wrapper). `KeyboardAvoidingView` must set a behavior on both iOS and Android.
- **No `position: 'absolute'` without explicit inset and z-order.** Floating elements must be last-sibling overlays with `pointerEvents="box-none"`, `zIndex`, and high `elevation`.
- Content width is capped at `MAX_CONTENT_WIDTH` (640) via `src/constants/layout.js`; use `FAB_SIZE`/`FAB_MARGIN`/`TAB_BAR_CONTENT_HEIGHT` from that file instead of hardcoding.
- Reserve a scroll `paddingBottom` of at least `FAB_SIZE + 2×FAB_MARGIN + inset` on screens with the FAB.
- Small fixed-space labels (chips, badges, tab labels, segmented controls) use `numberOfLines` + `maxFontSizeMultiplier` ≤ 1.3; tab labels disable font scaling.

## Testing

- `jest-expo` preset, tests in `__tests__/**/*.test.js`.
- Pure functions covered: `getPrimaryGenre`, `parse/serializeGenres`, `tmdbMapper`, `providerService`, `validationService`, backup/filter logic.
- Do not import native-only modules into pure tests. If a new service is pure, add tests.

## Building with EAS

- `eas.json` has `preview` (internal APK) and `production` profiles.
- Run EAS CLI as `npx eas-cli@latest <command>`.
- Set `EXPO_PUBLIC_TMDB_TOKEN` in the EAS environment (dashboard or `eas env:create`) before building.
- Docs: `https://docs.expo.dev/eas/index.md`

## Rules

- If `ios/` and `android/` do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes bundled native modules. New native libraries require a development build (`npx expo run:android` or `eas build --profile development`).
- Prefer recommended Expo modules over third-party libraries.
- Do not add large UI kits or state libraries for a problem a small local component/context can solve.

## Revision History

| Version | Date | Summary | Reason |
| --- | --- | --- | --- |
| 2.1 | 2026-11-28 | Added permanent safe-area, BottomSheet, ScreenContainer, floating-element, max-width, and font-scaling rules | Perbaikan responsive UI |
| 2.0 | 2026-11-28 | Documented the real React Navigation structure; added layered architecture, TMDB/env, DB v2, test, and EAS rules | Docs-to-code alignment + lecturer/UX revision |
| 1.0 | 2026-11-25 | Initial agent instructions | Project setup |
