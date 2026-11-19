import type { PointSeason, PointSeasonResponse } from '@/types/points'

import { api } from './api'

export const pointsKeys = {
	season: '/points/season',
}

export async function getPointSeason(): Promise<PointSeason | null> {
	const response = await api<PointSeasonResponse>(pointsKeys.season)

	return response.data ?? null
}
