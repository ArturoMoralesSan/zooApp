import { cardsKeys, getCards } from '@/services/cards'

import { useQuery } from './useQuery'

export function useCards() {
	return useQuery(cardsKeys.list, getCards)
}
