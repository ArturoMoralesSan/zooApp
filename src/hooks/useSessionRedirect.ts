import { router } from 'expo-router'
import { useEffect } from 'react'

import { getToken } from '@/services/token'

// Sends the user to /login when no session token is stored.
export function useSessionRedirect() {
	useEffect(() => {
		let active = true

		void getToken().then((token) => {
			if (active && !token) {
				router.replace('/login')
			}
		})

		return () => {
			active = false
		}
	}, [])
}
