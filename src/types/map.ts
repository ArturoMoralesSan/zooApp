import type { Attempts, Rarity } from './cards'

export type Coordinate = [number, number]

export type ImageCorners = [
	topLeft: Coordinate,
	topRight: Coordinate,
	bottomRight: Coordinate,
	bottomLeft: Coordinate,
]

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
	// Only on the ZooDeck map (GET /map/species).
	cards?: ZooDeckCard[]
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
	// ZooDeck map only: species that can be challenged in the zone.
	species_count?: number
}

export type MapResponse = {
	success: boolean
	data: {
		zones: Zone[]
	}
}

// Why the visit blocks duels: the server checks them in this order.
export type VisitReason = 'location_required' | 'outside_zoo' | 'no_ticket'

export type ZooDeckCardReason = VisitReason | 'owned' | 'locked'

// `status` is independent of the visit: use it for badges, and `reason` for
// why "Escanear QR" can't start this duel.
export type ZooDeckCard = {
	id: number
	name: string
	rarity: Rarity
	thumbnail_image: string | null
	status: 'owned' | 'locked' | 'available'
	attempts: Attempts
	can_duel: boolean
	reason: ZooDeckCardReason | null
	// Label and expiry only: the token is on the plate.
	qr_codes: {
		id: number
		label: string | null
		expires_at: string | null
	}[]
}

// With `enforced` false, `can_duel` is always true and the rest are hints.
export type Visit = {
	enforced: boolean
	ticket: boolean
	inside_zoo: boolean | null
	can_duel: boolean
	reason: VisitReason | null
}

export type ZooDeckMap = {
	visit: Visit
	zones: Zone[]
}

export type ZooDeckMapResponse = {
	success: boolean
	data: ZooDeckMap
}

export type SelectableItem = {
	id: string
	name: string
	type: 'marker' | 'species'
	description?: string | null
	coordinate: Coordinate
	color?: string | null
	icon?: string | null
	iconImage?: string | null
	thumbnail?: string | null
	species?: MapSpecies | null
}

export type GraphNode = {
	id: string
	coordinate: Coordinate
}

export type GraphEdge = {
	to: string
	distance: number
}

export type NearestPathPoint = {
	point: Coordinate
	nodeId: string
	distance: number
}

export type RouteResult = {
	coordinates: Coordinate[]
	distance: number
	pathCoordinates: Coordinate[]
	connectors: Coordinate[][]
}
