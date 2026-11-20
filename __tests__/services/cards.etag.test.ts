import { expect, test } from '@jest/globals'
import { File } from 'expo-file-system'
import { http, HttpResponse } from 'msw'

import { getCards } from '@/services/cards'

import { makeUnownedCard } from '../../test-utils/factories'
import { seedPackUser } from '../../test-utils/pack'
import { API, server } from '../../test-utils/server'

// The list is only sent again when it changed (304 otherwise), and it's
// saved per user so the collection opens offline after a restart.
test('the card list is revalidated with its ETag and saved per user', async () => {
	const user = await seedPackUser(7)
	const cards = [makeUnownedCard()]
	const sentEtags: (string | null)[] = []

	server.use(
		http.get(`${API}/cards`, ({ request }) => {
			sentEtags.push(request.headers.get('If-None-Match'))

			return sentEtags.length === 1
				? HttpResponse.json(
						{ success: true, data: cards },
						{ headers: { ETag: '"cards-1"' } },
					)
				: new HttpResponse(null, { status: 304 })
		}),
	)

	await expect(getCards()).resolves.toEqual(cards)
	await expect(getCards()).resolves.toEqual(cards)

	expect(sentEtags).toEqual([null, '"cards-1"'])

	const saved = JSON.parse(await new File(user, 'cards.json').text())

	expect(saved).toEqual({ etag: '"cards-1"', cards })
})
