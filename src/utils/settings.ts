import {
	DashboardSpeed01Icon,
	Globe02Icon,
	LanguageSquareIcon,
	Leaf01Icon,
	MagicWand01Icon,
	Moon02Icon,
	SmartPhone01Icon,
	SparklesIcon,
	Sun03Icon,
	Touch01Icon,
} from '@hugeicons/core-free-icons'

import type {
	AppLanguage,
	ArPlacement,
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
]

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
