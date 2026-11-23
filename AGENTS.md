> Humans: start with [README.md](README.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [CONTRIBUTING.md](CONTRIBUTING.md). This file is the condensed version for AI coding agents.

# ZooApp: agent guide

Visitor app for Zoológico Sahuatoba. Read this whole file before working; it is the source of truth for how code is written here.

## Expo has changed

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing Expo code. Open only the page for the module you are touching.

## Stack

Expo SDK 57 · React Native 0.86 · expo-router (file routes in `src/app/`) · TypeScript strict · NativeWind v4 (Tailwind 3.4, `inlineRem: 16`) · SWR behind domain hooks · NetInfo · Hugeicons · MapLibre · Barlow + Noto Sans via `@expo-google-fonts` · ViroReact (AR/3D). Android app, tested on a real phone with a dev build (never Expo Go).

## Commands

| Task              | Command                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------- |
| Lint (must be 0)  | `npm run lint`, or `npx eslint <files>` while working                                             |
| Types (must be 0) | `npm run typecheck` (`tsc --noEmit`, app and tests)                                               |
| Tests (must pass) | `npm test`, or `npm test -- <path>` while working; see "Tests" below                              |
| Format            | `npx prettier --write <files>` (tabs, single quotes, no semicolons; Tailwind classes auto-sorted) |
| Dev server        | `npx expo start` (`-c` clears the cache)                                                          |
| Native build      | `npx expo run:android`, only after adding a native module or changing `app.json` plugins          |
| Add a package     | `npx expo install <pkg>`, so the version matches SDK 57                                           |

Restart Metro with `-c` after changing `tailwind.config.js`, `metro.config.js`, `src/theme/colors.js` or `.env`. Everything else hot-reloads.

## Environment

`.env` (copied from `.env-example`, never committed) holds:

- `EXPO_PUBLIC_API_URL`: backend base URL, without `/api`. Required: `api.ts` throws at startup without it.
- `EXPO_PUBLIC_ZOODECK_QUIZ_DEBUG=1`: fake duel with no QR or backend quiz (`/duel/debug`).
- `EXPO_PUBLIC_ZOODECK_VISIT_CHECKS=0`: skips the in-zoo location/ticket checks so duels can be tested anywhere. The server has its own flag.
- `EXPO_PUBLIC_ZOODECK_FORCE_360=1`: dev only, shows the 360° view instead of AR.
- `EXPO_PUBLIC_ZOODECK_NOAR_SUPPORT=1`: dev only, the phone behaves as one without ARCore. `FORCE_360` wins over it.

The flags are read in `src/utils/zoodeckDebug.ts`. Don't change `.env` without telling the user; Metro must restart with `-c` afterwards.

## Project structure

```
src/
  app/                 Routes only (expo-router). Every file here becomes a screen.
    _layout.tsx        Providers (SafeArea, Keyboard, DataProvider, Auth) + OfflinePackSync + OfflineBanner
    index → splash     Session check, then (tabs) or login; login, register, forgot-password
    (tabs)/            Tab bar: index (Explore), mizoo, zoodeek (ZooDeck), panel; ar is hidden
    tickets/ donations/ species/   Stack screens per module
    deck/              Card collection: index, [id] (3D), ar/[id], selfie/[id], photo (share),
                       map (duel map), offline (pack)
    duel/              _layout (DuelProvider): scan → play → review, debug
    points/            season: what the active points season changes
    settings/          index (preferences), storage (what the app keeps, links to each download)
    map.tsx profile.tsx +not-found.tsx
  components/
    ui/                Generic design-system components (Button, Card, ListCard, TextField,
                       QueryView, LoadingState/ErrorState/EmptyState, Toast, BottomSheet, Modal…)
    <domain>/          Pieces used by one module (map/, tickets/, species/, deck/, duel/, zoodeck/,
                       ar/, profile/…)
  hooks/               Domain data hooks (useSpecies, useMyTickets, useCards…) + UI hooks (useScrolled…)
  services/            api(), token, one module per API domain (functions + SWR keys), swr-config,
                       offline pack (packSync, packStore, packCrypto)
  types/               API types, one file per domain
  utils/               Pure helpers (format.ts, date.ts, map.ts, zoodeck.ts…), no JSX
  theme/               colors.js (palette, single source), layout.ts (safe-area/footer spacing)
  contexts/            AuthContext (logged-in user), DuelContext (one duel, scoped to duel/)
  global.css           Tailwind + type role classes (text-h1, text-body…)
assets/models/         3D models for AR (.glb), typed in src/assets.d.ts
docs/design/           Design PDFs (design-system.pdf, mobile-app.pdf)
__tests__/             Jest tests, mirroring src/ paths (smoke/, services/, contexts/…)
jest/                  Jest setup and in-memory mocks of native modules (mocks/)
test-utils/            Test helpers: MSW server, render with providers, router mock, pack, factories
```

Never put non-route files under `src/app/`: expo-router turns them into routes. That includes tests: they go in `__tests__/`.

## Code standards

- **Style matches the surrounding code:** same naming, comment density and idioms. Comments explain _why_, briefly; don't narrate code.
- **TypeScript:** no `any`. API shapes live in `src/types/<domain>.ts`. Import with the `@/` alias.
- **Components:** one per file, named export (`Toast` and `FixedFooter` are default exports), a props type in the same file. Keep screens thin: they compose components and hold screen state.
- **Styling:** NativeWind `className` only. `StyleSheet.create` is banned by lint. Inline `style` only for animated values, values computed at runtime (insets, sizes from props or API) and Android-only props.
- **Colors:** only palette tokens (`bg-esmeralda`, `text-tinta-2`, `border-card-border`, or `colors.<token>` in TS). Hex/rgb literals are banned by lint. Opacity via modifiers (`bg-tinta/[0.78]`). Don't add colors without the user's OK. The few allowed exceptions carry `// eslint-disable-next-line no-restricted-syntax -- <reason>`.
- **Typography:** use the role classes from `global.css` (`text-h1`, `text-subtitle`, `text-h2`, `text-h3`, `text-body`, `text-meta`, `text-overline`, `text-button`) or the family classes (`font-display`, `font-display-x`, `font-sans`, `font-sans-semibold`, `font-sans-bold`, `font-sans-x`). Never add `font-bold`/`font-semibold`… weight classes: on Android a custom font's weight comes from its family, and mixing them falls back to the system font. Minimum text is 12px.
- **Sizes:** use the Tailwind scale (spacing 4/8/12/16/20/24/32 = `1/2/3/4/5/6/8`). Radius: `rounded-xl` (12) controls and icon boxes, `rounded-2xl` (16) cards, `rounded-3xl` (24) sheets and modals, `rounded-full` chips. Borders: `border-1.5`. Arbitrary values only when the design really needs them.
- **Layout gotcha:** NativeWind's `flex-1` (grow/shrink/basis) isn't React Native's `flex: 1`. Inside a column whose height depends on its content, use `style={{ flex: 1 }}` (see `ListCard`).
- **No diffuse shadows:** depth comes from borders.
- **Icons:** the `Icon` wrapper (Hugeicons, default size 22, stroke 2.2).
- **Accessibility:** touch targets ≥ 40dp, the focus ring on controls (`FocusRing`), states never conveyed by color alone (icon or text).

## How to add things

**New screen**

1. Route file in `src/app/…`.
2. Wrap it in `ScreenBackground` (safe areas and pattern background); header with `ScreenHeader`/`TabHeader`/`TopBar`; 20px side margin (`px-5`).
3. Load data with a domain hook and render it through `QueryView`, which gives the loading, error, offline and empty states for free.
4. Add `useSessionRedirect()` if it needs a logged-in user.
5. Fixed footer: `FixedFooter` + `useFixedFooterSpace()` for scroll padding. Scrollable content: `useScrollBottomSpace()`. Never hardcode bottom padding: the Android navigation bar varies.

**New data (read)**

1. Types in `src/types/<domain>.ts`.
2. Function + key in `src/services/<domain>.ts` using `api()`. It adds the token itself.
3. Hook in `src/hooks/` built on `useQuery(key, fetcher)`.
4. Use it in the screen through `QueryView`. Only `src/hooks/**` and `services/swr-config.tsx` may import `swr`; lint enforces it.

**New write (POST/PUT)**

1. Plain async function in the domain service.
2. In the handler: `if (await checkOffline())` → `notifyOffline(message)` and stop. `redirectIfSignedOut()` when it needs a session. Model: `src/app/donations/summary.tsx`.
3. After success, refresh the affected reads with `useDataRefresh()` (`refreshMyTickets`, `refreshDonations`, `refreshCards`, `addOwnedCard`, `refreshProfile`…); add a function there for new keys. Never import `mutate` from `swr`: the app's cache provider is separate.
4. Errors: `isNetworkError` → `notifyOffline()`; otherwise show `Toast` with title + text.
5. Validation errors arrive as `ApiValidationError` (422) with per-field messages for `TextField`'s `error`.

**Offline card pack (ZooDeck)**

- `services/packSync.ts` downloads the encrypted pack and decrypts the user's own cards; `packStore.ts` owns the on-device layout; screens read it through `usePackStatus()`.
- Logout deletes the user's decrypted cards and clears the SWR cache (`AuthContext`). Keep both when touching auth or cards.
- Changes here can delete downloaded files on the user's phone; ask before changing the storage layout.

**New component**

- Is it in the design system, or used by more than one module? Then `src/components/ui/`, built to the spec.
- Otherwise `src/components/<domain>/`.
- Before writing markup, check whether `ui/` already has it (Button, Card, ListCard, IconBox, Chip, Badge, StatCard, DetailRow, Divider, SectionTitle, Notice, Modal, BottomSheet…). Extend with a variant or prop rather than copying.

## Tests

Jest (`jest-expo`) + React Native Testing Library + MSW 2. Details and examples in [CONTRIBUTING](CONTRIBUTING.md#automated-tests).

- Files in `__tests__/<same path as src>/<name>.test.ts(x)`. Import test globals from `@jest/globals` (TypeScript 6 doesn't load `@types/jest` on its own).
- Mock only native modules. SecureStore, NetInfo and `expo-file-system` are already in-memory fakes and expo-crypto runs on WebCrypto (`jest/setup.ts`); the network goes through MSW (`test-utils/server.ts`), and an unhandled request fails the test.
- Per file when needed: `expo-router` (`test-utils/router.ts`), `react-native-safe-area-context/jest/mock`, `react-native-keyboard-controller/jest`, ViroReact (`test-utils/ar.ts`, with `ViroARSceneNavigatorStub` for AR screens), expo-camera, expo-location. Anything importing `services/photo` also mocks `react-native-view-shot`, `expo-media-library` and `expo-sharing`.
- `packSync`, `packStore`, `cards` and `useArAvailability` keep state in the module: one stateful scenario per test file.
- RNTL 14 is async: `await render`, `await renderHook`, `await fireEvent.press`. Modals open a frame later: `findBy*`.
- A known bug gets a `test.failing` that names the issue. No snapshots.
- `npm run test:ci` enforces the coverage thresholds in `jest.config.js`: raise `global` when coverage grows, never lower a threshold to make CI pass.
- Never upgrade MSW to 3 (ESM only, doesn't load in Jest 29).

## Design references

The design PDFs are the source of truth for UI and live in `docs/design/`. Read only the pages you need (Read with `pages`), once per task.

- **`docs/design/design-system.pdf`**
  - p.3: colors
  - p.4: fonts, icons and rules
  - p.5: spacing, radii, borders, type scale
  - p.6: component measurements
  - p.7: game components (collectible card, stat pills, duel answers, camera controls)

  Skip p.8–9 (admin panel).

- **`docs/design/mobile-app.pdf`** (designed at 390×844, screen codes A-01…A-44)
  - p.4: auth
  - p.6–7: Explore, Panel, QR, profile
  - p.9: species
  - p.11: map
  - p.12–14: ZooDeck and duels (A-16–A-23)
  - p.15–18: collection, 3D view and AR (A-24–A-32)
  - p.20–21: tickets
  - p.23–24: donations
  - p.26–27: 404 and system states
  - p.28: dev notes

Key App measurements:

- buttons and inputs 52dp, primary button with a 3px Bosque bottom border
- back button 40
- chip 32, badge 24
- list card padding 16, icon 40, chevron 32
- tab bar 72dp, floating 16dp, radius 24
- modal padding 24×20, backdrop Tinta at 78%
- focus: 2px Bosque border + 3px Lima ring

## AR and 3D with ViroReact

- **Package:** `@reactvision/react-viro` (ReactVision's maintained ViroReact). Docs: https://viro-community.readme.io/docs. The local `node_modules/@reactvision/react-viro/README.md` and its `.d.ts` types are the fastest reference for props; grep them instead of guessing.
- **Native module:** set up through its config plugin in `app.json` (`"android": { "xRMode": ["AR"] }`). Changing plugin options or upgrading it needs `npx expo run:android`; it never works in Expo Go. Ask the user before touching it.
- **Devices:** AR needs a real phone with ARCore (Google Play Services for AR) and camera permission. The emulator can't test it.
- **Where things live:**
  - AR and 3D screens are routes like any other screen; non-route pieces go in `src/components/<domain>/` (e.g. `src/components/ar/`)
  - models go in `assets/models/` as `.glb` (preferred: one binary file with textures)
  - `metro.config.js` already registers `glb`, `gltf`, `obj`, `mtl`, `bin`, `vrx`, `hdr`, `arobject` as assets, and `src/assets.d.ts` types the `.glb` import; add a `declare module` there for any other extension you import
- **Scene code:**
  - Viro components (`ViroARScene`, `Viro3DObject`, `ViroAmbientLight`…) are not React Native views: no `className`, NativeWind or layout props inside a scene
  - define scene components at module level, never inline in render, and pass them to `ViroARSceneNavigator`'s `initialScene`
  - pass data in with `viroAppProps`, not closures
  - UI over the camera (instructions, shutter, buttons) is regular React Native in an absolutely positioned layer above the navigator, styled per design system p.7: dark panel at 82%, white 48–56dp buttons, 76dp shutter
- **Selfie and photos:** the selfie is ARCore on the front camera (`frontCameraEnabled`): no planes, the animal stands at a fixed spot. Don't use `ViroCameraTexture` (no Android native code, it crashes). Photos come from the AR navigator's `_takeScreenshot` and stay in `cache/photos/` through `services/photo.ts`, never uploaded.
- **Gestures:** outside rear-camera plane AR, drags go through a `PanResponder` layer above the view. Copy `gestureState.dx/dy` and the touches when the event arrives: PanResponder reuses the object, and a state updater that reads it later gets wrong values.
- **Placement:** `ModelPlacementScene` runs the mode saved in Configuración ("Colocación del animal", `useArPlacement`; AR screens read it once per session and wait for it). `'plane'`: with `ViroARPlaneSelector`, forward the scene's anchor events to it through its ref (`handleAnchorFound/Updated/Removed`), and place the model at the selected plane. `'auto'`: centre hit test, logic in `utils/arPlacement.ts`.
- **Per-frame updates:** never re-render a scene on every frame: keep the state in a ref, write nodes with `setNativeProps`, skip moves under ~1 cm. Turn per-frame events off (`onCameraARHitTest` undefined) when unused and while `useViroExit().closing`, and pass `perFrameEvents` to `useViroExit` so the view waits before unmounting: an event in flight while the view unmounts deadlocks the app.
- **Models:** keep them small (a few MB, few draw calls), set `scale` explicitly, show a loading state while they load, and handle `onError`. Remove debug `console.log`s before committing.
- **360° scenario:** `assets/models/scenario/savanna.glb` has baked ground shadows, so it, the sky rotation and the sun direction must always turn together with the animal's heading in `Viewer360Scene`. Only the animal casts a live shadow (anything else in the scene gets `shadowCastingBitMask={0}`). GVR head tracking that never starts is handled by recreating the view (`onTrackingStuck`). Editing `Viewer360` while its view is open can crash the dev app natively (fast refresh remounts Viro without the release delay): leave the view first. It's exported from a Blender file outside the repo: don't edit the GLB, ask the user. Details in [ARCHITECTURE](docs/ARCHITECTURE.md#ar-and-3d).
- **Shadows:** a live shadow needs `shadowsEnabled` on the navigator. Bitmasks stay at 1 on the light, the animal and the `arShadowReceiver` quad; anything that must not cast gets `shadowCastingBitMask={0}`. Shadow math lives in `utils/shadow.ts`, shared with the 360° view. `onAmbientLightUpdate` always reports 0 (Viro forces ARCore's HDR mode): don't build on it.
- **Lint:** light colors in a scene are 3D lighting, not UI. Mark them with `// eslint-disable-next-line no-restricted-syntax -- AR light color` instead of using palette tokens.

## Working efficiently (low token use)

- Don't explore broadly. Find things with `grep -rn` / `git grep`, then read only the line ranges you need (Read with offset/limit, or `sed -n 'X,Yp'`). Large files: get an outline first with `grep -nE "^(export|function|const|type)|return \(" <file>`.
- Prefer targeted edits over rewriting files. Move code as-is when refactoring.
- Lint and type-check only touched files while working; run the full `npm run lint`, `npm run typecheck` and `npm test` once before committing.
- Don't re-read files you just edited, or PDF pages you already read; keep notes of the values you need.
- Batch independent commands in one call. Keep replies short: what changed, what was verified, what's left.
- Don't install packages or change native config without asking; both force a rebuild for the whole team.

## Device testing over ADB (Android)

- Check the phone: `adb devices` (USB shows a serial; Wi-Fi shows `ip:port`). App package: `com.anonymous.zooApp`. Launch: `adb shell monkey -p com.anonymous.zooApp -c android.intent.category.LAUNCHER 1`.
- Metro: `curl -s localhost:8081/status`. If the user runs Metro themselves, don't start or restart it; ask instead. Reload the JS with `adb shell input keyevent 82` (dev menu) → Reload.
- **Navigate with text, not screenshots:** `adb shell uiautomator dump /sdcard/ui.xml && adb exec-out cat /sdcard/ui.xml`, grep the `text`/`content-desc` → `bounds="[x1,y1][x2,y2]"`, tap the center with `adb shell input tap X Y`. Also `input swipe`, `input text`, `keyevent 4` (back).
- **Screenshots only to verify visuals, always scaled down** (put the files in your scratch/temp dir, never in the repo):
  `adb exec-out screencap -p > /tmp/s.png && python3 -I -c "from PIL import Image; im=Image.open('/tmp/s.png'); im.thumbnail((400,900)); im.save('/tmp/s_small.png')"`. One screenshot per state, not per tap.
- **Measure instead of eyeballing:**
  - dp = px ÷ (`adb shell wm density` ÷ 160)
  - compare element bounds from the uiautomator dump with the spec
  - check colors by sampling pixels: `im.convert('RGB').getpixel((x,y))` against the palette hex values
- **Offline tests:**
  1. Only over USB, with `adb reverse tcp:8081 tcp:8081` first.
  2. Network off with `adb shell svc wifi disable && adb shell svc data disable`, back on with `enable`. If not permitted, try `cmd connectivity airplane-mode enable|disable`.
  3. Always restore the network.
- **Test account:** ask the user for credentials. Type them with `adb shell input text`. Never write credentials into code, commits, PRs or any repo file.
- **Payments:** a real payment provider is being integrated, so never assume ticket purchases or donations are simulated. Before completing a purchase or donation (on the device, through the API, or in a script), ask the user whether the current backend charges real money, and only continue once they confirm it is a test environment.
- Ask the user only for what ADB can't do: PIN unlock, system dialogs you can't tap, a native rebuild, a Metro restart they own.

## Git and PRs

- Never commit to `main`. Create a branch per task (`feat/…`, `fix/…`, `refactor/…`, `design/…`, `chore/…`) from an up-to-date `main`.
- Small commits, one logical change each. Message: imperative subject under 72 chars, plus a short body explaining why.
- **No AI attribution anywhere:** no `Co-Authored-By` trailers, no "Generated with…", no mention of AI in commits or PRs.
- Push, open, or merge PRs only when the user asks. PRs use `gh pr create --base main` and merge with `gh pr merge --merge --delete-branch`. The description says what changed, how to test, and whether a native rebuild or `expo start -c` is needed.

## Keeping the docs current

The docs must describe the code as it is. When a change makes any of them wrong or incomplete, update them in the same branch, as their own commit:

| If the change…                                                                                        | Update                 |
| ----------------------------------------------------------------------------------------------------- | ---------------------- |
| adds or changes a convention, lint rule, command, folder, workflow step or a risk agents must know    | `AGENTS.md`            |
| changes routing, the data layer, state, offline support, the design system, maps, AR or native config | `docs/ARCHITECTURE.md` |
| changes how screens, data, modules or components are added, the PR workflow or code standards         | `CONTRIBUTING.md`      |
| adds a feature, a package, an environment variable, a setup step or a roadmap item (or ships one)     | `README.md`            |

- Keep `AGENTS.md` condensed: rules and pointers, not explanations. Detail belongs in the human docs.
- Write the human docs as the description of a finished product. Planned work goes in the README's Roadmap section, not as caveats across the docs.
- Don't rewrite a doc for style while doing an unrelated task. When unsure whether a rule should change, ask the user instead of editing it.

## Done means

- `npm run lint` and `npm run typecheck` both at 0, and `npm test` passing.
- UI changes checked on the device (or the reason they couldn't be).
- No new hardcoded colors, sizes or duplicated markup that a `ui/` component already covers.
- Docs updated if the change made them outdated (see "Keeping the docs current").
- Nothing left in the repo from testing (screenshots, notes, credentials).
