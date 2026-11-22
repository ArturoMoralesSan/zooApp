import { useCallback, useMemo } from 'react'

import { creditsKeys, getCredits } from '@/services/credits'
import type { CreditsSection } from '@/types/credits'

import { useCards } from './useCards'
import { useQuery } from './useQuery'

export const HIDDEN_CARD_NAME = 'Tarjeta por descubrir'

export function useCredits() {
	return useQuery(creditsKeys.list, getCredits)
}

// The credits list every active card, won or not. The collection keeps the
// ones not won hidden, so their names are too (their credits still show:
// the licences ask for them). Until the user's cards load, all are hidden.
export function useCreditCardName() {
	const cards = useCards()

	const won = useMemo(
		() =>
			new Set(
				(cards.data ?? [])
					.filter((card) => card.encountered)
					.map((card) => card.id),
			),
		[cards.data],
	)

	return useCallback(
		(section: CreditsSection) =>
			won.has(section.card.id) ? section.card.name : HIDDEN_CARD_NAME,
		[won],
	)
}
