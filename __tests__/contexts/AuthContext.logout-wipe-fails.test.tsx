import { expect, jest, test } from '@jest/globals'
import { act, waitFor } from '@testing-library/react-native'
import { Directory } from 'expo-file-system'
import { http, HttpResponse } from 'msw'

import { useAuth } from '@/contexts/AuthContext'
import { setPackUser } from '@/services/packSync'

import { renderHookWithProviders } from '../../test-utils/render'
import { API, server } from '../../test-utils/server'
import { seedSignedInUser, serveCurrentUser } from '../../test-utils/session'

// Z-R2: a wipe that fails at logout (a file still open) must not leave the
// user's decrypted cards for the next account on this phone.
test("a failed wipe on logout doesn't leave the cards for the next account", async () => {
	const { user, cards } = await seedSignedInUser()

	server.use(
		serveCurrentUser(user),
		http.post(`${API}/logout`, () => HttpResponse.json({ success: true })),
	)

	const { result } = await renderHookWithProviders(() => useAuth(), {
		auth: true,
	})

	await waitFor(() => expect(result.current.user?.id).toBe(user.id))

	// The user's folder is locked once, e.g. a file still open.
	jest.spyOn(Directory.prototype, 'delete').mockImplementationOnce(() => {
		throw new Error('Directory is in use')
	})

	await act(() => result.current.logout())

	// Another account signs in on the same phone.
	await setPackUser(user.id + 1)

	expect(cards.exists).toBe(false)
})
