import { expect, test } from '@jest/globals'
import { File } from 'expo-file-system'
import { http, HttpResponse } from 'msw'

import { getCards, getStoredCards } from '@/services/cards'

import { makeOwnedCard } from '../../test-utils/factories'
import { seedPackUser } from '../../test-utils/pack'
import { API, server } from '../../test-utils/server'

// The app restarts at the zoo without coverage: the collection comes from
// the list saved on the phone instead of an error.
test('after an offline restart the saved list is returned', async () => {
	const user = await seedPackUser(7)
	const saved = [makeOwnedCard()]

	new File(user, 'cards.json').write(
		JSON.stringify({ etag: '"cards-1"', cards: saved }),
	)
	server.use(http.get(`${API}/cards`, () => HttpResponse.error()))

	await expect(getCards()).resolves.toEqual(saved)
	await expect(getStoredCards()).resolves.toEqual(saved)
})
