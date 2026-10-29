import { getSpecies, getSpeciesById, speciesKeys } from '@/services/species'

import { useQuery } from './useQuery'

export function useSpecies() {
	return useQuery(speciesKeys.list, getSpecies)
}

export function useSpeciesDetail(id: string | number | undefined) {
	return useQuery(id ? speciesKeys.detail(id) : null, () =>
		getSpeciesById(id as string | number),
	)
}
