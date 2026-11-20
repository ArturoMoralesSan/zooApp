import { afterEach, expect, jest, test } from '@jest/globals'
import { File } from 'expo-file-system'
import { http, HttpResponse } from 'msw'

import { getCards, getStoredCards } from '@/services/cards'

import { makeOwnedCard, makeUnownedCard } from '../../test-utils/factories'
import { seedPackUser } from '../../test-utils/pack'
import { API, server } from '../../test-utils/server'

afterEach(() => {
	jest.useRealTimers()
})

// With a saved list, a slow connection shows it after 5 s instead of keeping
// the collection loading; the late answer still replaces it afterwards.
test('a slow response falls back to the saved list after 5 s, then updates it', async () => {
	const user = await seedPackUser(7)
	const saved = [makeOwnedCard()]
	const fresh = [makeOwnedCard(), makeUnownedCard()]
	let answer: () => void = () => undefined

	new File(user, 'cards.json').write(
		JSON.stringify({ etag: '"cards-1"', cards: saved }),
	)
	server.use(
		http.get(`${API}/cards`, async () => {
			await new Promise<void>((resolve) => {
				answer = resolve
			})

			return HttpResponse.json(
				{ success: true, data: fresh },
				{ headers: { ETag: '"cards-2"' } },
			)
		}),
	)

	jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] })

	const cards = getCards()

	await jest.advanceTimersByTimeAsync(4999)

	let settled = false

	void cards.then(() => {
		settled = true
	})
	await Promise.resolve()
	expect(settled).toBe(false)

	await jest.advanceTimersByTimeAsync(1)
	await expect(cards).resolves.toEqual(saved)

	// The request finishes later and becomes the list for next time.
	jest.useRealTimers()
	answer()

	await new Promise((resolve) => setTimeout(resolve, 50))
	await expect(getStoredCards()).resolves.toEqual(fresh)
})
