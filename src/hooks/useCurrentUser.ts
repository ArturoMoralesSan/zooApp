import { getSessionUser, userKeys } from '@/services/auth'

import { useQuery } from './useQuery'

export function useCurrentUser() {
	return useQuery(userKeys.current, getSessionUser)
}
