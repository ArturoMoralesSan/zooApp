import * as SecureStore from 'expo-secure-store'

import type {
	ArPlacement,
	GraphicsEffects,
	GraphicsQuality,
} from '@/types/settings'
import { GRAPHICS_PRESETS } from '@/utils/settings'

// App preferences, remembered per device. SecureStore is the only key-value
// store the app ships with (see hints.ts).
const AR_PLACEMENT_KEY = 'zooapp_pref_ar_placement'
const GRAPHICS_KEY = 'zooapp_pref_graphics'
// The switches of "Personalizada", kept even while another level is on.
const GRAPHICS_CUSTOM_KEY = 'zooapp_pref_graphics_custom'

const AR_PLACEMENTS: readonly ArPlacement[] = ['plane', 'auto']
const GRAPHICS_LEVELS: readonly GraphicsQuality[] = [
	'auto',
	'high',
	'saver',
	'custom',
]

// How AR places the animal. Unset, unknown or unreadable: 'plane' ('auto'
// is experimental).
export async function getArPlacement(): Promise<ArPlacement> {
	try {
		const value = await SecureStore.getItemAsync(AR_PLACEMENT_KEY)

		return AR_PLACEMENTS.find((item) => item === value) ?? 'plane'
	} catch {
		return 'plane'
	}
}

export async function setArPlacement(value: ArPlacement): Promise<void> {
	try {
		await SecureStore.setItemAsync(AR_PLACEMENT_KEY, value)
	} catch {
		// Not critical: AR uses the default until it's chosen again.
	}
}

// "Calidad gráfica". Unset, unknown or unreadable: 'auto'.
export async function getGraphicsQuality(): Promise<GraphicsQuality> {
	try {
		const value = await SecureStore.getItemAsync(GRAPHICS_KEY)

		return GRAPHICS_LEVELS.find((item) => item === value) ?? 'auto'
	} catch {
		return 'auto'
	}
}

export async function setGraphicsQuality(
	value: GraphicsQuality,
): Promise<void> {
	try {
		await SecureStore.setItemAsync(GRAPHICS_KEY, value)
	} catch {
		// Not critical: the views use 'auto' until it's chosen again.
	}
}

// The user's own mix. Each effect missing or unreadable takes Alta's value.
export async function getGraphicsCustom(): Promise<GraphicsEffects> {
	const custom = { ...GRAPHICS_PRESETS.high }

	try {
		const value = await SecureStore.getItemAsync(GRAPHICS_CUSTOM_KEY)
		const saved: unknown = value ? JSON.parse(value) : null

		if (saved && typeof saved === 'object') {
			for (const key of Object.keys(custom) as (keyof GraphicsEffects)[]) {
				const flag = (saved as Record<string, unknown>)[key]

				if (typeof flag === 'boolean') custom[key] = flag
			}
		}
	} catch {
		// Alta's switches.
	}

	return custom
}

export async function setGraphicsCustom(value: GraphicsEffects): Promise<void> {
	try {
		await SecureStore.setItemAsync(GRAPHICS_CUSTOM_KEY, JSON.stringify(value))
	} catch {
		// Not critical, as above.
	}
}
