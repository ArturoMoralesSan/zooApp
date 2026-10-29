export type Coordinate = [number, number]

export type MapMarker = {
	id: number
	zone_id: number
	name: string
	description?: string | null
	type?: string | null
	latitude: number
	longitude: number
	icon?: string | null
	color?: string | null
}

// The map endpoint returns its own trimmed species shape, with image `path`
// instead of `url`, so it is kept apart from `@/types/species`.
export type MapSpeciesImage = {
	id: number
	species_id: number
	type: string
	path: string
	alt_text?: string | null
	sort_order?: number | null
}

export type MapSpecies = {
	id: number
	common_name: string
	scientific_name?: string | null
	description?: string | null
	images?: MapSpeciesImage[]
}

export type SpeciesLocation = {
	id: number
	species_id: number
	zone_id: number
	name?: string | null
	latitude: number
	longitude: number
	description?: string | null
	is_active?: boolean
	species?: MapSpecies | null
}

export type PathNode = {
	id?: string | number
	lat?: string | number
	lng?: string | number
	latitude?: string | number
	longitude?: string | number
	coordinates?: Coordinate
}

export type PathEdge = {
	id?: string | number
	from?: string | number
	to?: string | number
	from_id?: string | number
	to_id?: string | number
	source?: string | number
	target?: string | number
	start?: string | number
	end?: string | number
	distance?: string | number
	coordinates?: Coordinate[]
	points?: Coordinate[]
}

export type PathCoordinates =
	| Coordinate[]
	| {
			nodes?: PathNode[]
			edges?: PathEdge[]
	  }
	| null
	| undefined

export type MapPath = {
	id: number
	zone_id: number
	name: string
	description?: string | null
	coordinates: PathCoordinates
	distance?: number | null
	estimated_time?: number | null
	is_active?: boolean
	order?: number
}

export type GeoJSONGeometry =
	| {
			type: 'Polygon'
			coordinates: number[][][]
	  }
	| {
			type: 'MultiPolygon'
			coordinates: number[][][][]
	  }
	| null

export type Zone = {
	id: number
	name: string
	description?: string | null
	type?: string | null
	geometry?: GeoJSONGeometry | Record<string, any> | string | null
	map_image?: string | null
	map_image_bounds?: any
	markers?: MapMarker[]
	species_locations?: SpeciesLocation[]
	paths?: MapPath[]
}

export type MapResponse = {
	success: boolean
	data: {
		zones: Zone[]
	}
}
