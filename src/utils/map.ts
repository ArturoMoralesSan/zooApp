import { API_URL } from '@/services/api'
import type {
	Coordinate,
	GeoJSONGeometry,
	GraphEdge,
	GraphNode,
	ImageCorners,
	NearestPathPoint,
	PathCoordinates,
	PathEdge,
	PathNode,
	Zone,
} from '@/types/map'

export const ZOO_CENTER: Coordinate = [-104.6532, 24.0277]

export const DEFAULT_ZOOM = 17
export const USER_ZOOM = 18

export function toNumber(value: unknown): number | null {
	if (typeof value === 'number' && Number.isFinite(value)) {
		return value
	}

	if (typeof value === 'string' && value.trim() !== '') {
		const parsed = Number(value)

		if (Number.isFinite(parsed)) {
			return parsed
		}
	}

	return null
}

export function parseJsonValue(value: unknown): any {
	if (typeof value !== 'string') {
		return value
	}

	try {
		return JSON.parse(value)
	} catch {
		return value
	}
}

export function normalizeCoordinate(value: unknown): Coordinate | null {
	if (Array.isArray(value) && value.length >= 2) {
		const first = toNumber(value[0])
		const second = toNumber(value[1])

		if (
			first !== null &&
			second !== null &&
			Math.abs(first) <= 180 &&
			Math.abs(second) <= 90
		) {
			return [first, second]
		}
	}

	if (value && typeof value === 'object') {
		const item = value as Record<string, unknown>

		const lng =
			toNumber(item.lng) ?? toNumber(item.longitude) ?? toNumber(item.lon)

		const lat = toNumber(item.lat) ?? toNumber(item.latitude)

		if (
			lng !== null &&
			lat !== null &&
			Math.abs(lng) <= 180 &&
			Math.abs(lat) <= 90
		) {
			return [lng, lat]
		}

		if (Array.isArray(item.coordinates)) {
			return normalizeCoordinate(item.coordinates)
		}
	}

	return null
}

export function normalizeZoneGeometry(
	geometry: Zone['geometry'],
): GeoJSONGeometry | null {
	if (!geometry) {
		return null
	}

	const parsed = parseJsonValue(geometry)

	if (!parsed || typeof parsed !== 'object') {
		return null
	}

	const value = parsed as Record<string, any>

	if (value.type === 'Feature') {
		return normalizeZoneGeometry(value.geometry)
	}

	if (value.type === 'FeatureCollection') {
		const geometries = Array.isArray(value.features)
			? value.features.map((feature: any) => feature?.geometry).filter(Boolean)
			: []

		if (geometries.length === 1) {
			return normalizeZoneGeometry(geometries[0])
		}

		const polygons: number[][][][] = []

		geometries.forEach((item: any) => {
			const normalized = normalizeZoneGeometry(item)

			if (!normalized) {
				return
			}

			if (normalized.type === 'Polygon') {
				polygons.push(normalized.coordinates)
			}

			if (normalized.type === 'MultiPolygon') {
				polygons.push(...normalized.coordinates)
			}
		})

		if (polygons.length > 0) {
			return {
				type: 'MultiPolygon',
				coordinates: polygons,
			}
		}

		return null
	}

	if (value.type === 'Polygon' && Array.isArray(value.coordinates)) {
		return {
			type: 'Polygon',
			coordinates: value.coordinates,
		}
	}

	if (value.type === 'MultiPolygon' && Array.isArray(value.coordinates)) {
		return {
			type: 'MultiPolygon',
			coordinates: value.coordinates,
		}
	}

	return null
}

export function normalizeMapImageUrl(value: unknown): string | null {
	if (typeof value !== 'string') {
		return null
	}

	let raw = value.trim()

	if (!raw) {
		return null
	}

	const baseUrl = API_URL.replace(/\/api\/?$/, '').replace(/\/+$/, '')

	if (/^https?:\/\//i.test(raw)) {
		try {
			const url = new URL(raw)

			if (
				url.hostname === 'localhost' ||
				url.hostname === '127.0.0.1' ||
				url.hostname === '0.0.0.0'
			) {
				return `${baseUrl}${url.pathname}${url.search}`
			}

			return raw
		} catch {
			return null
		}
	}

	raw = raw.replace(/^\/+/, '')
	raw = raw.replace(/^storage\/app\/public\//i, '')
	raw = raw.replace(/^public\/storage\//i, 'storage/')
	raw = raw.replace(/^public\//i, '')

	if (/^storage\//i.test(raw)) {
		return `${baseUrl}/${raw}`
	}

	return `${baseUrl}/storage/${raw}`
}

export function normalizeSpeciesImageUrl(value: unknown): string | null {
	if (typeof value !== 'string') {
		return null
	}

	let raw = value.trim()

	if (!raw) {
		return null
	}

	const baseUrl = API_URL.replace(/\/api\/?$/, '').replace(/\/+$/, '')

	if (/^https?:\/\//i.test(raw)) {
		try {
			const url = new URL(raw)

			if (
				url.hostname === 'localhost' ||
				url.hostname === '127.0.0.1' ||
				url.hostname === '0.0.0.0'
			) {
				return `${baseUrl}${url.pathname}${url.search}`
			}

			return raw
		} catch {
			return null
		}
	}

	raw = raw.replace(/^\/+/, '')
	raw = raw.replace(/^storage\/app\/public\//i, '')
	raw = raw.replace(/^public\/storage\//i, 'storage/')
	raw = raw.replace(/^public\//i, '')

	if (/^storage\//i.test(raw)) {
		return `${baseUrl}/${raw}`
	}

	return `${baseUrl}/storage/${raw}`
}

export function normalizeMarkerIconUrl(value: unknown): string | null {
	if (typeof value !== 'string') {
		return null
	}

	let raw = value.trim()

	if (!raw) {
		return null
	}

	const baseUrl = API_URL.replace(/\/api\/?$/, '').replace(/\/+$/, '')

	if (/^https?:\/\//i.test(raw)) {
		try {
			const url = new URL(raw)

			if (
				url.hostname === 'localhost' ||
				url.hostname === '127.0.0.1' ||
				url.hostname === '0.0.0.0'
			) {
				return `${baseUrl}${url.pathname}${url.search}`
			}

			return raw
		} catch {
			return null
		}
	}

	raw = raw.replace(/^\/+/, '')
	raw = raw.replace(/^storage\/app\/public\//i, '')
	raw = raw.replace(/^public\/storage\//i, 'storage/')
	raw = raw.replace(/^public\//i, '')

	if (/^storage\/markers\//i.test(raw)) {
		return `${baseUrl}/${raw}`
	}

	if (/^markers\//i.test(raw)) {
		return `${baseUrl}/storage/${raw}`
	}

	return `${baseUrl}/storage/markers/${raw}`
}

export function isImageIcon(value: unknown): boolean {
	if (typeof value !== 'string') {
		return false
	}

	const raw = value.trim()

	if (!raw) {
		return false
	}

	return (
		/^https?:\/\//i.test(raw) ||
		/^\/?(storage\/)?markers\//i.test(raw) ||
		/\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(raw)
	)
}

export function normalizeImageBounds(
	bounds: unknown,
	geometry: GeoJSONGeometry | null,
): ImageCorners | null {
	const parsed = parseJsonValue(bounds)

	if (parsed && typeof parsed === 'object') {
		const value = parsed as Record<string, any>

		const north = toNumber(value.north)
		const south = toNumber(value.south)
		const east = toNumber(value.east)
		const west = toNumber(value.west)

		if (north !== null && south !== null && east !== null && west !== null) {
			return [
				[west, north],
				[east, north],
				[east, south],
				[west, south],
			]
		}

		const topLeft = normalizeCoordinate(
			value.topLeft ?? value.top_left ?? value.northWest ?? value.northwest,
		)

		const topRight = normalizeCoordinate(
			value.topRight ?? value.top_right ?? value.northEast ?? value.northeast,
		)

		const bottomRight = normalizeCoordinate(
			value.bottomRight ??
				value.bottom_right ??
				value.southEast ??
				value.southeast,
		)

		const bottomLeft = normalizeCoordinate(
			value.bottomLeft ??
				value.bottom_left ??
				value.southWest ??
				value.southwest,
		)

		if (topLeft && topRight && bottomRight && bottomLeft) {
			return [topLeft, topRight, bottomRight, bottomLeft]
		}

		if (Array.isArray(value.coordinates)) {
			const coordinates = value.coordinates
				.map((item: unknown) => normalizeCoordinate(item))
				.filter((item: Coordinate | null): item is Coordinate => item !== null)

			if (coordinates.length >= 4) {
				return [coordinates[0], coordinates[1], coordinates[2], coordinates[3]]
			}
		}
	}

	if (Array.isArray(parsed)) {
		if (
			parsed.length === 4 &&
			parsed.every(
				(item) => typeof item === 'number' || typeof item === 'string',
			)
		) {
			const first = toNumber(parsed[0])
			const second = toNumber(parsed[1])
			const third = toNumber(parsed[2])
			const fourth = toNumber(parsed[3])

			if (
				first !== null &&
				second !== null &&
				third !== null &&
				fourth !== null
			) {
				const west = first
				const south = second
				const east = third
				const north = fourth

				return [
					[west, north],
					[east, north],
					[east, south],
					[west, south],
				]
			}
		}

		const coordinates = parsed
			.map((item) => normalizeCoordinate(item))
			.filter((item): item is Coordinate => item !== null)

		if (coordinates.length >= 4) {
			return [coordinates[0], coordinates[1], coordinates[2], coordinates[3]]
		}
	}

	if (geometry) {
		const points: Coordinate[] = []

		if (geometry.type === 'Polygon') {
			geometry.coordinates.forEach((ring) => {
				ring.forEach((coordinate) => {
					const normalized = normalizeCoordinate(coordinate)

					if (normalized) {
						points.push(normalized)
					}
				})
			})
		}

		if (geometry.type === 'MultiPolygon') {
			geometry.coordinates.forEach((polygon) => {
				polygon.forEach((ring) => {
					ring.forEach((coordinate) => {
						const normalized = normalizeCoordinate(coordinate)

						if (normalized) {
							points.push(normalized)
						}
					})
				})
			})
		}

		if (points.length > 0) {
			const longitudes = points.map((point) => point[0])

			const latitudes = points.map((point) => point[1])

			const west = Math.min(...longitudes)
			const east = Math.max(...longitudes)
			const south = Math.min(...latitudes)
			const north = Math.max(...latitudes)

			return [
				[west, north],
				[east, north],
				[east, south],
				[west, south],
			]
		}
	}

	return null
}

export function normalizeSimplePathCoordinates(
	coordinates: unknown,
): Coordinate[] {
	const parsed = parseJsonValue(coordinates)

	if (!Array.isArray(parsed)) {
		return []
	}

	return parsed
		.map((item) => normalizeCoordinate(item))
		.filter((item): item is Coordinate => item !== null)
}

export function haversineDistance(a: Coordinate, b: Coordinate): number {
	const earthRadius = 6371000

	const lat1 = (a[1] * Math.PI) / 180
	const lat2 = (b[1] * Math.PI) / 180

	const deltaLat = ((b[1] - a[1]) * Math.PI) / 180
	const deltaLng = ((b[0] - a[0]) * Math.PI) / 180

	const value =
		Math.sin(deltaLat / 2) ** 2 +
		Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2

	const angularDistance = 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value))

	return earthRadius * angularDistance
}

export function normalizePathGraph(coordinates: PathCoordinates): {
	nodes: GraphNode[]
	edges: globalThis.Map<string, GraphEdge[]>
	lines: Coordinate[][]
} {
	const nodes: GraphNode[] = []

	const edges = new globalThis.Map<string, GraphEdge[]>()

	const lines: Coordinate[][] = []

	const parsed = parseJsonValue(coordinates)

	if (Array.isArray(parsed)) {
		const line = normalizeSimplePathCoordinates(parsed)

		if (line.length >= 2) {
			lines.push(line)

			line.forEach((coordinate, index) => {
				const id = `${coordinate[0].toFixed(7)}:${coordinate[1].toFixed(7)}`

				if (!nodes.some((node) => node.id === id)) {
					nodes.push({
						id,
						coordinate,
					})
				}

				if (index === 0) {
					if (!edges.has(id)) {
						edges.set(id, [])
					}

					return
				}

				const previous = line[index - 1]

				const previousId = `${previous[0].toFixed(7)}:${previous[1].toFixed(7)}`

				const distance = haversineDistance(previous, coordinate)

				if (!edges.has(previousId)) {
					edges.set(previousId, [])
				}

				if (!edges.has(id)) {
					edges.set(id, [])
				}

				edges.get(previousId)!.push({
					to: id,
					distance,
				})

				edges.get(id)!.push({
					to: previousId,
					distance,
				})
			})
		}

		return {
			nodes,
			edges,
			lines,
		}
	}

	if (!parsed || typeof parsed !== 'object') {
		return {
			nodes,
			edges,
			lines,
		}
	}

	const data = parsed as {
		nodes?: PathNode[]
		edges?: PathEdge[]
	}

	const rawNodes = Array.isArray(data.nodes) ? data.nodes : []

	rawNodes.forEach((node, index) => {
		const coordinate =
			normalizeCoordinate(node.coordinates) ?? normalizeCoordinate(node)

		if (!coordinate) {
			return
		}

		const id =
			node.id !== undefined
				? String(node.id)
				: `${coordinate[0].toFixed(7)}:${coordinate[1].toFixed(7)}:${index}`

		nodes.push({
			id,
			coordinate,
		})
	})

	const nodeById = new globalThis.Map<string, GraphNode>()

	nodes.forEach((node) => {
		nodeById.set(node.id, node)

		if (!edges.has(node.id)) {
			edges.set(node.id, [])
		}
	})

	const rawEdges = Array.isArray(data.edges) ? data.edges : []

	rawEdges.forEach((edge) => {
		const fromValue = edge.from ?? edge.from_id ?? edge.source ?? edge.start

		const toValue = edge.to ?? edge.to_id ?? edge.target ?? edge.end

		if (fromValue === undefined || toValue === undefined) {
			return
		}

		const from = String(fromValue)
		const to = String(toValue)

		const fromNode = nodeById.get(from)
		const toNode = nodeById.get(to)

		if (!fromNode || !toNode) {
			return
		}

		const distance =
			toNumber(edge.distance) ??
			haversineDistance(fromNode.coordinate, toNode.coordinate)

		if (!edges.has(from)) {
			edges.set(from, [])
		}

		if (!edges.has(to)) {
			edges.set(to, [])
		}

		edges.get(from)!.push({
			to,
			distance,
		})

		edges.get(to)!.push({
			to: from,
			distance,
		})

		const line = Array.isArray(edge.coordinates)
			? edge.coordinates
					.map(normalizeCoordinate)
					.filter((item): item is Coordinate => item !== null)
			: Array.isArray(edge.points)
				? edge.points
						.map(normalizeCoordinate)
						.filter((item): item is Coordinate => item !== null)
				: [fromNode.coordinate, toNode.coordinate]

		if (line.length >= 2) {
			lines.push(line)
		}
	})

	if (rawNodes.length > 1 && rawEdges.length === 0 && nodes.length > 1) {
		for (let index = 1; index < nodes.length; index++) {
			const previous = nodes[index - 1]
			const current = nodes[index]

			const distance = haversineDistance(
				previous.coordinate,
				current.coordinate,
			)

			if (!edges.has(previous.id)) {
				edges.set(previous.id, [])
			}

			if (!edges.has(current.id)) {
				edges.set(current.id, [])
			}

			edges.get(previous.id)!.push({
				to: current.id,
				distance,
			})

			edges.get(current.id)!.push({
				to: previous.id,
				distance,
			})

			lines.push([previous.coordinate, current.coordinate])
		}
	}

	return {
		nodes,
		edges,
		lines,
	}
}

export function nearestPointOnSegment(
	point: Coordinate,
	segmentStart: Coordinate,
	segmentEnd: Coordinate,
): {
	point: Coordinate
	ratio: number
	distance: number
} {
	const latitude = (point[1] * Math.PI) / 180

	const metersPerDegreeLat = 111320
	const metersPerDegreeLng = 111320 * Math.cos(latitude)

	const ax = segmentStart[0] * metersPerDegreeLng

	const ay = segmentStart[1] * metersPerDegreeLat

	const bx = segmentEnd[0] * metersPerDegreeLng

	const by = segmentEnd[1] * metersPerDegreeLat

	const px = point[0] * metersPerDegreeLng

	const py = point[1] * metersPerDegreeLat

	const dx = bx - ax
	const dy = by - ay

	const lengthSquared = dx * dx + dy * dy

	if (lengthSquared === 0) {
		return {
			point: segmentStart,
			ratio: 0,
			distance: haversineDistance(point, segmentStart),
		}
	}

	let ratio = ((px - ax) * dx + (py - ay) * dy) / lengthSquared

	ratio = Math.max(0, Math.min(1, ratio))

	const projectedX = ax + ratio * dx
	const projectedY = ay + ratio * dy

	const projected: Coordinate = [
		projectedX / metersPerDegreeLng,
		projectedY / metersPerDegreeLat,
	]

	return {
		point: projected,
		ratio,
		distance: haversineDistance(point, projected),
	}
}

export function findNearestPathPoint(
	point: Coordinate,
	graph: {
		nodes: globalThis.Map<string, GraphNode>
		edges: globalThis.Map<string, GraphEdge[]>
	},
): NearestPathPoint | null {
	let nearest: NearestPathPoint | null = null

	const processedSegments = new Set<string>()

	graph.edges.forEach((edgeList, fromId) => {
		const fromNode = graph.nodes.get(fromId)

		if (!fromNode) {
			return
		}

		edgeList.forEach((edge) => {
			const toNode = graph.nodes.get(edge.to)

			if (!toNode) {
				return
			}

			const key = [fromId, edge.to].sort().join('|')

			if (processedSegments.has(key)) {
				return
			}

			processedSegments.add(key)

			const projection = nearestPointOnSegment(
				point,
				fromNode.coordinate,
				toNode.coordinate,
			)

			const selectedNodeId = projection.ratio <= 0.5 ? fromNode.id : toNode.id

			if (!nearest || projection.distance < nearest.distance) {
				nearest = {
					point: projection.point,
					nodeId: selectedNodeId,
					distance: projection.distance,
				}
			}
		})
	})

	return nearest
}

export function pointInRing(point: Coordinate, ring: number[][]): boolean {
	const [x, y] = point

	let inside = false

	for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
		const xi = Number(ring[i]?.[0])
		const yi = Number(ring[i]?.[1])

		const xj = Number(ring[j]?.[0])
		const yj = Number(ring[j]?.[1])

		const intersect =
			yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi

		if (intersect) {
			inside = !inside
		}
	}

	return inside
}

export function pointInPolygon(
	point: Coordinate,
	polygon: number[][][],
): boolean {
	if (!polygon.length) {
		return false
	}

	if (!pointInRing(point, polygon[0])) {
		return false
	}

	for (let index = 1; index < polygon.length; index++) {
		if (pointInRing(point, polygon[index])) {
			return false
		}
	}

	return true
}

export function pointInGeometry(
	point: Coordinate,
	geometry: GeoJSONGeometry | null,
): boolean {
	if (!geometry) {
		return false
	}

	if (geometry.type === 'Polygon') {
		return pointInPolygon(point, geometry.coordinates)
	}

	if (geometry.type === 'MultiPolygon') {
		return geometry.coordinates.some((polygon) =>
			pointInPolygon(point, polygon),
		)
	}

	return false
}

export function formatDistance(distance: number): string {
	if (distance < 1000) {
		return `${Math.round(distance)} m`
	}

	return `${(distance / 1000).toFixed(2)} km`
}

export function formatMinutes(minutes: number | null | undefined): string {
	if (minutes === null || minutes === undefined) {
		return ''
	}

	if (minutes < 60) {
		return `${Math.round(minutes)} min`
	}

	const hours = Math.floor(minutes / 60)

	const rest = Math.round(minutes % 60)

	if (rest === 0) {
		return `${hours} h`
	}

	return `${hours} h ${rest} min`
}
