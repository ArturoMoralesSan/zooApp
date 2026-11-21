import type { Rarity } from '@/types/cards'

// Tones of a season, picked in the panel. Each pair has ≥ 4.5:1 contrast:
// `text` on `soft` (the notice) and `on_accent` on `accent` (icon, chips).
export type SeasonColor = {
	accent: string
	on_accent: string
	soft: string
	text: string
}

// A capture rule the season changes, one entry per rarity (named with the
// app's own rarity labels).
export type PointSeasonCardChange = {
	rarity: Rarity
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

// Points an action gave (a duel win, a ticket order, a donation), set by
// the server from the action's rule and the active points mode.
export type PointsAward = {
	// 0 when the rule is off, the season sets it to 0, or (donations) the
	// amount is under the server's minimum.
	awarded: number
	// User's total after this action.
	total: number
	level: { id: number; name: string } | null
	level_up: boolean
	// Visible points season, if any; missing on older servers.
	season?: PointsAwardSeason | null
}

// The season's notice for this action: same icon and color as the banner.
export type PointsAwardSeason = {
	title: string
	// The zoo's explanation, shown under the points.
	message: string | null
	// What the action gives without the season. null when it gives nothing
	// anyway (rule off, donation under the minimum), so the season isn't
	// blamed. With awarded 0 and a number here, the season turned it off.
	base_points: number | null
	icon: string | null
	color: SeasonColor | null
}
