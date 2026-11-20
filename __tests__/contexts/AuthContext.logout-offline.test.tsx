import { expect, test } from '@jest/globals'
import { act, waitFor } from '@testing-library/react-native'
import * as SecureStore from 'expo-secure-store'
import { http, HttpResponse } from 'msw'

import { useAuth } from '@/contexts/AuthContext'
import { NetworkError } from '@/services/api'

import { renderHookWithProviders } from '../../test-utils/render'
import { API, server } from '../../test-utils/server'
import { seedSignedInUser, serveCurrentUser } from '../../test-utils/session'

// Signing out at the zoo without coverage must still clear the phone.
test('logout without connection still deletes everything, then reports the network error', async () => {
	const { user, cards, bin } = await seedSignedInUser()

	server.use(
		serveCurrentUser(user),
		http.post(`${API}/logout`, () => HttpResponse.error()),
	)

	const { result } = await renderHookWithProviders(() => useAuth(), {
		auth: true,
	})

	await waitFor(() => expect(result.current.user?.id).toBe(user.id))

	let error: unknown

	await act(async () => {
		error = await result.current.logout().then(
			() => null,
			(reason: unknown) => reason,
		)
	})

	expect(error).toBeInstanceOf(NetworkError)

	expect(cards.exists).toBe(false)
	expect(bin.exists).toBe(true)
	await expect(SecureStore.getItemAsync('zooapp_token')).resolves.toBeNull()
	await expect(SecureStore.getItemAsync('zooapp_pack_user')).resolves.toBeNull()
	expect(result.current.user).toBeNull()
})
