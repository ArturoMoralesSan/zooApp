import { api, API_URL } from '@/services/api'

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

import {
	ActivityIndicator,
	Pressable,
	Text,
	View,
	type ViewStyle,
} from 'react-native'

import { SafeAreaView } from 'react-native-safe-area-context'
import colors from '@/theme/colors'
import type {
	Coordinate,
	GeoJSONGeometry,
	MapResponse,
	MapSpecies,
	PathCoordinates,
	PathEdge,
	PathNode,
	Zone,
} from '@/types/map'

const mapShadow: ViewStyle = {
	// eslint-disable-next-line no-restricted-syntax -- neutral shadow over the map imagery
	shadowColor: '#000000',
	shadowOffset: { width: 0, height: 5 },
	shadowOpacity: 0.18,
	shadowRadius: 8,
	elevation: 1,
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
	species?: MapSpecies | null
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

				const response = await api<MapResponse>('/map')

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
					color: marker.color ?? colors.esmeralda,
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
					color: colors.esmeralda,
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
			<SafeAreaView className='flex-1 items-center justify-center bg-screen px-6'>
				<View
					className='w-full max-w-[320px] items-center justify-center rounded-3xl bg-niebla px-6 py-[30px]'
					style={mapShadow}
				>
					<ActivityIndicator size='large' color={colors.esmeralda} />

					<Text className='mt-3.5 text-[15px] font-semibold text-tinta-2'>
						Cargando mapa...
					</Text>
				</View>
			</SafeAreaView>
		)
	}

	if (error) {
		return (
			<SafeAreaView className='flex-1 items-center justify-center bg-screen px-6'>
				<View
					className='w-full max-w-[360px] items-center rounded-3xl border border-error-border bg-error-bg px-6 py-7'
					style={mapShadow}
				>
					<View className='mb-3.5 h-[52px] w-[52px] items-center justify-center rounded-[18px] bg-error-border'>
						<Text className='text-[28px] font-extrabold text-error'>!</Text>
					</View>

					<Text className='mb-2 text-center text-[20px] font-extrabold text-tinta'>
						No fue posible cargar el mapa
					</Text>

					<Text className='text-center text-[14px] leading-[21px] text-tinta-2'>
						{error}
					</Text>
				</View>
			</SafeAreaView>
		)
	}

	return (
		<SafeAreaView className='flex-1 bg-screen'>
			<MapView
				ref={mapRef}
				style={{ flex: 1 }}
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
							'fill-color': colors.esmeralda,
							'fill-opacity': 0.12,
						}}
					/>

					<Layer
						id='zoo-zones-outline'
						type='line'
						source='zoo-zones-source'
						paint={{
							'line-color': colors.esmeralda,
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
							'line-color': colors.tinta,
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
							'line-color': colors.blanco,
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
							'line-color': colors.blanco,
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
							'line-color': colors.bosque,
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
							'line-color': colors.bosque,
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
								className='h-[38px] w-[38px] items-center justify-center overflow-hidden rounded-[19px] border-[3px] border-blanco'
								style={[
									mapShadow,
									{ backgroundColor: item.color ?? colors.esmeralda },
								]}
							>
								{item.iconImage ? (
									<Image
										source={{
											uri: item.iconImage,
										}}
										style={{ width: 30, height: 30, borderRadius: 15 }}
										contentFit='contain'
										cachePolicy='memory-disk'
									/>
								) : (
									<Text className='text-[18px]'>{item.icon ?? '📍'}</Text>
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
								className='h-[42px] w-[42px] items-center justify-center overflow-hidden rounded-[21px] border-[3px] border-blanco'
								style={[
									mapShadow,
									{ backgroundColor: item.color ?? colors.bosque },
								]}
							>
								{item.thumbnail ? (
									<Image
										source={{
											uri: item.thumbnail,
										}}
										style={{ width: 36, height: 36, borderRadius: 18 }}
										contentFit='cover'
										cachePolicy='memory-disk'
									/>
								) : (
									<Text className='text-[18px]'>{item.icon ?? '🦁'}</Text>
								)}
							</View>
						</Marker>
					))}

				{userLocation && (
					<Marker lngLat={userLocation}>
						{/* eslint-disable-next-line no-restricted-syntax -- user-location blue, standard map convention */}
						<View className='h-[46px] w-[46px] items-center justify-center rounded-[23px] border border-[rgba(8,121,141,0.4)] bg-[rgba(8,118,161,0.2)]'>
							<View
								// eslint-disable-next-line no-restricted-syntax -- user-location blue, standard map convention
								className='h-[17px] w-[17px] rounded-[9px] border-[3px] border-blanco bg-[#0977B8]'
								style={mapShadow}
							/>
						</View>
					</Marker>
				)}

				{selectedItem && (
					<Marker lngLat={selectedItem.coordinate}>
						<View
							className={
								selectedItem.type === 'species'
									? 'h-12 w-12 items-center justify-center overflow-hidden rounded-3xl border-4 border-blanco bg-esmeralda'
									: 'h-[46px] w-[46px] items-center justify-center overflow-hidden rounded-[23px] border-4 border-blanco'
							}
							style={[
								mapShadow,
								selectedItem.type === 'marker' && {
									backgroundColor: selectedItem.color ?? colors.bosque,
								},
							]}
						>
							{selectedItem.type === 'species' && selectedItem.thumbnail ? (
								<Image
									source={{
										uri: selectedItem.thumbnail,
									}}
									style={{ width: 40, height: 40, borderRadius: 20 }}
									contentFit='cover'
									cachePolicy='memory-disk'
								/>
							) : selectedItem.type === 'marker' && selectedItem.iconImage ? (
								<Image
									source={{
										uri: selectedItem.iconImage,
									}}
									style={{ width: 36, height: 36, borderRadius: 18 }}
									contentFit='contain'
									cachePolicy='memory-disk'
								/>
							) : (
								<Text className='text-[20px]'>
									{selectedItem.type === 'species'
										? (selectedItem.icon ?? '🦁')
										: (selectedItem.icon ?? '📍')}
								</Text>
							)}
						</View>
					</Marker>
				)}
			</MapView>

			<View
				className='absolute left-3 right-3 top-[60px] rounded-[22px] bg-niebla p-4'
				style={mapShadow}
			>
				<View className='flex-row items-center justify-between'>
					<View className='flex-1 pr-2.5'>
						<Text className='text-[19px] font-extrabold text-tinta'>
							Mapa del zoológico
						</Text>

						<Text className='mt-[3px] text-[12px] text-tinta-2'>
							Explora zonas, caminos y especies
						</Text>
					</View>

					<View className='flex-row items-center rounded-2xl bg-hoja px-2.5 py-[7px]'>
						<View
							className={`mr-[5px] h-2 w-2 rounded ${isUserInsideZoo ? 'bg-esmeralda' : 'bg-apagado'}`}
						/>

						<Text className='text-[11px] font-bold text-tinta'>
							{isUserInsideZoo ? 'Dentro' : 'Fuera'}
						</Text>
					</View>
				</View>
			</View>

			{userLocation && (
				<View
					className='absolute right-3.5 top-[150px] flex-row items-center rounded-2xl bg-niebla px-[11px] py-2'
					style={mapShadow}
				>
					{/* eslint-disable-next-line no-restricted-syntax -- user-location blue, standard map convention */}
					<View className='mr-[7px] h-[9px] w-[9px] rounded-[5px] bg-[#0977B8]' />

					<View>
						<Text className='text-[11px] font-bold text-tinta'>
							Tu ubicación
						</Text>

						{locationAccuracy !== null && (
							<Text className='mt-px text-[9px] text-tinta-2'>
								Precisión ±{Math.round(locationAccuracy)}m
							</Text>
						)}
					</View>
				</View>
			)}

			{selectedItem && !routeCardCollapsed && (
				<View
					className='absolute bottom-[15px] left-3 right-3 rounded-[22px] bg-niebla p-4'
					style={mapShadow}
				>
					<View className='flex-row items-center'>
						<View
							className='h-[42px] w-[42px] items-center justify-center overflow-hidden rounded-2xl bg-hoja'
							style={
								selectedItem.type === 'marker' && {
									backgroundColor: selectedItem.color ?? colors.hoja,
								}
							}
						>
							{selectedItem.type === 'species' && selectedItem.thumbnail ? (
								<Image
									source={{
										uri: selectedItem.thumbnail,
									}}
									style={{ width: 42, height: 42, borderRadius: 16 }}
									contentFit='cover'
									cachePolicy='memory-disk'
								/>
							) : selectedItem.type === 'marker' && selectedItem.iconImage ? (
								<Image
									source={{
										uri: selectedItem.iconImage,
									}}
									style={{ width: 34, height: 34, borderRadius: 12 }}
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

						<View className='mx-2.5 min-w-0 flex-1'>
							<Text
								className='text-[16px] font-extrabold text-tinta'
								numberOfLines={1}
							>
								{selectedItem.name}
							</Text>

							<Text className='mt-0.5 text-[11px] text-tinta-2'>
								{selectedItem.type === 'species'
									? 'Especie'
									: 'Punto de interés'}
							</Text>
						</View>

						<Pressable
							onPress={() => setRouteCardCollapsed(true)}
							className='h-[34px] w-[34px] items-center justify-center rounded-2xl bg-hoja active:opacity-70'
						>
							<Text className='text-[23px] leading-[25px] text-tinta'>×</Text>
						</Pressable>
					</View>

					{selectedItem.type === 'species' &&
						selectedItem.species?.scientific_name && (
							<Text className='mt-2 text-[12px] italic text-tinta-2'>
								{selectedItem.species.scientific_name}
							</Text>
						)}

					{selectedItem.description && (
						<Text
							className='mt-3 text-[13px] leading-[19px] text-tinta-2'
							numberOfLines={3}
						>
							{selectedItem.description}
						</Text>
					)}

					<View className='mt-3.5 w-full'>
						<View
							className={`h-14 w-full overflow-hidden rounded-2xl border ${!userLocation || !isUserInsideZoo ? 'border-apagado bg-apagado' : 'border-bosque bg-esmeralda'}`}
							style={mapShadow}
						>
							<Pressable
								onPress={handleHowToGetThere}
								disabled={!userLocation || !isUserInsideZoo}
								className='flex-1 items-center justify-center bg-transparent active:opacity-70'
							>
								<Text
									className='m-0 p-0 text-center text-[16px] font-extrabold leading-[56px] text-blanco'
									style={{
										includeFontPadding: false,
										textAlignVertical: 'center',
									}}
								>
									Cómo llegar ➜
								</Text>
							</Pressable>
						</View>
					</View>

					{!isUserInsideZoo && userLocation && (
						<Text className='mt-2.5 text-[11px] leading-[17px] text-tinta-2'>
							Debes estar dentro del zoológico para calcular una ruta por los
							caminos internos.
						</Text>
					)}

					{route && (
						<View className='mt-3.5 flex-row items-center justify-between gap-2.5 border-t border-t-card-border pt-[13px]'>
							<View className='min-w-0 flex-1'>
								<Text className='text-[11px] text-tinta-2'>
									Ruta por caminos
								</Text>

								<Text className='mt-0.5 text-[17px] font-extrabold text-bosque'>
									{formatDistance(route.distance)}
								</Text>
							</View>

							<View className='min-w-12 items-center'>
								<Text className='text-[13px] font-extrabold text-tinta'>
									{formatMinutes(route.distance / 80)}
								</Text>

								<Text className='text-[9px] text-tinta-2'>caminando</Text>
							</View>

							<Pressable
								className='rounded-2xl bg-bosque px-[15px] py-2.5 active:opacity-70'
								style={mapShadow}
								onPress={() => flyToDestination(selectedItem.coordinate, 500)}
							>
								<Text className='text-[11px] font-bold text-blanco'>
									Ver destino
								</Text>
							</Pressable>
						</View>
					)}

					{!route && userLocation && isUserInsideZoo && (
						<Text className='mt-2.5 text-[11px] leading-[17px] text-tinta-2'>
							Presiona “Cómo llegar” para calcular la ruta por los caminos del
							zoológico.
						</Text>
					)}

					{!userLocation && (
						<Text className='mt-3 text-[12px] leading-[18px] text-tinta-2'>
							No tenemos acceso a tu ubicación para calcular la ruta.
						</Text>
					)}
				</View>
			)}

			{selectedItem && routeCardCollapsed && (
				<View
					className='absolute bottom-[15px] left-3 right-3 h-[72px] rounded-[20px] bg-niebla'
					style={mapShadow}
				>
					<Pressable
						onPress={() => setRouteCardCollapsed(false)}
						className='relative h-[72px] w-full justify-center rounded-[20px] bg-niebla px-3 active:opacity-70'
					>
						<View
							className='absolute left-3 top-[15px] h-[35px] w-[35px] items-center justify-center overflow-hidden rounded-[14px] bg-esmeralda'
							style={
								selectedItem.type === 'marker' && {
									backgroundColor: selectedItem.color ?? colors.esmeralda,
								}
							}
						>
							{selectedItem.type === 'species' && selectedItem.thumbnail ? (
								<Image
									source={{
										uri: selectedItem.thumbnail,
									}}
									style={{ width: 35, height: 35, borderRadius: 14 }}
									contentFit='cover'
									cachePolicy='memory-disk'
								/>
							) : selectedItem.type === 'marker' && selectedItem.iconImage ? (
								<Image
									source={{
										uri: selectedItem.iconImage,
									}}
									style={{ width: 30, height: 30, borderRadius: 12 }}
									contentFit='contain'
									cachePolicy='memory-disk'
								/>
							) : (
								<Text className='text-[18px]'>
									{selectedItem.type === 'species'
										? (selectedItem.icon ?? '🦁')
										: (selectedItem.icon ?? '📍')}
								</Text>
							)}
						</View>

						<View className='absolute left-[59px] right-[92px] top-3 h-12 justify-center'>
							<View className='w-full justify-center'>
								<Text
									className='text-[14px] font-extrabold leading-[18px] text-tinta'
									numberOfLines={1}
								>
									{selectedItem.name}
								</Text>

								<Text className='mt-0.5 text-[9px] leading-3 text-tinta-2'>
									Ruta por caminos
								</Text>
							</View>

							{route && (
								<View className='absolute -right-[30px] top-0 h-12 w-[125px] flex-row items-center justify-end'>
									<View className='w-[52px] items-center justify-center'>
										<Text className='text-center text-[14px] font-extrabold leading-[17px] text-bosque'>
											{formatDistance(route.distance)}
										</Text>

										<Text className='mt-px text-center text-[7px] leading-[9px] text-tinta-2'>
											distancia
										</Text>
									</View>

									<View className='mx-[5px] h-6 w-px bg-card-border' />

									<View className='w-[52px] items-center justify-center'>
										<Text className='text-center text-[13px] font-extrabold leading-4 text-tinta'>
											{formatMinutes(route.distance / 80)}
										</Text>

										<Text className='mt-px text-center text-[7px] leading-[9px] text-tinta-2'>
											caminando
										</Text>
									</View>
								</View>
							)}
						</View>

						<View className='absolute right-3 top-5 h-8 w-8 items-center justify-center rounded-2xl bg-hoja'>
							<HugeiconsIcon
								icon={ArrowUp01Icon}
								size={18}
								color={colors.esmeralda}
							/>
						</View>
					</Pressable>
				</View>
			)}
		</SafeAreaView>
	)
}
