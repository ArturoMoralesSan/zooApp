import type {
	Coordinate,
	MapResponse,
	Zone,
	ZooDeckMap,
	ZooDeckMapResponse,
} from '@/types/map'

import { api } from './api'

// 4 decimals ≈ 11 m: GPS jitter keeps the same key instead of refetching.
const round = (value: number) => value.toFixed(4)

export const mapKeys = {
	zones: '/map',
	zoodeck: (location: Coordinate | null) =>
		location
			? `/map/species?latitude=${round(location[1])}&longitude=${round(location[0])}`
			: '/map/species',
}

export async function getMap(): Promise<Zone[]> {
	const response = await api<MapResponse>(mapKeys.zones)

	return response?.data?.zones ?? []
}

// The key is the URL: it already carries the rounded location.
export async function getZooDeckMap(key: string): Promise<ZooDeckMap> {
	const response = await api<ZooDeckMapResponse>(key)

	return response.data
}
