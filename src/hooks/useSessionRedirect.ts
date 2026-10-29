import { router } from 'expo-router'
import { useEffect } from 'react'

import { getToken } from '@/services/token'

// For write handlers: sends the user to /login when no session token is
// stored and returns true, so the caller can stop before the request.
export async function redirectIfSignedOut(): Promise<boolean> {
	const token = await getToken()

	if (token) return false

	router.replace('/login')

	return true
}

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
