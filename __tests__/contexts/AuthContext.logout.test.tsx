import { expect, test } from '@jest/globals'
import { act, waitFor } from '@testing-library/react-native'
import * as SecureStore from 'expo-secure-store'
import { http, HttpResponse } from 'msw'

import { useAuth } from '@/contexts/AuthContext'

import { renderHookWithProviders } from '../../test-utils/render'
import { API, server } from '../../test-utils/server'
import { seedSignedInUser, serveCurrentUser } from '../../test-utils/session'

// Privacy: nothing of this account may be left for the next one.
test('logout deletes the decrypted cards, the session and the cache', async () => {
	const { user, cards, copy, bin } = await seedSignedInUser()
	const logoutAuth: (string | null)[] = []

	server.use(
		serveCurrentUser(user),
		http.post(`${API}/logout`, ({ request }) => {
			logoutAuth.push(request.headers.get('Authorization'))

			return HttpResponse.json({ success: true })
		}),
	)

	const { result } = await renderHookWithProviders(() => useAuth(), {
		auth: true,
	})

	await waitFor(() => expect(result.current.user?.id).toBe(user.id))

	await act(() => result.current.logout())

	// The server ends the session it was given.
	expect(logoutAuth).toEqual(['Bearer token-de-prueba'])

	// The user's decrypted copies go; the shared encrypted pack stays.
	expect(copy.exists).toBe(false)
	expect(cards.exists).toBe(false)
	expect(bin.exists).toBe(true)

	await expect(SecureStore.getItemAsync('zooapp_token')).resolves.toBeNull()
	await expect(SecureStore.getItemAsync('zooapp_pack_user')).resolves.toBeNull()

	// The cached user is gone, not just hidden.
	expect(result.current.user).toBeNull()
	expect(result.current.isAuthenticated).toBe(false)
})
