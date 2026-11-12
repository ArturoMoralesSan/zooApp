import NetInfo from '@react-native-community/netinfo'
import { useEffect } from 'react'
import { AppState } from 'react-native'

import { useAuth } from '@/contexts/AuthContext'
import { pausePackSync, setPackUser, syncPack } from '@/services/packSync'

import { isOfflineState } from './useNetworkStatus'

// Keeps the offline pack in sync for the signed-in user: on launch, back in
// the foreground and when the connection returns or switches to Wi-Fi.
// Mounted once, inside AuthProvider.
export function usePackSync() {
	const { user } = useAuth()
	const userId = user?.id ?? null

	useEffect(() => {
		if (userId === null) return

		setPackUser(userId).then(() => syncPack())

		const appState = AppState.addEventListener('change', (state) => {
			if (state === 'active') syncPack()
			else if (state === 'background') pausePackSync()
		})

		let offline = false
		let type: string | null = null

		const net = NetInfo.addEventListener((state) => {
			const nextOffline = isOfflineState(state)

			if (nextOffline) pausePackSync()
			else if (offline || (state.type === 'wifi' && type !== 'wifi')) syncPack()

			offline = nextOffline
			type = state.type
		})

		return () => {
			appState.remove()
			net()
		}
	}, [userId])
}
