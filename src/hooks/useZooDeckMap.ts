import { getZooDeckMap, mapKeys } from '@/services/map'
import type { Coordinate } from '@/types/map'

import { useQuery } from './useQuery'

// ZooDeck map for the user's location: species to challenge and why each
// duel can or can't start right now.
export function useZooDeckMap(location: Coordinate | null) {
	const key = mapKeys.zoodeck(location)

	return useQuery(key, () => getZooDeckMap(key), { keepPreviousData: true })
}
