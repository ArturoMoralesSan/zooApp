import type { CardsResponse, DeckCard } from '@/types/cards'

import { readResponse, request } from './api'

export const cardsKeys = {
	list: '/cards',
}

// Last list and its ETag: the server answers 304 with no body when nothing
// changed, so the list is reused from here.
let cached: { etag: string; cards: DeckCard[] } | null = null

export async function getCards(): Promise<DeckCard[]> {
	const response = await request(cardsKeys.list, {
		headers: cached ? { 'If-None-Match': cached.etag } : undefined,
	})

	if (response.status === 304 && cached) {
		return cached.cards
	}

	const body = await readResponse<CardsResponse>(response)
	const etag = response.headers.get('ETag')

	cached = etag ? { etag, cards: body.data } : null

	return body.data
}
