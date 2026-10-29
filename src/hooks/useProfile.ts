import { getProfile, profileKeys } from '@/services/profile'

import { useQuery } from './useQuery'

export function useProfile() {
	return useQuery(profileKeys.detail, getProfile)
}
