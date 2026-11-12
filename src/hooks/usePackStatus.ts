import { useSyncExternalStore } from 'react'

import { getPackStatus, subscribePack } from '@/services/packSync'

// Live state of the offline pack (counts, sizes, per-file progress).
export function usePackStatus() {
	return useSyncExternalStore(subscribePack, getPackStatus)
}
