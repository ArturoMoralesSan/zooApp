import type { IconSvgElement } from '@hugeicons/react-native'

export type AppLanguage = 'es' | 'en'

export type ThemeMode = 'system' | 'light' | 'dark'

// 'plane' (default): the user picks the surface; 'auto' (experimental): the
// animal appears on the first floor found.
export type ArPlacement = 'auto' | 'plane'

// What the 3D views may spend: live shadow, the 360° scenario…
export type GraphicsQuality = 'auto' | 'high' | 'saver'

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
