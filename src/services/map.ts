import type {
	Coordinate,
	MapResponse,
	Zone,
	ZooDeckMap,
	ZooDeckMapResponse,
} from '@/types/map'

import { api } from './api'

// The map rounds its key, so GPS jitter doesn't refetch: 4 decimals ≈ 11 m
// and accuracy in 5 m steps. Rounding moves the point and the margin by a few
// meters, so near the edge the answer can differ from POST /duels, which gets
// the raw fix. Checks that block a duel use `exact` instead.
const round = (value: number) => value.toFixed(4)

const ACCURACY_STEP_M = 5

const roundAccuracy = (accuracy: number) =>
	Math.ceil(accuracy / ACCURACY_STEP_M) * ACCURACY_STEP_M

const accuracyParam = (accuracy: number | null | undefined, exact: boolean) =>
	accuracy && accuracy > 0
		? `&accuracy=${exact ? accuracy : roundAccuracy(accuracy)}`
		: ''

export const mapKeys = {
	zones: '/map',
	zoodeck: (
		location: Coordinate | null,
		accuracy?: number | null,
		exact = false,
	) => {
		if (!location) return '/map/species'

		const [longitude, latitude] = exact
			? location.map(String)
			: location.map(round)

		return `/map/species?latitude=${latitude}&longitude=${longitude}${accuracyParam(accuracy, exact)}`
	},
}

export async function getMap(): Promise<Zone[]> {
	const response = await api<MapResponse>(mapKeys.zones)

	return response?.data?.zones ?? []
}

// The key is the URL: it already carries the location.
export async function getZooDeckMap(key: string): Promise<ZooDeckMap> {
	const response = await api<ZooDeckMapResponse>(key)

	return response.data
}
