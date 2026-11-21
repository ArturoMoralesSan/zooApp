import { expect, jest, test } from '@jest/globals'
import { act, waitFor } from '@testing-library/react-native'
import { http, HttpResponse } from 'msw'

import { useAuth } from '@/contexts/AuthContext'
import * as packSync from '@/services/packSync'

import { renderHookWithProviders } from '../../test-utils/render'
import { API, server } from '../../test-utils/server'
import { seedSignedInUser, serveCurrentUser } from '../../test-utils/session'

// Z-R1: the cache is cleared even when deleting the pack user fails, so the
// next account never sees this one's data.
test('logout clears the cache even if deleting the pack user fails', async () => {
	const { user } = await seedSignedInUser()

	server.use(
		serveCurrentUser(user),
		http.post(`${API}/logout`, () => HttpResponse.json({ success: true })),
	)
	jest
		.spyOn(packSync, 'resetPackUser')
		.mockRejectedValueOnce(new Error('Disk error'))

	const { result } = await renderHookWithProviders(() => useAuth(), {
		auth: true,
	})

	await waitFor(() => expect(result.current.user?.id).toBe(user.id))

	await act(async () => {
		await result.current.logout().catch(() => undefined)
	})

	expect(result.current.user).toBeNull()
})
