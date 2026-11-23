# ZooApp

Visitor app for **Zoológico Sahuatoba** (Durango, Mexico). It helps visitors plan and enjoy their visit, buy tickets, donate, learn about the species, and play **ZooDeck**, a collectible-card game with QR duels and an augmented-reality view of each animal.

ZooApp is an Android app built with Expo development builds. Its interface is in Spanish.

## Documentation

| Document                                     | Read it to…                                                                         |
| -------------------------------------------- | ----------------------------------------------------------------------------------- |
| **README.md** (this file)                    | set up the project and run it on a phone                                            |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | understand how the app is organized: routing, data, offline, design system, AR      |
| [CONTRIBUTING.md](CONTRIBUTING.md)           | learn the workflow and code standards, and add screens, data, modules or components |
| [docs/design/](docs/design/)                 | see the UI source of truth (`design-system.pdf`, `mobile-app.pdf`)                  |
| [AGENTS.md](AGENTS.md)                       | (for AI coding agents) the condensed rules they follow in this repo                 |

## Features

- **Explore**: the home tab, with featured events and shortcuts to tickets, the map, species and donations.
- **Map**: an interactive map of the zoo (MapLibre) with zones, points of interest, species and the visitor's location.
- **Species**: a searchable catalog with a detail page for each animal.
- **Tickets**: buy entry tickets and show them as QR codes, with the points the purchase earned.
- **Donations**: donate to the zoo, see the points earned and the donation history.
- **ZooDeck**: collect animal cards, see them in 3D, in AR (on a surface you tap, or placed automatically on the floor, an experimental option in Configuración) or in a 360° view of a savanna, take photos and selfies with the animal in the zoo's frame to save or share, and download the cards for offline use.
- **Duels**: scan a QR code at an enclosure and answer a quiz to win that animal's card.
- **MiZoo**: the visitor's species, achievements and rewards.
- **Point seasons**: when the zoo runs a points season, a banner on Explore, MiZoo and ZooDeck announces it, and a screen lists which actions give more or fewer points.
- **Panel / Profile**: the visitor's account, personal QR code, and ticket and donation history.

## Tech stack

| Area       | Choice                                                             |
| ---------- | ------------------------------------------------------------------ |
| Framework  | Expo SDK 57, React Native 0.86, React 19, TypeScript (strict)      |
| Navigation | expo-router (file-based routes in `src/app/`)                      |
| Styling    | NativeWind v4 (Tailwind CSS 3.4), Barlow + Noto Sans fonts         |
| Data       | `fetch` wrapper + SWR, NetInfo for connectivity                    |
| Maps       | MapLibre React Native                                              |
| AR / 3D    | ViroReact (`@reactvision/react-viro`)                              |
| Photos     | react-native-view-shot, expo-media-library, expo-sharing           |
| Storage    | expo-secure-store (session token), expo-file-system (offline pack) |
| Icons      | Hugeicons                                                          |

## Prerequisites

You need Node.js with npm 11, JDK 17, the Android SDK and an Android phone. The steps differ slightly between operating systems.

### Node.js and npm

The project is pinned to **Node 24.22.3 and npm 11.21.3** (`volta` and `engines` in `package.json`). Use npm 11: the Expo CLI does not work properly with npm 12 yet. We recommend [Volta](https://docs.volta.sh/guide/getting-started), which switches to the pinned versions by itself inside the project.

```bash
# Linux / macOS
curl https://get.volta.sh | bash

# Windows
winget install Volta.Volta

# Then
volta install node@24.22.3 npm@11.21.3
```

### JDK 17

Required to compile development builds.

```bash
# Linux / macOS, with sdkman (https://sdkman.io)
curl -s "https://get.sdkman.io" | bash
sdk install java 17.0.20-tem
```

On Windows, download JDK 17 from [Adoptium Temurin](https://adoptium.net/temurin/releases/?version=17).

### Android SDK and phone

1. Install [Android Studio](https://developer.android.com/studio) and, from its SDK Manager, the Android SDK Platform 36, Build-Tools and Platform-Tools.
2. Set `ANDROID_HOME` to the SDK folder and add `$ANDROID_HOME/platform-tools` to your `PATH`.
3. On the phone, enable **Developer options** and **USB debugging**, connect it, and check that it appears in:

   ```bash
   adb devices
   ```

AR features need a phone that supports ARCore (Google Play Services for AR). The emulator can run most of the app, but not AR.

The full official guide is Expo's [Set up your environment](https://docs.expo.dev/get-started/set-up-your-environment/?mode=development-build&buildEnv=local) (development build, local).

## Getting started

```bash
# 1. Clone and install
git clone https://github.com/ArturoMoralesSan/zooApp.git
cd zooApp
npm install

# 2. Configure the environment
cp .env-example .env
# then edit .env (see below)

# 3. Build and install the development build on the phone
npx expo prebuild --clean
npx expo run:android
```

Step 3 compiles the native app and installs it on the connected phone. You only need to repeat it when native code changes (see [When to rebuild](#when-to-rebuild)). For day-to-day work, start the dev server and open the already-installed app:

```bash
npx expo start
```

### Environment variables

`.env` is ignored by git. Copy `.env-example` and fill in:

| Variable                           | Required | Description                                                                                             |
| ---------------------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `EXPO_PUBLIC_API_URL`              | yes      | Backend base URL, e.g. `http://192.168.1.20:8000` (no trailing `/api`). The app won't start without it. |
| `EXPO_PUBLIC_ZOODECK_QUIZ_DEBUG`   | no       | `1` enables a fake duel that needs no QR code or backend quiz.                                          |
| `EXPO_PUBLIC_ZOODECK_VISIT_CHECKS` | no       | `0` disables the "you must be at the zoo" checks, so duels can be tested anywhere.                      |
| `EXPO_PUBLIC_ZOODECK_FORCE_360`    | no       | `1` (dev only) shows the 360° view instead of AR, to test it on any phone.                              |
| `EXPO_PUBLIC_ZOODECK_NOAR_SUPPORT` | no       | `1` (dev only) makes any phone behave as one without ARCore (360° view, no AR selfie).                  |

When the backend runs on your computer, use your computer's LAN IP (not `localhost`) so the phone can reach it. Restart Metro after changing `.env`.

## Scripts and commands

| Command                        | What it does                                                               |
| ------------------------------ | -------------------------------------------------------------------------- |
| `npx expo start`               | Start the Metro dev server (`-c` clears its cache)                         |
| `npm run android`              | Build and install the Android development build (`expo run:android`)       |
| `npm run lint`                 | ESLint (must report 0 problems)                                            |
| `npm run typecheck`            | Type-check, app and tests (must report 0 errors)                           |
| `npm test`                     | Unit and integration tests (Jest); `npm test -- <path>` runs one file      |
| `npm run test:ci`              | Tests with coverage, as CI runs them (report in `coverage/`)               |
| `npx prettier --write <files>` | Format files (tabs, single quotes, no semicolons, sorted Tailwind classes) |
| `npx expo install <package>`   | Add a dependency with the version that matches SDK 57                      |

## Troubleshooting

### When to rebuild

| You changed…                                                           | Do this                            |
| ---------------------------------------------------------------------- | ---------------------------------- |
| JS/TS code, components, screens                                        | Nothing, it hot-reloads            |
| `tailwind.config.js`, `metro.config.js`, `src/theme/colors.js`, `.env` | Restart Metro: `npx expo start -c` |
| Added/upgraded a native package, or changed `app.json` plugins         | Rebuild: `npx expo run:android`    |

### Common problems

- **"EXPO_PUBLIC_API_URL no está definida"**: `.env` is missing or Metro was started before you created it. Create it and run `npx expo start -c`.
- **The app opens in Expo Go and crashes**: this project uses native modules (AR, maps) that Expo Go doesn't include. Use the development build installed by `npx expo run:android`.
- **The phone can't reach the API**: check that phone and computer are on the same network and that `EXPO_PUBLIC_API_URL` uses the computer's LAN IP.
- **Styles don't update** after editing the Tailwind config or the palette: restart Metro with `-c`.
- **Build fails with a Java error**: check `java -version` reports 17.

## Roadmap

- **Payment provider integration**: connect ticket purchases and donations to a payment gateway.
- **Settings**: on the screen (Panel → Configuración) only the AR placement is saved and used so far; the other choices are a visual draft: language, dark mode, graphics quality and storage (a summary that links to each download, such as the ZooDeck pack).
- **Help**: complete the Panel's help section.
- **iOS release**: configure, test and publish the iOS build.

## License

See [LICENSE](LICENSE).
