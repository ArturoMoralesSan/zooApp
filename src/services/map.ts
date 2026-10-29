import type { MapResponse, Zone } from '@/types/map'

import { api } from './api'

export const mapKeys = {
	zones: '/map',
}

export async function getMap(): Promise<Zone[]> {
	const response = await api<MapResponse>(mapKeys.zones)

	return response?.data?.zones ?? []
}
