# Contributing to ZooApp

This guide covers the workflow, the code standards and step-by-step recipes for adding screens, data, modules and components. Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) first if you haven't: the recipes assume you know how the layers fit together.

## Contents

1. [Setup](#setup)
2. [Workflow](#workflow)
3. [Code standards](#code-standards)
4. [Recipes](#recipes)
   - [Add a screen](#add-a-screen)
   - [Read data from the API](#read-data-from-the-api)
   - [Send data to the API](#send-data-to-the-api)
   - [Add a new module](#add-a-new-module)
   - [Add a component](#add-a-component)
   - [Add a package or native module](#add-a-package-or-native-module)
   - [Add a 3D model or AR scene](#add-a-3d-model-or-ar-scene)
5. [Testing on a device](#testing-on-a-device)
6. [Definition of done](#definition-of-done)

## Setup

Follow the [README](README.md#getting-started) to install the tools, create `.env` and install the development build on your phone. Ask the team for a test account and the backend URL; never commit either.

## Workflow

### Branches

Never commit to `main`. Start every task from an up-to-date `main`:

```bash
git checkout main && git pull
git checkout -b feat/events-module
```

| Prefix      | For                                    |
| ----------- | -------------------------------------- |
| `feat/`     | new functionality                      |
| `fix/`      | bug fixes                              |
| `design/`   | visual changes that follow the PDFs    |
| `refactor/` | restructuring without behavior changes |
| `chore/`    | tooling, dependencies, docs            |

### Commits

- Small commits, one logical change each.
- Subject in the imperative mood, under 72 characters (`Add the events list screen`, not `added events`).
- A short body explaining **why**, when it isn't obvious.

### Pull requests

```bash
git push -u origin feat/events-module
gh pr create --base main
```

The description should answer:

- **What changed**, in a few bullets.
- **How to test it**: the screens to open and the steps to follow.
- **Rebuild needed?** Say whether reviewers need `npx expo run:android` (native change) or `npx expo start -c` (Tailwind config, palette, Metro config or `.env` change).

Screenshots or a short screen recording help for UI changes. PRs are merged with a merge commit and the branch is deleted (`gh pr merge --merge --delete-branch`).

## Code standards

Match the surrounding code: same naming, comment density and idioms. Comments explain _why_, briefly; don't narrate what the code does.

### TypeScript

- Strict mode, no `any`.
- API shapes live in `src/types/<domain>.ts`.
- Import with the `@/` alias (`@/components/ui/Button`), not long relative paths.

### Components and files

- One component per file, named export, its props type in the same file.
- Screens stay thin: they compose components and hold screen state. Data fetching goes in hooks and services, pure logic in `src/utils/`.
- Never put non-route files in `src/app/`; expo-router turns every file there into a screen.

### Styling

- NativeWind `className` only. `StyleSheet.create` is a lint error.
- Inline `style` only for animated values, values computed at runtime (insets, sizes from props or the API) and Android-only props.
- **Colors**: palette tokens only (`bg-esmeralda`, `text-tinta-2`, `border-card-border`, or `colors.<token>` in TS). Hex and `rgb()` literals are lint errors. Use opacity modifiers (`bg-tinta/[0.78]`). Don't add new colors without the team's OK. The rare justified exception is marked with `// eslint-disable-next-line no-restricted-syntax -- <reason>`.
- **Typography**: role classes (`text-h1`, `text-subtitle`, `text-h2`, `text-h3`, `text-body`, `text-meta`, `text-overline`, `text-button`) or family classes (`font-display`, `font-sans-semibold`, `font-sans-bold`…). Never `font-bold`/`font-semibold`: on Android they make custom fonts fall back to the system font. Minimum text size is 12px.
- **Spacing**: the Tailwind scale (4/8/12/16/20/24/32px = `1/2/3/4/5/6/8`). Screen side margin is `px-5` (20px).
- **Radius**: `rounded-xl` controls and icon boxes, `rounded-2xl` cards, `rounded-3xl` sheets and modals, `rounded-full` chips.
- **Borders**: `border-1.5`. No diffuse shadows: depth comes from borders.
- Arbitrary values (`h-[180px]`) only when the design really needs them.
- **Layout gotcha**: NativeWind's `flex-1` is not React Native's `flex: 1`. In a column whose height depends on its content, use `style={{ flex: 1 }}` (see `ListCard`).

### Icons and accessibility

- Icons through the `Icon` wrapper (Hugeicons, default size 22, stroke 2.2).
- Touch targets of at least 40dp.
- Controls show the focus ring (`FocusRing`).
- Never convey a state by color alone: add an icon or text.

### Design references

The PDFs in [docs/design/](docs/design/) are the source of truth for UI. Useful pages:

| `design-system.pdf`        | Page | `mobile-app.pdf` (390×844, A-01…A-44) | Pages |
| -------------------------- | ---- | ------------------------------------- | ----- |
| Colors                     | 3    | Auth                                  | 4     |
| Fonts, icons, rules        | 4    | Explore, Panel, QR, profile           | 6–7   |
| Spacing, radii, type scale | 5    | Species                               | 9     |
| Component measurements     | 6    | Map                                   | 11    |
| Game components            | 7    | ZooDeck and duels                     | 12–14 |
|                            |      | Collection, 3D view, AR               | 15–18 |
|                            |      | Tickets                               | 20–21 |
|                            |      | Donations                             | 23–24 |
|                            |      | 404 and system states                 | 26–27 |

Key measurements: buttons and inputs 52dp (primary button with a 3px Bosque bottom border), back button 40, chip 32, badge 24, list card padding 16 with a 40 icon and 32 chevron, tab bar 72dp floating 16dp with radius 24, modal padding 24×20 with a Tinta 78% backdrop, focus = 2px Bosque border + 3px Lima ring.

### Formatting and lint

```bash
npx prettier --write <files>   # tabs, single quotes, no semicolons, sorted classes
npx eslint <files>             # while working
npm run lint                   # whole project, before committing
npx tsc --noEmit               # whole project, before committing
```

## Recipes

The examples below build a hypothetical **Events** module (`/events` endpoint). Replace names with your own domain. Each step points to a real file you can copy from.

### Add a screen

1. Create the route file, e.g. `src/app/events/index.tsx`. The path is the URL: `router.push('/events')`.
2. Wrap it in `ScreenBackground` (safe areas and background pattern).
3. Add a header: `TopBar` for stack screens with a back button, `TabHeader` for tabs, `ScreenHeader` for the large title inside the scroll.
4. Use a 20px side margin (`px-5`).
5. Call `useSessionRedirect()` if the screen needs a logged-in user.
6. Bottom spacing: never hardcode it, the Android navigation bar varies.
   - Scrollable content: `useScrollBottomSpace(base)` from `@/theme/layout`.
   - Fixed footer: `FixedFooter` plus `useFixedFooterSpace()` for the scroll padding.

Skeleton, based on [src/app/species/index.tsx](src/app/species/index.tsx):

```tsx
import { router } from 'expo-router'

import { KeyboardScrollView } from '@/components/ui/KeyboardScrollView'
import { ScreenBackground } from '@/components/ui/ScreenBackground'
import { ScreenHeader } from '@/components/ui/TabHeader'
import { TopBar } from '@/components/ui/TopBar'
import { useScrolled } from '@/hooks/useScrolled'
import { useSessionRedirect } from '@/hooks/useSessionRedirect'

export default function EventsScreen() {
	const { scrolled, pastTitle, onScroll, onTitleLayout } = useScrolled()

	useSessionRedirect()

	return (
		<ScreenBackground>
			<TopBar
				onBack={() => router.back()}
				title='Eventos'
				showTitle={pastTitle}
				scrolled={scrolled}
			/>

			<KeyboardScrollView
				onScroll={onScroll}
				scrollEventThrottle={16}
				className='flex-1'
				contentContainerClassName='grow px-5 pt-2'
			>
				<ScreenHeader
					title='Eventos'
					subtitle='Lo que pasa hoy en el zoológico.'
					onLayout={onTitleLayout}
				/>

				{/* content */}
			</KeyboardScrollView>
		</ScreenBackground>
	)
}
```

Screens are discovered automatically; add a `Stack.Screen` in a `_layout.tsx` only when you need per-screen options.

### Read data from the API

Four layers, each in its own folder. Model: species ([types](src/types/species.ts), [service](src/services/species.ts), [hook](src/hooks/useSpecies.ts), [screen](src/app/species/index.tsx)).

**1. Types** in `src/types/events.ts`, matching the API response:

```ts
export type ZooEvent = {
	id: number
	title: string
	starts_at: string
}

export type EventsResponse = {
	success: boolean
	data: { events: ZooEvent[] }
}
```

**2. Service** in `src/services/events.ts`. The keys object holds endpoint paths, which are also the cache keys. `api()` adds the base URL and token itself.

```ts
import type { EventsResponse, ZooEvent } from '@/types/events'

import { api } from './api'

export const eventsKeys = {
	list: '/events',
	detail: (id: number) => `/events/${id}`,
}

export async function getEvents(): Promise<ZooEvent[]> {
	const response = await api<EventsResponse>(eventsKeys.list)

	return response.data.events ?? []
}
```

**3. Hook** in `src/hooks/useEvents.ts`. Only `src/hooks/` may import `swr`; go through `useQuery`.

```ts
import { eventsKeys, getEvents } from '@/services/events'

import { useQuery } from './useQuery'

export function useEvents() {
	return useQuery(eventsKeys.list, getEvents)
}
```

Pass `null` as the key to skip the request until a parameter is ready (see `useSpeciesDetail`).

**4. Screen**: render through `QueryView`, which handles loading, error, offline and empty states.

```tsx
const eventsQuery = useEvents()

<QueryView
	query={eventsQuery}
	loadingMessage='Cargando eventos…'
	errorTitle='No pudimos cargar los eventos'
	isEmpty={(events) => events.length === 0}
	empty={{
		icon: Calendar03Icon,
		title: 'No hay eventos',
		message: 'Vuelve pronto.',
	}}
>
	{(events) => events.map((event) => <EventCard key={event.id} event={event} />)}
</QueryView>
```

### Send data to the API

Model: [src/services/donations.ts](src/services/donations.ts) (`createDonation`) and [src/app/donations/summary.tsx](src/app/donations/summary.tsx).

**1. Service function**: a plain async function, no hook.

```ts
export async function registerForEvent(id: number): Promise<Registration> {
	const response = await api<RegistrationResponse>(
		`${eventsKeys.detail(id)}/register`,
		{ method: 'POST', body: JSON.stringify({}) },
	)

	return response.data.registration
}
```

**2. Handler in the screen**:

```tsx
const { refreshMyTickets } = useDataRefresh()

const register = async () => {
	// Offline: don't send, explain why.
	if (await checkOffline()) {
		notifyOffline('Necesitas conexión para registrarte.')
		return
	}

	// Needs a session: sends the user to /login when signed out.
	if (await redirectIfSignedOut()) return

	setLoading(true)

	try {
		await registerForEvent(event.id)
		void refreshMyTickets() // refresh every read the write affects
		router.replace('/events/success')
	} catch (err: unknown) {
		if (isNetworkError(err)) {
			notifyOffline('Necesitas conexión para registrarte.')
			return
		}

		// 422: per-field messages for TextField's `error`
		if (err instanceof ApiValidationError) {
			setFieldErrors(err.errors)
			return
		}

		setError(err instanceof Error ? err.message : 'Intenta de nuevo.')
	} finally {
		setLoading(false)
	}
}
```

Show the generic error with `Toast` (title + message), as the donation summary does.

**3. Refreshing reads.** Use `useDataRefresh()` from [src/hooks/useDataRefresh.ts](src/hooks/useDataRefresh.ts). If your write affects a read that isn't there yet, add a function to it (e.g. `refreshEvents: () => mutate(eventsKeys.list)`). Don't import `mutate` from `swr`: the app uses its own cache provider and the global `mutate` doesn't reach it.

### Add a new module

A module is a feature with its own screens, like tickets or donations.

1. **Find the screens** in `docs/design/mobile-app.pdf` and note their codes (A-xx).
2. **Data**: types, service and hooks, as in [Read data](#read-data-from-the-api) and [Send data](#send-data-to-the-api).
3. **Routes**: a folder `src/app/events/` with one file per screen (`index.tsx`, `[id].tsx`, `summary.tsx`, `success.tsx`…). Dynamic segments use brackets; read them with `useLocalSearchParams()`.
4. **Flow state**: if several screens share state (like a duel), put a context in `src/contexts/` and provide it from the folder's `_layout.tsx` (see [src/app/duel/_layout.tsx](src/app/duel/_layout.tsx)). Otherwise pass ids through route params and refetch.
5. **Components** used only by this module go in `src/components/events/`.
6. **Entry point**: link to it from where the design says, usually an Explore shortcut (`ListCard` in [src/app/(tabs)/index.tsx](<src/app/(tabs)/index.tsx>)) or the Panel. A new tab means a `Tabs.Screen` in `src/app/(tabs)/_layout.tsx` and a change to `TabBar`; check with the team first.
7. **Refresh**: add any new refresh function to `useDataRefresh`.

### Add a component

1. **Check `src/components/ui/` first.** It already has Button, IconButton, Card, ListCard, IconBox, Chip, Badge, StatCard, DetailRow, Divider, SectionTitle, Notice, Toast, Modal, BottomSheet, TextField, PasswordField, SearchField, Toggle, SegmentedTabs, QuantityStepper, ProgressBar, QueryView and the loading/error/empty states. If something is close, add a variant or prop rather than copying it.
2. **Decide where it goes**:
   - in the design system (`design-system.pdf`) or used by more than one module → `src/components/ui/`, built to the spec measurements;
   - used by one module → `src/components/<domain>/`.
3. **Write it**: one component per file, named export, props type above it, `className` prop passed through when the caller needs to position it.

```tsx
import { Text } from 'react-native'

import { Card } from '@/components/ui/Card'
import type { ZooEvent } from '@/types/events'

type EventCardProps = {
	event: ZooEvent
	onPress?: () => void
	className?: string
}

// Builds on Card, which already has the border, radius, padding, pressed
// state and focus ring from the design system.
export function EventCard({ event, onPress, className }: EventCardProps) {
	return (
		<Card onPress={onPress} className={className}>
			<Text className='text-h3 text-tinta'>{event.title}</Text>
			<Text className='text-meta text-tinta-2'>{event.starts_at}</Text>
		</Card>
	)
}
```

`Toast` and `FixedFooter` are default exports, so import them without braces.

### Add a package or native module

1. **Ask the team first.** A package with native code forces everyone to rebuild the app.
2. Install with `npx expo install <package>` so the version matches SDK 57.
3. If it has a config plugin, add it to `plugins` in `app.json`.
4. Rebuild: `npx expo prebuild --clean && npx expo run:android`.
5. Mention the rebuild in the PR description.

Before writing Expo code, read the docs for the exact SDK version: <https://docs.expo.dev/versions/v57.0.0/>.

### Add a 3D model or AR scene

- **Models**: `.glb` files (one binary with textures) in `assets/models/`. Keep them small (a few MB, few draw calls), set `scale` explicitly, show a loading state and handle `onError`. Other extensions need a `declare module` in `src/assets.d.ts`.
- **Scenes**: in `src/components/ar/`. Viro components (`ViroARScene`, `Viro3DObject`…) are not React Native views: no `className` or layout props. Define scene components at module level, never inline, and pass data with `viroAppProps`.
- **Plane placement**: forward the scene's anchor events to `ViroARPlaneSelector` through its ref (`handleAnchorFound/Updated/Removed`).
- **UI over the camera** is regular React Native in an absolutely positioned layer: dark panel at 82%, white 48–56dp buttons, 76dp shutter (design system p.7).
- **Fallback**: use `useArAvailability()` and show the 360° view when AR isn't available.
- **Lighting colors** in a scene aren't UI colors: mark them `// eslint-disable-next-line no-restricted-syntax -- AR light color`.
- References: the [ViroReact docs](https://viro-community.readme.io/docs) and the types in `node_modules/@reactvision/react-viro`.

## Testing on a device

The app is tested on a real Android phone with the development build.

- **Run**: `npx expo start`, then open the installed app. Shake the phone or run `adb shell input keyevent 82` for the dev menu.
- **States to check** for any screen with data: loading, error, empty, and offline.
- **Offline**: turn off Wi-Fi and mobile data (or `adb shell svc wifi disable && adb shell svc data disable`, then `enable`). If Metro runs over USB, run `adb reverse tcp:8081 tcp:8081` first so the phone still reaches it. Always turn the network back on.
- **Duels away from the zoo**: set `EXPO_PUBLIC_ZOODECK_VISIT_CHECKS=0`, or `EXPO_PUBLIC_ZOODECK_QUIZ_DEBUG=1` for a fake duel without QR or backend (see the [README](README.md#environment-variables)).
- **AR** needs an ARCore phone; the emulator can't test it. Use `EXPO_PUBLIC_ZOODECK_FORCE_360=1` to test the 360° fallback.
- **Measuring the UI**: `adb shell uiautomator dump` gives element bounds in px; dp = px ÷ (`adb shell wm density` ÷ 160). Compare with the design measurements.

Keep screenshots and notes out of the repo.

## Definition of done

- [ ] `npm run lint` reports 0 problems and `npx tsc --noEmit` reports 0 errors.
- [ ] The change matches the design PDFs and was checked on a phone (or the PR says why it couldn't be).
- [ ] Loading, error, empty and offline states are handled for new data.
- [ ] No hardcoded colors, sizes, or markup that a `ui/` component already covers.
- [ ] No debug `console.log`s, screenshots, notes or credentials left in the repo.
- [ ] The PR says how to test and whether a rebuild or `expo start -c` is needed.
