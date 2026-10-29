import { exploreKeys, getExplore } from '@/services/explore'

import { useQuery } from './useQuery'

export function useExplore() {
	return useQuery(exploreKeys.home, getExplore)
}
