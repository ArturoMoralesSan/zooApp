import { api, API_URL } from '@/services/api'
import { getToken } from '@/services/auth'

import { ArrowUp01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'

import {
	Camera,
	GeoJSONSource,
	ImageSource,
	Layer,
	Map as MapView,
	Marker,
	RasterSource,
} from '@maplibre/maplibre-react-native'

import { Image } from 'expo-image'
import * as Location from 'expo-location'

import { useEffect, useMemo, useRef, useState } from 'react'

import { ActivityIndicator, Pressable, Text, View } from 'react-native'

import { SafeAreaView } from 'react-native-safe-area-context'

import { styles } from '@/styles/map'

type Coordinate = [number, number]

type MapMarker = {
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

type SpeciesImage = {
	id: number
	species_id: number
	type: string
	path: string
	alt_text?: string | null
	sort_order?: number | null
}

type Species = {
	id: number
	common_name: string
	scientific_name?: string | null
	description?: string | null
	images?: SpeciesImage[]
}

type SpeciesLocation = {
	id: number
	species_id: number
	zone_id: number
	name?: string | null
	latitude: number
	longitude: number
	description?: string | null
	is_active?: boolean
	species?: Species | null
}

type PathNode = {
	id?: string | number
	lat?: string | number
	lng?: string | number
	latitude?: string | number
	longitude?: string | number
	coordinates?: Coordinate
}

type PathEdge = {
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

type PathCoordinates =
	| Coordinate[]
	| {
			nodes?: PathNode[]
			edges?: PathEdge[]
	  }
	| null
	| undefined

type MapPath = {
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

type GeoJSONGeometry =
	| {
			type: 'Polygon'
			coordinates: number[][][]
	  }
	| {
			type: 'MultiPolygon'
			coordinates: number[][][][]
	  }
	| null

type Zone = {
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

type MapResponse = {
	success: boolean
	data: {
		zones: Zone[]
	}
}

type SelectableItem = {
	id: string
	name: string
	type: 'marker' | 'species'
	description?: string | null
	coordinate: Coordinate
	color?: string | null
	icon?: string | null
	iconImage?: string | null
	thumbnail?: string | null
	species?: Species | null
}

type GraphNode = {
	id: string
	coordinate: Coordinate
}

type GraphEdge = {
	to: string
	distance: number
}

type NearestPathPoint = {
	point: Coordinate
	nodeId: string
	distance: number
}

type RouteResult = {
	coordinates: Coordinate[]
	distance: number
	pathCoordinates: Coordinate[]
	connectors: Coordinate[][]
}

const ZOO_CENTER: Coordinate = [-104.6532, 24.0277]

const DEFAULT_ZOOM = 17
const USER_ZOOM = 18

function toNumber(value: unknown): number | null {
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

function parseJsonValue(value: unknown): any {
	if (typeof value !== 'string') {
		return value
	}

	try {
		return JSON.parse(value)
	} catch {
		return value
	}
}

function normalizeCoordinate(value: unknown): Coordinate | null {
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

function normalizeZoneGeometry(
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

function normalizeMapImageUrl(value: unknown): string | null {
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

function normalizeSpeciesImageUrl(value: unknown): string | null {
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

function normalizeMarkerIconUrl(value: unknown): string | null {
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

function isImageIcon(value: unknown): boolean {
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

function normalizeImageBounds(
	bounds: unknown,
	geometry: GeoJSONGeometry | null,
): Coordinate[] | null {
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
				return coordinates.slice(0, 4)
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
			return coordinates.slice(0, 4)
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

function normalizeSimplePathCoordinates(coordinates: unknown): Coordinate[] {
	const parsed = parseJsonValue(coordinates)

	if (!Array.isArray(parsed)) {
		return []
	}

	return parsed
		.map((item) => normalizeCoordinate(item))
		.filter((item): item is Coordinate => item !== null)
}

function haversineDistance(a: Coordinate, b: Coordinate): number {
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

function normalizePathGraph(coordinates: PathCoordinates): {
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

function nearestPointOnSegment(
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

function findNearestPathPoint(
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

function pointInRing(point: Coordinate, ring: number[][]): boolean {
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

function pointInPolygon(point: Coordinate, polygon: number[][][]): boolean {
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

function pointInGeometry(
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

function formatDistance(distance: number): string {
	if (distance < 1000) {
		return `${Math.round(distance)} m`
	}

	return `${(distance / 1000).toFixed(2)} km`
}

function formatMinutes(minutes: number | null | undefined): string {
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

export default function MapScreen() {
	const mapRef = useRef<any>(null)
	const cameraRef = useRef<any>(null)

	const locationSubscription = useRef<Location.LocationSubscription | null>(
		null,
	)

	const [loading, setLoading] = useState(true)

	const [error, setError] = useState<string | null>(null)

	const [zones, setZones] = useState<Zone[]>([])

	const [userLocation, setUserLocation] = useState<Coordinate | null>(null)

	const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null)

	const [selectedItem, setSelectedItem] = useState<SelectableItem | null>(null)

	const [route, setRoute] = useState<RouteResult | null>(null)

	const [isUserInsideZoo, setIsUserInsideZoo] = useState(false)

	const [mapReady, setMapReady] = useState(false)

	const [routeCardCollapsed, setRouteCardCollapsed] = useState(false)

	useEffect(() => {
		let mounted = true

		const startLocationTracking = async () => {
			try {
				const permission = await Location.requestForegroundPermissionsAsync()

				if (permission.status !== Location.PermissionStatus.GRANTED) {
					return
				}

				const current = await Location.getCurrentPositionAsync({
					accuracy: Location.Accuracy.High,
				})

				if (!mounted) {
					return
				}

				const longitude = current.coords.longitude

				const latitude = current.coords.latitude

				if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
					return
				}

				setUserLocation([longitude, latitude])

				setLocationAccuracy(current.coords.accuracy ?? null)

				locationSubscription.current = await Location.watchPositionAsync(
					{
						accuracy: Location.Accuracy.High,
						timeInterval: 3000,
						distanceInterval: 3,
					},
					(location) => {
						if (!mounted) {
							return
						}

						const longitude = location.coords.longitude

						const latitude = location.coords.latitude

						if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
							return
						}

						setUserLocation([longitude, latitude])

						setLocationAccuracy(location.coords.accuracy ?? null)
					},
				)
			} catch {
				return
			}
		}

		startLocationTracking()

		return () => {
			mounted = false
			locationSubscription.current?.remove()
			locationSubscription.current = null
		}
	}, [])

	useEffect(() => {
		let mounted = true

		const loadMap = async () => {
			try {
				setLoading(true)
				setError(null)

				const token = await getToken()

				const response = await api<MapResponse>('/map', {
					headers: token
						? {
								Authorization: `Bearer ${token}`,
							}
						: undefined,
				})

				if (!mounted) {
					return
				}

				const receivedZones = response?.data?.zones ?? []

				setZones(receivedZones)
			} catch (apiError) {
				if (mounted) {
					setError(
						apiError instanceof Error
							? apiError.message
							: 'No fue posible cargar el mapa.',
					)
				}
			} finally {
				if (mounted) {
					setLoading(false)
				}
			}
		}

		loadMap()

		return () => {
			mounted = false
		}
	}, [])

	const zonesGeoJson = useMemo(() => {
		const features = zones
			.map((zone) => {
				const geometry = normalizeZoneGeometry(zone.geometry)

				if (!geometry) {
					return null
				}

				return {
					type: 'Feature' as const,
					properties: {
						id: Number(zone.id),
						name: String(zone.name ?? ''),
					},
					geometry,
				}
			})
			.filter((item): item is NonNullable<typeof item> => item !== null)

		return {
			type: 'FeatureCollection',
			features,
		}
	}, [zones])

	const mapImages = useMemo(() => {
		return zones
			.filter((zone) => Boolean(zone.map_image))
			.map((zone) => {
				const geometry = normalizeZoneGeometry(zone.geometry)

				const url = normalizeMapImageUrl(zone.map_image)

				const coordinates = normalizeImageBounds(
					zone.map_image_bounds,
					geometry,
				)

				if (!url || !coordinates) {
					return null
				}

				return {
					id: Number(zone.id),
					name: String(zone.name ?? ''),
					url,
					coordinates,
				}
			})
			.filter(
				(
					item,
				): item is {
					id: number
					name: string
					url: string
					coordinates: Coordinate[]
				} => item !== null,
			)
	}, [zones])

	const pathsGeoJson = useMemo(() => {
		const features: any[] = []

		zones.forEach((zone) => {
			;(zone.paths ?? []).forEach((path) => {
				const normalized = normalizePathGraph(path.coordinates)

				normalized.lines.forEach((line, lineIndex) => {
					if (line.length < 2) {
						return
					}

					features.push({
						type: 'Feature',
						properties: {
							id: `${path.id}-${lineIndex}`,
							path_id: Number(path.id),
							zone_id: Number(zone.id),
							name: String(path.name ?? ''),
						},
						geometry: {
							type: 'LineString',
							coordinates: line,
						},
					})
				})
			})
		})

		return {
			type: 'FeatureCollection',
			features,
		}
	}, [zones])

	const navigationGraph = useMemo(() => {
		const nodes = new globalThis.Map<string, GraphNode>()

		const edges = new globalThis.Map<string, GraphEdge[]>()

		zones.forEach((zone) => {
			;(zone.paths ?? []).forEach((path) => {
				const graph = normalizePathGraph(path.coordinates)

				graph.nodes.forEach((node) => {
					const globalId = `${path.id}-${node.id}`

					nodes.set(globalId, {
						id: globalId,
						coordinate: node.coordinate,
					})

					if (!edges.has(globalId)) {
						edges.set(globalId, [])
					}
				})

				graph.edges.forEach((value, key) => {
					const globalKey = `${path.id}-${key}`

					if (!edges.has(globalKey)) {
						edges.set(globalKey, [])
					}

					value.forEach((edge) => {
						edges.get(globalKey)!.push({
							to: `${path.id}-${edge.to}`,
							distance: edge.distance,
						})
					})
				})
			})
		})

		const graphNodes = Array.from(nodes.values())

		for (let i = 0; i < graphNodes.length; i++) {
			for (let j = i + 1; j < graphNodes.length; j++) {
				const nodeA = graphNodes[i]

				const nodeB = graphNodes[j]

				const pathA = nodeA.id.split('-')[0]

				const pathB = nodeB.id.split('-')[0]

				if (pathA === pathB) {
					continue
				}

				const distance = haversineDistance(nodeA.coordinate, nodeB.coordinate)

				if (distance <= 3) {
					if (!edges.has(nodeA.id)) {
						edges.set(nodeA.id, [])
					}

					if (!edges.has(nodeB.id)) {
						edges.set(nodeB.id, [])
					}

					edges.get(nodeA.id)!.push({
						to: nodeB.id,
						distance,
					})

					edges.get(nodeB.id)!.push({
						to: nodeA.id,
						distance,
					})
				}
			}
		}

		return {
			nodes,
			edges,
		}
	}, [zones])

	const selectableItems = useMemo(() => {
		const items: SelectableItem[] = []

		zones.forEach((zone) => {
			;(zone.markers ?? []).forEach((marker) => {
				const longitude = toNumber(marker.longitude)

				const latitude = toNumber(marker.latitude)

				if (longitude === null || latitude === null) {
					return
				}

				const rawIcon = marker.icon?.trim() ?? null

				const iconIsImage = isImageIcon(rawIcon)

				const iconImage = iconIsImage ? normalizeMarkerIconUrl(rawIcon) : null

				items.push({
					id: `marker-${marker.id}`,
					name: String(marker.name ?? 'Punto'),
					type: 'marker',
					description: marker.description,
					coordinate: [longitude, latitude],
					color: marker.color ?? '#087A5A',
					icon: rawIcon ?? '📍',
					iconImage,
				})
			})

			;(zone.species_locations ?? []).forEach((speciesLocation) => {
				const longitude = toNumber(speciesLocation.longitude)

				const latitude = toNumber(speciesLocation.latitude)

				if (longitude === null || latitude === null) {
					return
				}

				const thumbnailImage =
					speciesLocation.species?.images?.find(
						(image) =>
							image.type === 'thumbnail' &&
							typeof image.path === 'string' &&
							image.path.trim() !== '',
					) ?? null

				const thumbnail = normalizeSpeciesImageUrl(thumbnailImage?.path)

				items.push({
					id: `species-${speciesLocation.id}`,
					name:
						speciesLocation.name ||
						speciesLocation.species?.common_name ||
						'Especie',
					type: 'species',
					description:
						speciesLocation.description ?? speciesLocation.species?.description,
					coordinate: [longitude, latitude],
					color: '#087A5A',
					icon: '🦁',
					thumbnail,
					species: speciesLocation.species,
				})
			})
		})

		return items
	}, [zones])

	useEffect(() => {
		if (!userLocation) {
			setIsUserInsideZoo(false)
			return
		}

		const inside = zones.some((zone) => {
			const geometry = normalizeZoneGeometry(zone.geometry)

			return pointInGeometry(userLocation, geometry)
		})

		setIsUserInsideZoo(inside)
	}, [zones, userLocation])

	useEffect(() => {
		if (!userLocation || !mapReady) {
			return
		}

		const timer = setTimeout(() => {
			try {
				cameraRef.current?.flyTo({
					center: userLocation,
					zoom: USER_ZOOM,
					duration: 500,
				})
			} catch {
				return
			}
		}, 300)

		return () => clearTimeout(timer)
	}, [mapReady, userLocation])

	const calculateRoute = (
		origin: Coordinate,
		destination: Coordinate,
	): RouteResult | null => {
		if (navigationGraph.nodes.size === 0) {
			return null
		}

		const nearestOrigin = findNearestPathPoint(origin, navigationGraph)

		const nearestDestination = findNearestPathPoint(
			destination,
			navigationGraph,
		)

		if (!nearestOrigin || !nearestDestination) {
			return null
		}

		const startId = nearestOrigin.nodeId

		const endId = nearestDestination.nodeId

		const distances = new globalThis.Map<string, number>()

		const previous = new globalThis.Map<string, string | null>()

		const unvisited = new Set<string>()

		navigationGraph.nodes.forEach((node) => {
			distances.set(node.id, Number.POSITIVE_INFINITY)

			previous.set(node.id, null)

			unvisited.add(node.id)
		})

		distances.set(startId, 0)

		while (unvisited.size > 0) {
			let currentId: string | null = null

			let currentDistance = Number.POSITIVE_INFINITY

			unvisited.forEach((id) => {
				const distance = distances.get(id) ?? Number.POSITIVE_INFINITY

				if (distance < currentDistance) {
					currentDistance = distance

					currentId = id
				}
			})

			if (currentId === null || currentDistance === Number.POSITIVE_INFINITY) {
				break
			}

			unvisited.delete(currentId)

			if (currentId === endId) {
				break
			}

			const neighbors = navigationGraph.edges.get(currentId) ?? []

			neighbors.forEach((edge) => {
				if (!unvisited.has(edge.to)) {
					return
				}

				const alternative = currentDistance + edge.distance

				const currentBest = distances.get(edge.to) ?? Number.POSITIVE_INFINITY

				if (alternative < currentBest) {
					distances.set(edge.to, alternative)

					previous.set(edge.to, currentId)
				}
			})
		}

		if (startId !== endId && !previous.get(endId)) {
			return null
		}

		const ids: string[] = []

		let current: string | null = endId

		while (current !== null) {
			ids.unshift(current)

			if (current === startId) {
				break
			}

			current = previous.get(current) ?? null
		}

		if (ids.length === 0 || ids[0] !== startId) {
			return null
		}

		const graphCoordinates = ids
			.map((id) => navigationGraph.nodes.get(id)?.coordinate)
			.filter(
				(coordinate): coordinate is Coordinate => coordinate !== undefined,
			)

		if (graphCoordinates.length < 1) {
			return null
		}

		const pathCoordinates: Coordinate[] = [
			nearestOrigin.point,
			...graphCoordinates,
		]

		const cleanedPathCoordinates = pathCoordinates.filter(
			(coordinate, index) => {
				if (index === 0) {
					return true
				}

				const previous = pathCoordinates[index - 1]

				return haversineDistance(previous, coordinate) > 0.05
			},
		)

		if (nearestDestination.distance > 0.5) {
			cleanedPathCoordinates.push(nearestDestination.point)
		}

		const connectors: Coordinate[][] = []

		if (nearestOrigin.distance > 0.5) {
			connectors.push([origin, nearestOrigin.point])
		}

		if (nearestDestination.distance > 0.5) {
			connectors.push([nearestDestination.point, destination])
		}

		const graphDistance = distances.get(endId) ?? 0

		const totalDistance =
			nearestOrigin.distance + graphDistance + nearestDestination.distance

		return {
			coordinates: [origin, ...cleanedPathCoordinates, destination],
			distance: totalDistance,
			pathCoordinates: cleanedPathCoordinates,
			connectors,
		}
	}

	const routeGeoJson = useMemo(() => {
		if (!route) {
			return {
				type: 'FeatureCollection',
				features: [],
			}
		}

		const features: any[] = []

		if (route.pathCoordinates.length >= 2) {
			features.push({
				type: 'Feature',
				properties: {
					type: 'real-path',
				},
				geometry: {
					type: 'LineString',
					coordinates: route.pathCoordinates,
				},
			})
		}

		route.connectors.forEach((connector, index) => {
			if (connector.length < 2) {
				return
			}

			features.push({
				type: 'Feature',
				properties: {
					type: 'connector',
					id: `connector-${index}`,
				},
				geometry: {
					type: 'LineString',
					coordinates: connector,
				},
			})
		})

		return {
			type: 'FeatureCollection',
			features,
		}
	}, [route])

	const flyToDestination = (coordinate: Coordinate, duration = 800) => {
		try {
			cameraRef.current?.flyTo({
				center: coordinate,
				zoom: 18,
				duration,
			})
		} catch {
			return
		}
	}

	const selectItem = (item: SelectableItem) => {
		setSelectedItem(item)
		setRoute(null)
		setRouteCardCollapsed(false)

		flyToDestination(item.coordinate)
	}

	const handleHowToGetThere = () => {
		if (!selectedItem) {
			return
		}

		if (!userLocation) {
			setRoute(null)
			return
		}

		if (!isUserInsideZoo) {
			setRoute(null)
			return
		}

		const result = calculateRoute(userLocation, selectedItem.coordinate)

		setRoute(result)
		setRouteCardCollapsed(false)

		if (result) {
			flyToDestination(selectedItem.coordinate, 800)
		}
	}

	if (loading) {
		return (
			<SafeAreaView style={styles.loadingContainer}>
				<View style={styles.loadingCard}>
					<ActivityIndicator size='large' color='#087A5A' />

					<Text style={styles.loadingText}>Cargando mapa...</Text>
				</View>
			</SafeAreaView>
		)
	}

	if (error) {
		return (
			<SafeAreaView style={styles.loadingContainer}>
				<View style={styles.errorCard}>
					<View style={styles.errorIconContainer}>
						<Text style={styles.errorIcon}>!</Text>
					</View>

					<Text style={styles.errorTitle}>No fue posible cargar el mapa</Text>

					<Text style={styles.errorText}>{error}</Text>
				</View>
			</SafeAreaView>
		)
	}

	return (
		<SafeAreaView style={styles.container}>
			<MapView
				ref={mapRef}
				style={styles.map}
				mapStyle={{
					version: 8,
					sources: {},
					layers: [],
				}}
				onDidFinishLoadingMap={() => {
					setMapReady(true)
				}}
			>
				<Camera
					ref={cameraRef}
					center={userLocation ?? ZOO_CENTER}
					zoom={userLocation ? USER_ZOOM : DEFAULT_ZOOM}
				/>

				<RasterSource
					id='osm-raster'
					tiles={['https://tile.openstreetmap.org/{z}/{x}/{y}.png']}
					tileSize={256}
					minZoomLevel={0}
					maxZoomLevel={19}
				>
					<Layer
						id='osm-raster-layer'
						type='raster'
						paint={{
							'raster-opacity': 1,
						}}
					/>
				</RasterSource>

				{mapImages.map((image) => (
					<ImageSource
						key={`zone-image-source-${image.id}`}
						id={`zone-image-source-${image.id}`}
						url={image.url}
						coordinates={image.coordinates}
					>
						<Layer
							id={`zone-image-layer-${image.id}`}
							type='raster'
							paint={{
								'raster-opacity': 1,
							}}
						/>
					</ImageSource>
				))}

				<GeoJSONSource id='zoo-zones-source' data={zonesGeoJson as any}>
					<Layer
						id='zoo-zones-fill'
						type='fill'
						source='zoo-zones-source'
						paint={{
							'fill-color': '#087A5A',
							'fill-opacity': 0.12,
						}}
					/>

					<Layer
						id='zoo-zones-outline'
						type='line'
						source='zoo-zones-source'
						paint={{
							'line-color': '#087A5A',
							'line-width': 2,
							'line-opacity': 0.7,
						}}
					/>
				</GeoJSONSource>

				<GeoJSONSource id='zoo-paths-source' data={pathsGeoJson as any}>
					<Layer
						id='zoo-paths-outline'
						type='line'
						source='zoo-paths-source'
						paint={{
							'line-color': '#123C32',
							'line-width': 9,
							'line-opacity': 0.5,
							'line-cap': 'round',
							'line-join': 'round',
						}}
					/>

					<Layer
						id='zoo-paths-line'
						type='line'
						source='zoo-paths-source'
						paint={{
							'line-color': '#F7F7EE',
							'line-width': 6,
							'line-opacity': 1,
							'line-cap': 'round',
							'line-join': 'round',
						}}
					/>
				</GeoJSONSource>

				<GeoJSONSource id='zoo-route-source' data={routeGeoJson as any}>
					<Layer
						id='zoo-route-outline'
						type='line'
						source='zoo-route-source'
						filter={['==', ['get', 'type'], 'real-path']}
						paint={{
							'line-color': '#F7F7EE',
							'line-width': 12,
							'line-opacity': 0.95,
							'line-cap': 'round',
							'line-join': 'round',
						}}
					/>

					<Layer
						id='zoo-route-line'
						type='line'
						source='zoo-route-source'
						filter={['==', ['get', 'type'], 'real-path']}
						paint={{
							'line-color': '#064D36',
							'line-width': 7,
							'line-opacity': 1,
							'line-cap': 'round',
							'line-join': 'round',
						}}
					/>

					<Layer
						id='zoo-route-connector'
						type='line'
						source='zoo-route-source'
						filter={['==', ['get', 'type'], 'connector']}
						paint={{
							'line-color': '#064D36',
							'line-width': 5,
							'line-opacity': 0.9,
							'line-dasharray': [1.5, 2.5],
							'line-cap': 'round',
							'line-join': 'round',
						}}
					/>
				</GeoJSONSource>

				{selectableItems
					.filter((item) => item.type === 'marker')
					.map((item) => (
						<Marker
							key={item.id}
							lngLat={item.coordinate}
							onPress={() => selectItem(item)}
						>
							<View
								style={[
									styles.mapMarker,
									{
										backgroundColor: item.color ?? '#087A5A',
									},
								]}
							>
								{item.iconImage ? (
									<Image
										source={{
											uri: item.iconImage,
										}}
										style={styles.mapMarkerImage}
										contentFit='contain'
										cachePolicy='memory-disk'
									/>
								) : (
									<Text style={styles.mapMarkerIcon}>{item.icon ?? '📍'}</Text>
								)}
							</View>
						</Marker>
					))}

				{selectableItems
					.filter((item) => item.type === 'species')
					.map((item) => (
						<Marker
							key={item.id}
							lngLat={item.coordinate}
							onPress={() => selectItem(item)}
						>
							<View
								style={[
									styles.speciesMarker,
									{
										backgroundColor: item.color ?? '#064D36',
									},
								]}
							>
								{item.thumbnail ? (
									<Image
										source={{
											uri: item.thumbnail,
										}}
										style={styles.speciesMarkerImage}
										contentFit='cover'
										cachePolicy='memory-disk'
									/>
								) : (
									<Text style={styles.mapMarkerIcon}>{item.icon ?? '🦁'}</Text>
								)}
							</View>
						</Marker>
					))}

				{userLocation && (
					<Marker lngLat={userLocation}>
						<View style={styles.userLocationOuter}>
							<View style={styles.userLocationInner} />
						</View>
					</Marker>
				)}

				{selectedItem && (
					<Marker lngLat={selectedItem.coordinate}>
						<View
							style={
								selectedItem.type === 'species'
									? styles.destinationSpecies
									: [
											styles.destinationMarker,
											{
												backgroundColor: selectedItem.color ?? '#064D36',
											},
										]
							}
						>
							{selectedItem.type === 'species' && selectedItem.thumbnail ? (
								<Image
									source={{
										uri: selectedItem.thumbnail,
									}}
									style={styles.destinationSpeciesImage}
									contentFit='cover'
									cachePolicy='memory-disk'
								/>
							) : selectedItem.type === 'marker' && selectedItem.iconImage ? (
								<Image
									source={{
										uri: selectedItem.iconImage,
									}}
									style={styles.destinationMarkerImage}
									contentFit='contain'
									cachePolicy='memory-disk'
								/>
							) : (
								<Text style={styles.destinationIcon}>
									{selectedItem.type === 'species'
										? (selectedItem.icon ?? '🦁')
										: (selectedItem.icon ?? '📍')}
								</Text>
							)}
						</View>
					</Marker>
				)}
			</MapView>

			<View style={styles.topPanel}>
				<View style={styles.headerRow}>
					<View style={styles.headerTextContainer}>
						<Text style={styles.title}>Mapa del zoológico</Text>

						<Text style={styles.subtitle}>
							Explora zonas, caminos y especies
						</Text>
					</View>

					<View style={styles.statusBadge}>
						<View
							style={[
								styles.statusDot,
								{
									backgroundColor: isUserInsideZoo ? '#087A5A' : '#B8DCCA',
								},
							]}
						/>

						<Text style={styles.statusText}>
							{isUserInsideZoo ? 'Dentro' : 'Fuera'}
						</Text>
					</View>
				</View>
			</View>

			{userLocation && (
				<View style={styles.locationBadge}>
					<View style={styles.locationBadgeDot} />

					<View>
						<Text style={styles.locationBadgeTitle}>Tu ubicación</Text>

						{locationAccuracy !== null && (
							<Text style={styles.locationBadgeText}>
								Precisión ±{Math.round(locationAccuracy)}m
							</Text>
						)}
					</View>
				</View>
			)}

			{selectedItem && !routeCardCollapsed && (
				<View style={styles.bottomCard}>
					<View style={styles.bottomCardHeader}>
						<View
							style={[
								styles.itemIcon,
								selectedItem.type === 'species'
									? styles.itemIconSpecies
									: styles.itemIconMarker,
								selectedItem.type === 'marker' && {
									backgroundColor: selectedItem.color ?? '#DCEFE5',
								},
							]}
						>
							{selectedItem.type === 'species' && selectedItem.thumbnail ? (
								<Image
									source={{
										uri: selectedItem.thumbnail,
									}}
									style={styles.itemSpeciesImage}
									contentFit='cover'
									cachePolicy='memory-disk'
								/>
							) : selectedItem.type === 'marker' && selectedItem.iconImage ? (
								<Image
									source={{
										uri: selectedItem.iconImage,
									}}
									style={styles.itemMarkerImage}
									contentFit='contain'
									cachePolicy='memory-disk'
								/>
							) : (
								<Text>
									{selectedItem.type === 'species'
										? (selectedItem.icon ?? '🦁')
										: (selectedItem.icon ?? '📍')}
								</Text>
							)}
						</View>

						<View style={styles.itemTextContainer}>
							<Text style={styles.itemTitle} numberOfLines={1}>
								{selectedItem.name}
							</Text>

							<Text style={styles.itemType}>
								{selectedItem.type === 'species'
									? 'Especie'
									: 'Punto de interés'}
							</Text>
						</View>

						<Pressable
							onPress={() => setRouteCardCollapsed(true)}
							style={({ pressed }) => ({
								...styles.closeButton,
								opacity: pressed ? 0.7 : 1,
							})}
						>
							<Text style={styles.closeButtonText}>×</Text>
						</Pressable>
					</View>

					{selectedItem.type === 'species' &&
						selectedItem.species?.scientific_name && (
							<Text style={styles.scientificName}>
								{selectedItem.species.scientific_name}
							</Text>
						)}

					{selectedItem.description && (
						<Text style={styles.itemDescription} numberOfLines={3}>
							{selectedItem.description}
						</Text>
					)}

					<View style={styles.actionRow}>
						<View
							style={[
								styles.howToButtonContainer,
								{
									backgroundColor:
										!userLocation || !isUserInsideZoo ? '#B8DCCA' : '#087A5A',

									borderColor:
										!userLocation || !isUserInsideZoo ? '#B8DCCA' : '#064D36',
								},
							]}
						>
							<Pressable
								onPress={handleHowToGetThere}
								disabled={!userLocation || !isUserInsideZoo}
								style={({ pressed }) => ({
									flex: 1,
									alignItems: 'center',
									justifyContent: 'center',
									backgroundColor: 'transparent',
									opacity: pressed ? 0.7 : 1,
								})}
							>
								<Text style={styles.howToButtonText}>Cómo llegar ➜</Text>
							</Pressable>
						</View>
					</View>

					{!isUserInsideZoo && userLocation && (
						<Text style={styles.outsideZooText}>
							Debes estar dentro del zoológico para calcular una ruta por los
							caminos internos.
						</Text>
					)}

					{route && (
						<View style={styles.routeInfo}>
							<View style={styles.routeSummary}>
								<Text style={styles.routeLabel}>Ruta por caminos</Text>

								<Text style={styles.routeDistance}>
									{formatDistance(route.distance)}
								</Text>
							</View>

							<View style={styles.routeTimeBox}>
								<Text style={styles.routeTime}>
									{formatMinutes(route.distance / 80)}
								</Text>

								<Text style={styles.routeTimeLabel}>caminando</Text>
							</View>

							<Pressable
								style={({ pressed }) => ({
									...styles.routeButton,
									opacity: pressed ? 0.7 : 1,
								})}
								onPress={() => flyToDestination(selectedItem.coordinate, 500)}
							>
								<Text style={styles.routeButtonText}>Ver destino</Text>
							</Pressable>
						</View>
					)}

					{!route && userLocation && isUserInsideZoo && (
						<Text style={styles.routeHint}>
							Presiona "Cómo llegar" para calcular la ruta por los caminos del
							zoológico.
						</Text>
					)}

					{!userLocation && (
						<Text style={styles.noRouteText}>
							No tenemos acceso a tu ubicación para calcular la ruta.
						</Text>
					)}
				</View>
			)}

			{selectedItem && routeCardCollapsed && (
				<View style={styles.collapsedCardShadow}>
					<Pressable
						onPress={() => setRouteCardCollapsed(false)}
						style={({ pressed }) => ({
							...styles.collapsedRouteCard,
							opacity: pressed ? 0.7 : 1,
						})}
					>
						<View
							style={[
								styles.collapsedRouteIcon,
								selectedItem.type === 'marker' && {
									backgroundColor: selectedItem.color ?? '#087A5A',
								},
							]}
						>
							{selectedItem.type === 'species' && selectedItem.thumbnail ? (
								<Image
									source={{
										uri: selectedItem.thumbnail,
									}}
									style={styles.collapsedSpeciesImage}
									contentFit='cover'
									cachePolicy='memory-disk'
								/>
							) : selectedItem.type === 'marker' && selectedItem.iconImage ? (
								<Image
									source={{
										uri: selectedItem.iconImage,
									}}
									style={styles.collapsedMarkerImage}
									contentFit='contain'
									cachePolicy='memory-disk'
								/>
							) : (
								<Text style={styles.collapsedRouteIconText}>
									{selectedItem.type === 'species'
										? (selectedItem.icon ?? '🦁')
										: (selectedItem.icon ?? '📍')}
								</Text>
							)}
						</View>

						<View style={styles.collapsedRouteMain}>
							<View style={styles.collapsedRouteName}>
								<Text style={styles.collapsedRouteTitle} numberOfLines={1}>
									{selectedItem.name}
								</Text>

								<Text style={styles.collapsedRouteSubtitle}>
									Ruta por caminos
								</Text>
							</View>

							{route && (
								<View style={styles.collapsedRouteStats}>
									<View style={styles.collapsedRouteStat}>
										<Text style={styles.collapsedRouteDistance}>
											{formatDistance(route.distance)}
										</Text>

										<Text style={styles.collapsedRouteLabel}>distancia</Text>
									</View>

									<View style={styles.collapsedRouteSeparator} />

									<View style={styles.collapsedRouteStat}>
										<Text style={styles.collapsedRouteTime}>
											{formatMinutes(route.distance / 80)}
										</Text>

										<Text style={styles.collapsedRouteLabel}>caminando</Text>
									</View>
								</View>
							)}
						</View>

						<View style={styles.collapsedRouteExpand}>
							<HugeiconsIcon icon={ArrowUp01Icon} size={18} color='#087A5A' />
						</View>
					</Pressable>
				</View>
			)}
		</SafeAreaView>
	)
}
