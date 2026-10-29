import { donationsKeys, getDonations } from '@/services/donations'

import { useQuery } from './useQuery'

export function useDonations() {
	return useQuery(donationsKeys.list, getDonations)
}
