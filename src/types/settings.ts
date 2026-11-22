import type { IconSvgElement } from '@hugeicons/react-native'

export type AppLanguage = 'es' | 'en'

export type ThemeMode = 'system' | 'light' | 'dark'

// 'auto': the animal appears on the first floor found; 'plane': the user
// picks the surface.
export type ArPlacement = 'auto' | 'plane'

// What the 3D views may spend: live shadow, the 360° scenario…
export type GraphicsQuality = 'auto' | 'high' | 'saver'

export type SettingOption<T extends string> = {
	value: T
	label: string
	description: string
	icon: IconSvgElement
}

export type StorageCategory = {
	key: 'cards' | 'photos' | 'offline' | 'cache'
	label: string
	bytes: number
}
