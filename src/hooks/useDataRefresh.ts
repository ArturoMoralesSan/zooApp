import { useSWRConfig } from 'swr'

import { userKeys } from '@/services/auth'
import { cardsKeys } from '@/services/cards'
import { donationsKeys } from '@/services/donations'
import { syncPack } from '@/services/packSync'
import { profileKeys } from '@/services/profile'
import { ticketsKeys } from '@/services/tickets'
import type { DeckCard, OwnedCard } from '@/types/cards'
import type { User } from '@/types/user'

// Revalidate cached reads after a write. Uses the provider's mutate: the
// global one from swr points at a different cache (see swr-config.tsx).
export function useDataRefresh() {
	const { mutate } = useSWRConfig()

	return {
		refreshMyTickets: () => mutate(ticketsKeys.mine),
		refreshDonations: () => mutate(donationsKeys.list),
		refreshCards: () => mutate(cardsKeys.list),
		// Show a card that was just won right away, then revalidate the list.
		// The pack sync then decrypts its files for offline use.
		addOwnedCard: async (card: OwnedCard) => {
			const cards = await mutate<DeckCard[]>(cardsKeys.list, (cards) =>
				cards?.map((item) => (item.id === card.id ? card : item)),
			)

			syncPack()

			return cards
		},
		// Pass the user returned by a write to show it right away.
		refreshProfile: (user?: User) =>
			Promise.all([
				user ? mutate(profileKeys.detail, user) : mutate(profileKeys.detail),
				mutate(userKeys.current),
			]),
		// Store the user returned by login/register without refetching it.
		setCurrentUser: (user: User) =>
			mutate(userKeys.current, user, { revalidate: false }),
		// Drop every cached response so nothing leaks into the next account.
		clearCache: () => mutate(() => true, undefined, { revalidate: false }),
	}
}
