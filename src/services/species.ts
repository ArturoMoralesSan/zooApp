import type {
	Species,
	SpeciesDetail,
	SpeciesDetailResponse,
	SpeciesListResponse,
} from '@/types/species'

import { api } from './api'

export const speciesKeys = {
	list: '/species',
	detail: (id: string | number) => `/species/${id}`,
}

export async function getSpecies(): Promise<Species[]> {
	const response = await api<SpeciesListResponse>(speciesKeys.list)

	return response.data.species || []
}

export async function getSpeciesById(
	id: string | number,
): Promise<SpeciesDetail> {
	const response = await api<SpeciesDetailResponse>(speciesKeys.detail(id))

	if (!response.success || !response.data?.species) {
		throw new Error('No fue posible obtener la información de la especie.')
	}

	return response.data.species
}
