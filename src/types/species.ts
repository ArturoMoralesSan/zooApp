export type SpeciesCategory = {
	id: number
	name: string
}

export type SpeciesTag = {
	id: number
	name: string
	slug: string
}

export type SpeciesImage = {
	id: number
	type: 'main' | 'thumbnail' | 'gallery' | string
	url: string
	alt_text: string | null
	sort_order: number
}

// The list endpoint returns a single `image`; the detail endpoint adds the
// descriptive fields, tags and the image gallery.
export type Species = {
	id: number
	common_name: string
	scientific_name: string | null
	slug: string
	description: string | null
	category: SpeciesCategory | null
	image?: string | null
	habitat?: string | null
	origin?: string | null
	diet?: string | null
	conservation_status?: string | null
	tags?: SpeciesTag[]
	images?: SpeciesImage[]
}

export type SpeciesDetail = Species & {
	tags: SpeciesTag[]
	images: SpeciesImage[]
}

export type SpeciesListResponse = {
	success: boolean
	data: {
		species: Species[]
	}
}

export type SpeciesDetailResponse = {
	success: boolean
	data: {
		species: SpeciesDetail
	}
}
