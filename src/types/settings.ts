import type { IconSvgElement } from '@hugeicons/react-native'

export type AppLanguage = 'es' | 'en'

export type ThemeMode = 'system' | 'light' | 'dark'

// 'plane' (default): the user picks the surface; 'auto' (experimental): the
// animal appears on the first floor found.
export type ArPlacement = 'auto' | 'plane'

// What the 3D views may spend: live shadow, the 360° scenario… 'custom'
// picks each effect (GraphicsEffects).
export type GraphicsQuality = 'auto' | 'high' | 'saver' | 'custom'

// Each effect the 3D views can turn off. The selfie ignores them.
export type GraphicsEffects = {
	// AR: sun and sky light; off, the old flat light.
	arDaylight: boolean
	// AR: the animal's live shadow on the real floor.
	arLiveShadow: boolean
	// AR: the soft contact shadow under its feet.
	arBlob: boolean
	// 360°: the savanna and its sky; off, a plain circle floor.
	view360Scenario: boolean
	view360LiveShadow: boolean
}

export type SettingOption<T extends string> = {
	value: T
	label: string
	description: string
	icon: IconSvgElement
	// Shown as a badge next to the label, e.g. "Experimental".
	badge?: string
}

export type StorageCategory = {
	key: 'cards' | 'photos' | 'offline' | 'cache'
	label: string
	bytes: number
}
