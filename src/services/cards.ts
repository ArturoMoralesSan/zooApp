import type { CardsResponse, DeckCard } from '@/types/cards'

import { isNetworkError, readResponse, request } from './api'
import {
	getLastUserId,
	readStoredCards,
	type StoredCards,
	writeStoredCards,
} from './packStore'

export const cardsKeys = {
	list: '/cards',
}

// Last list and its ETag: the server answers 304 with no body when nothing
// changed, so the list is reused from here. It's also saved to disk, so the
// collection still shows offline after the app restarts.
let cached: StoredCards | null = null
let loaded = false

async function loadStored() {
	if (loaded) return

	loaded = true

	const userId = await getLastUserId()

	if (userId !== null && !cached) cached = await readStoredCards(userId)
}

// The cached list without a request, for the offline pack sync.
export async function getStoredCards(): Promise<DeckCard[]> {
	await loadStored()

	return cached?.cards ?? []
}

// On logout, so the next account never sees this list.
export function clearCardsCache() {
	cached = null
	loaded = false
}

export async function getCards(): Promise<DeckCard[]> {
	await loadStored()

	let response: Response

	try {
		response = await request(cardsKeys.list, {
			headers: cached?.etag ? { 'If-None-Match': cached.etag } : undefined,
		})
	} catch (error) {
		if (isNetworkError(error) && cached) return cached.cards

		throw error
	}

	if (response.status === 304 && cached) {
		return cached.cards
	}

	const body = await readResponse<CardsResponse>(response)

	cached = { etag: response.headers.get('ETag'), cards: body.data }

	const userId = await getLastUserId()

	if (userId !== null) writeStoredCards(userId, cached)

	return body.data
}
