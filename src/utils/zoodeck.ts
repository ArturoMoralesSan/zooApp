import type { BadgeTone } from '@/components/ui/Badge'
import type { MapSpecies, Zone, ZooDeckCard } from '@/types/map'
import { formatUnlockTime } from '@/utils/cards'

// A species may have more than one card: show the one that can be played.
export function duelCardOf(
	species: MapSpecies | null | undefined,
): ZooDeckCard | null {
	const cards = species?.cards ?? []

	return (
		cards.find((card) => card.can_duel) ??
		cards.find((card) => card.status === 'available') ??
		cards[0] ??
		null
	)
}

// Zone name per selectable species item (`species-<location id>`).
export function zoneNamesByItem(zones: Zone[]): Record<string, string> {
	const names: Record<string, string> = {}

	zones.forEach((zone) => {
		;(zone.species_locations ?? []).forEach((location) => {
			names[`species-${location.id}`] = zone.name
		})
	})

	return names
}

export type DuelStatus = {
	label: string
	tone: BadgeTone
	// Attempts or when it unlocks.
	detail: string | null
}

// The card's own state (A-17). The visit (location, zone, ticket) is shown
// apart, for the whole map.
export function duelStatus(card: ZooDeckCard): DuelStatus {
	const { attempts } = card

	if (card.status === 'owned') {
		return { label: 'En tu colección', tone: 'success', detail: null }
	}

	if (card.status === 'locked') {
		return {
			label: 'Bloqueada',
			tone: 'pending',
			detail: attempts.locked_until
				? `Disponible: ${formatUnlockTime(attempts.locked_until)}`
				: 'Sin intentos por ahora',
		}
	}

	return {
		label: 'Disponible',
		tone: 'success',
		detail: `${attempts.left} de ${attempts.max} intentos`,
	}
}
