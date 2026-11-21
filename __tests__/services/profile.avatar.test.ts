import { expect, test } from '@jest/globals'
import { http, HttpResponse } from 'msw'

import { isNetworkError } from '@/services/api'
import { profileKeys, updateAvatar } from '@/services/profile'

import { API, server } from '../../test-utils/server'

test('an avatar upload that never reaches the server is a network error', async () => {
	server.use(
		http.post(`${API}${profileKeys.avatar}`, () => HttpResponse.error()),
	)

	const error = await updateAvatar(new Blob(['jpeg'])).catch(
		(caught: unknown) => caught,
	)

	expect(isNetworkError(error)).toBe(true)
})
