import { getPointSeason, pointsKeys } from '@/services/points'

import { useQuery } from './useQuery'

// The visible points season, or null. Returning to the app revalidates it
// (swr-config); it changes rarely, so there's no polling.
export function usePointSeason() {
	return useQuery(pointsKeys.season, getPointSeason)
}
