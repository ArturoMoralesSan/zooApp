import { getZooDeckMap, mapKeys } from '@/services/map'
import type { Coordinate } from '@/types/map'

import { useQuery } from './useQuery'

type ZooDeckMapOptions = {
	// Waits for a first fix.
	enabled?: boolean
	// The raw fix, for a check that blocks a duel: same answer as POST /duels,
	// and no answer from a previous fix while this one loads or fails.
	exact?: boolean
}

// ZooDeck map for the user's location: species to challenge and why each
// duel can or can't start right now. `accuracy` (meters) gives the server its
// margin at the zoo's edge.
export function useZooDeckMap(
	location: Coordinate | null,
	accuracy?: number | null,
	{ enabled = true, exact = false }: ZooDeckMapOptions = {},
) {
	const key = enabled ? mapKeys.zoodeck(location, accuracy, exact) : null

	return useQuery(key, () => getZooDeckMap(key ?? mapKeys.zoodeck(null)), {
		keepPreviousData: !exact,
	})
}
