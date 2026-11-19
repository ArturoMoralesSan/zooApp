import type { Rarity } from '@/types/cards'

// Tones of a season, picked in the panel. Each pair has ≥ 4.5:1 contrast:
// `text` on `soft` (the notice) and `on_accent` on `accent` (icon, chips).
export type SeasonColor = {
	key: string
	accent: string
	on_accent: string
	soft: string
	text: string
}

// A capture rule the season changes, one entry per rarity.
export type PointSeasonCardChange = {
	rarity: Rarity
	rarity_label: string
	base_points: number
	// 0: the card is still captured, it just gives no points.
	points: number
}

// Any other rule the season changes (tickets, donations, events…).
export type PointSeasonRuleChange = {
	// Stable key; the zoo can add rules, so texts use `name`.
	type: string
	name: string
	base_points: number
	points: number
}

// Public notice of the active points mode. Only explains: the real points
// always come with each action's response.
export type PointSeason = {
	title: string
	message: string | null
	// Catalog key; null or unknown → default icon.
	icon: string | null
	// null → brand colors.
	color: SeasonColor | null
	cards: PointSeasonCardChange[]
	other: PointSeasonRuleChange[]
}

export type PointSeasonResponse = {
	success: boolean
	// null: no active mode, or it's hidden from visitors.
	data: PointSeason | null
}
