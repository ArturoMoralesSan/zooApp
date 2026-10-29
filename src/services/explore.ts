import type { ExploreEvent, ExploreResponse } from '@/types/explore'

import { api } from './api'

export const exploreKeys = {
	home: '/explore',
}

export async function getExplore(): Promise<{
	featured_events: ExploreEvent[]
}> {
	const response = await api<ExploreResponse>(exploreKeys.home)

	if (!response.success) {
		throw new Error('No fue posible cargar la información de Explorar.')
	}

	return { featured_events: response.data.featured_events ?? [] }
}
