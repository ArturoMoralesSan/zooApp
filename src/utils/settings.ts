import {
	DashboardSpeed01Icon,
	Globe02Icon,
	LanguageSquareIcon,
	Leaf01Icon,
	MagicWand01Icon,
	Moon02Icon,
	Rotate360Icon,
	SmartPhone01Icon,
	SlidersHorizontalIcon,
	SparklesIcon,
	Sun03Icon,
	Touch01Icon,
	VrGlassesIcon,
} from '@hugeicons/core-free-icons'

import type {
	AnimalView,
	AppLanguage,
	ArPlacement,
	GraphicsEffects,
	GraphicsQuality,
	SettingOption,
	StorageCategory,
	ThemeMode,
} from '@/types/settings'

export const LANGUAGE_OPTIONS: SettingOption<AppLanguage>[] = [
	{
		value: 'es',
		label: 'Español',
		description: 'Idioma de la aplicación.',
		icon: LanguageSquareIcon,
	},
	{
		value: 'en',
		label: 'English',
		description: 'App language.',
		icon: Globe02Icon,
	},
]

export const THEME_OPTIONS: SettingOption<ThemeMode>[] = [
	{
		value: 'system',
		label: 'Como el teléfono',
		description: 'Cambia entre claro y oscuro con tu teléfono.',
		icon: SmartPhone01Icon,
	},
	{
		value: 'light',
		label: 'Claro',
		description: 'Fondo claro siempre.',
		icon: Sun03Icon,
	},
	{
		value: 'dark',
		label: 'Oscuro',
		description: 'Fondo oscuro, más cómodo de noche.',
		icon: Moon02Icon,
	},
]

// Plane first: it's the default. Auto is still experimental.
export const AR_PLACEMENT_OPTIONS: SettingOption<ArPlacement>[] = [
	{
		value: 'plane',
		label: 'En una superficie',
		description:
			'Elige tú dónde ponerlo: toca una de las superficies que marca la cámara.',
		icon: Touch01Icon,
	},
	{
		value: 'auto',
		label: 'Automática',
		description:
			'El animal aparece en el primer suelo que encuentre la cámara.',
		icon: MagicWand01Icon,
		badge: 'Experimental',
	},
]

export const ANIMAL_VIEW_OPTIONS: SettingOption<AnimalView>[] = [
	{
		value: 'ar',
		label: 'Realidad aumentada (AR)',
		description: 'El animal aparece en la cámara, junto a ti.',
		icon: VrGlassesIcon,
	},
	{
		value: '360',
		label: 'Vista 360°',
		description:
			'El animal aparece en una sabana virtual. No necesita cámara ni espacio libre.',
		icon: Rotate360Icon,
	},
]

export const GRAPHICS_OPTIONS: SettingOption<GraphicsQuality>[] = [
	{
		value: 'auto',
		label: 'Automática',
		description: 'Se ajusta a tu teléfono.',
		icon: DashboardSpeed01Icon,
	},
	{
		value: 'high',
		label: 'Alta',
		description:
			'Sombras en tiempo real y la sabana completa en la vista 360°.',
		icon: SparklesIcon,
	},
	{
		value: 'saver',
		label: 'Ahorro',
		description:
			'Sin sombras en tiempo real y un suelo simple: carga más rápido y gasta menos batería.',
		icon: Leaf01Icon,
	},
	{
		value: 'custom',
		label: 'Personalizada',
		description: 'Elige tú cada efecto, abajo.',
		icon: SlidersHorizontalIcon,
	},
]

export const GRAPHICS_PRESETS: Record<'high' | 'saver', GraphicsEffects> = {
	high: {
		arDaylight: true,
		arLiveShadow: true,
		arBlob: true,
		view360Scenario: true,
		view360LiveShadow: true,
	},
	saver: {
		arDaylight: true,
		arLiveShadow: false,
		arBlob: true,
		view360Scenario: false,
		view360LiveShadow: false,
	},
}

// Weight of each effect, from a moto g 5G (2024): the savanna costs about
// 80 MB of graphics memory; the live shadows no measurable fps (AR stays
// at 30, the 360° view at 60), only a little work per frame; the light and
// the blob next to nothing.
const EFFECT_COST: Record<keyof GraphicsEffects, number> = {
	arDaylight: 0.5,
	arLiveShadow: 1,
	arBlob: 0.5,
	view360Scenario: 5,
	view360LiveShadow: 1,
}
const TOTAL_COST = Object.values(EFFECT_COST).reduce((sum, n) => sum + n, 0)

export type GraphicsLoad = { share: number; level: 'low' | 'medium' | 'high' }

// How much the chosen effects ask of the phone, 0–1, and its level.
export function graphicsLoad(effects: GraphicsEffects): GraphicsLoad {
	const used = (Object.keys(EFFECT_COST) as (keyof GraphicsEffects)[])
		.filter((key) => effects[key])
		.reduce((sum, key) => sum + EFFECT_COST[key], 0)
	const share = used / TOTAL_COST

	return {
		share,
		level: share < 0.35 ? 'low' : share < 0.7 ? 'medium' : 'high',
	}
}

const GB = 1024 ** 3
// 'auto' saves on phones under 3 GB of memory, or when the system doesn't
// say. Not 4 GB: a phone sold with 4 reports about 3.4 (the system keeps
// the rest) and runs Alta at full speed. expo-device's year class isn't
// used: on Android it's guessed from an old RAM/CPU table, and a 2024 moto
// g with 4 GB reads as 2015.
const AUTO_MIN_MEMORY = 3 * GB

export function autoGraphicsLevel(device: DeviceClass): 'high' | 'saver' {
	const { totalMemory } = device

	return totalMemory !== null && totalMemory >= AUTO_MIN_MEMORY
		? 'high'
		: 'saver'
}

export function optionLabel<T extends string>(
	options: SettingOption<T>[],
	value: T,
): string {
	const option = options.find((item) => item.value === value)

	if (!option) return ''

	// The badge goes along, so the row also says "Experimental".
	return option.badge ? `${option.label} · ${option.badge}` : option.label
}

// Placeholder sizes for the settings draft, until storage is measured.
export const DRAFT_STORAGE: StorageCategory[] = [
	{ key: 'cards', label: 'Paquete ZooDeck', bytes: 124_000_000 },
	{ key: 'photos', label: 'Fotos y selfies', bytes: 15_600_000 },
	{ key: 'offline', label: 'Especies y mapa', bytes: 0 },
	{ key: 'cache', label: 'Archivos temporales', bytes: 48_300_000 },
]

export const DRAFT_FREE_BYTES = 12_400_000_000

export type DeviceClass = {
	totalMemory: number | null
}

// The effects a level turns on; 'custom' uses the user's own mix. The 360°
// live shadow needs the savanna: the plain ground is unlit and takes no
// shadow (an arShadowReceiver quad doesn't work outside AR).
export function resolveGraphics(
	quality: GraphicsQuality,
	custom: GraphicsEffects,
	device: DeviceClass,
): GraphicsEffects {
	if (quality === 'custom') {
		return {
			...custom,
			view360LiveShadow: custom.view360Scenario && custom.view360LiveShadow,
		}
	}

	return GRAPHICS_PRESETS[
		quality === 'auto' ? autoGraphicsLevel(device) : quality
	]
}
