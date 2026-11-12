import { usePackSync } from '@/hooks/usePackSync'

// Runs the offline pack sync for the whole app; renders nothing.
export function OfflinePackSync() {
	usePackSync()

	return null
}
