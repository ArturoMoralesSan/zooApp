import {
	BalloonsIcon,
	BeachIcon,
	BellIcon,
	BirdIcon,
	BugIcon,
	CactusIcon,
	CakeIcon,
	CampfireIcon,
	CatIcon,
	CrabIcon,
	CrownIcon,
	EggIcon,
	FireworksIcon,
	FishIcon,
	FlagIcon,
	FlowerIcon,
	GhostIcon,
	GiftIcon,
	GraduationCapIcon,
	HeartIcon,
	HorseIcon,
	IceCreamIcon,
	LeafIcon,
	MoonIcon,
	MountainIcon,
	OctopusIcon,
	PandaIcon,
	PartyPopperIcon,
	PawPrintIcon,
	PineTreeIcon,
	PumpkinIcon,
	RabbitIcon,
	RoseIcon,
	SchoolIcon,
	ShellIcon,
	SkullIcon,
	SnailIcon,
	SnowIcon,
	SnowflakeIcon,
	SparklesIcon,
	SproutIcon,
	SquirrelIcon,
	StarIcon,
	Sun03Icon,
	Ticket01Icon,
	TulipIcon,
	TurtleIcon,
	UmbrellaIcon,
	WatermelonIcon,
} from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react-native'

import colors from '@/theme/colors'
import type { SeasonColor } from '@/types/points'

// Server catalog (point-season-styles.json): keys never change, new ones may
// appear before the app knows them.
const SEASON_ICONS: Record<string, IconSvgElement> = {
	'pine-tree': PineTreeIcon,
	gift: GiftIcon,
	snowflake: SnowflakeIcon,
	bell: BellIcon,
	pumpkin: PumpkinIcon,
	ghost: GhostIcon,
	skull: SkullIcon,
	flower: FlowerIcon,
	heart: HeartIcon,
	rose: RoseIcon,
	egg: EggIcon,
	rabbit: RabbitIcon,
	flag: FlagIcon,
	fireworks: FireworksIcon,
	sun: Sun03Icon,
	beach: BeachIcon,
	umbrella: UmbrellaIcon,
	'ice-cream': IceCreamIcon,
	watermelon: WatermelonIcon,
	cactus: CactusIcon,
	leaf: LeafIcon,
	tulip: TulipIcon,
	sprout: SproutIcon,
	snow: SnowIcon,
	moon: MoonIcon,
	mountain: MountainIcon,
	campfire: CampfireIcon,
	'paw-print': PawPrintIcon,
	panda: PandaIcon,
	turtle: TurtleIcon,
	bird: BirdIcon,
	cat: CatIcon,
	fish: FishIcon,
	horse: HorseIcon,
	squirrel: SquirrelIcon,
	snail: SnailIcon,
	crab: CrabIcon,
	octopus: OctopusIcon,
	bug: BugIcon,
	shell: ShellIcon,
	sparkles: SparklesIcon,
	'party-popper': PartyPopperIcon,
	balloons: BalloonsIcon,
	cake: CakeIcon,
	'graduation-cap': GraduationCapIcon,
	school: SchoolIcon,
	star: StarIcon,
	crown: CrownIcon,
	ticket: Ticket01Icon,
}

export function seasonIcon(key: string | null | undefined): IconSvgElement {
	return (key && SEASON_ICONS[key]) || SparklesIcon
}

export type SeasonTones = {
	accent: string
	onAccent: string
	soft: string
	text: string
}

// Brand tones, the same the panel previews for "Predeterminado".
const DEFAULT_TONES: SeasonTones = {
	accent: colors.esmeralda,
	onAccent: colors.blanco,
	soft: colors.hoja,
	text: colors.bosque,
}

// Runtime colors from the panel, so they go in `style`, never in classes.
export function seasonTones(
	color: SeasonColor | null | undefined,
): SeasonTones {
	if (!color) return DEFAULT_TONES

	return {
		accent: color.accent,
		onAccent: color.on_accent,
		soft: color.soft,
		text: color.text,
	}
}

// `#RRGGBB` plus an alpha byte, for borders that shouldn't compete with the
// text. Anything else is returned as is (opaque).
export function withAlpha(hex: string, alpha: number): string {
	if (!/^#[0-9a-f]{6}$/i.test(hex)) return hex

	const byte = Math.round(Math.min(1, Math.max(0, alpha)) * 255)

	return hex + byte.toString(16).padStart(2, '0')
}

export type PointChange = 'up' | 'down' | 'same'

export function pointChange(basePoints: number, points: number): PointChange {
	if (points > basePoints) return 'up'
	if (points < basePoints) return 'down'
	return 'same'
}

// "150 pts", or "Sin puntos" for a rule the season turns off.
export function formatSeasonPoints(points: number): string {
	return points === 0 ? 'Sin puntos' : `${points.toLocaleString('es-MX')} pts`
}
