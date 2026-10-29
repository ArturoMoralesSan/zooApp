import { useSWRConfig } from 'swr'

import { userKeys } from '@/services/auth'
import { donationsKeys } from '@/services/donations'
import { profileKeys } from '@/services/profile'
import { ticketsKeys } from '@/services/tickets'

// Revalidate cached reads after a write. Uses the provider's mutate: the
// global one from swr points at a different cache (see swr-config.tsx).
export function useDataRefresh() {
	const { mutate } = useSWRConfig()

	return {
		refreshMyTickets: () => mutate(ticketsKeys.mine),
		refreshDonations: () => mutate(donationsKeys.list),
		refreshProfile: () =>
			Promise.all([mutate(profileKeys.detail), mutate(userKeys.current)]),
	}
}
