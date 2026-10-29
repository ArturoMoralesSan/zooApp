import { getMap, mapKeys } from '@/services/map'

import { useQuery } from './useQuery'

export function useMapData() {
	return useQuery(mapKeys.zones, getMap)
}
