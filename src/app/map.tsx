import { api } from '@/services/api'
import { getToken } from '@/services/auth'
import {
	Camera,
	GeoJSONSource,
	Layer,
	Map as MapView,
	Marker,
	RasterSource,
} from '@maplibre/maplibre-react-native'
import * as Location from 'expo-location'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
	ActivityIndicator,
	Modal,
	Pressable,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native'

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

type Species = {
	id: number
	common_name: string
	scientific_name?: string | null
	description?: string | null
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

type RouteResult = {
	coordinates: Coordinate[]
	distance: number
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

function getGeometryCenter(
	geometry: GeoJSONGeometry | null,
): Coordinate | null {
	if (!geometry) {
		return null
	}

	const points: Coordinate[] = []

	if (geometry.type === 'Polygon') {
		geometry.coordinates.forEach((ring) => {
			ring.forEach((coordinate) => {
				const point = normalizeCoordinate(coordinate)

				if (point) {
					points.push(point)
				}
			})
		})
	}

	if (geometry.type === 'MultiPolygon') {
		geometry.coordinates.forEach((polygon) => {
			polygon.forEach((ring) => {
				ring.forEach((coordinate) => {
					const point = normalizeCoordinate(coordinate)

					if (point) {
						points.push(point)
					}
				})
			})
		})
	}

	if (!points.length) {
		return null
	}

	let longitude = 0
	let latitude = 0

	points.forEach(([lng, lat]) => {
		longitude += lng
		latitude += lat
	})

	return [longitude / points.length, latitude / points.length]
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

	const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null)

	const [zoneSelectorOpen, setZoneSelectorOpen] = useState(false)

	const [selectedItem, setSelectedItem] = useState<SelectableItem | null>(null)

	const [route, setRoute] = useState<RouteResult | null>(null)

	const [isUserInsideZoo, setIsUserInsideZoo] = useState(false)

	const [mapReady, setMapReady] = useState(false)

	useEffect(() => {
		let mounted = true

		const startLocationTracking = async () => {
			try {
				const permission = await Location.requestForegroundPermissionsAsync()

				if (permission.status !== Location.PermissionStatus.GRANTED) {
					console.log('⚠️ Permiso de ubicación no concedido')

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

				const coordinate: Coordinate = [longitude, latitude]

				setUserLocation(coordinate)

				setLocationAccuracy(current.coords.accuracy ?? null)

				console.log('📍 Ubicación actual:', coordinate)

				console.log('📐 Precisión GPS:', current.coords.accuracy, 'metros')

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
			} catch (locationError) {
				console.error('❌ Error obteniendo ubicación:', locationError)
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

				console.log('🗺️ Zonas recibidas:', receivedZones.length)

				receivedZones.forEach((zone) => {
					console.log(`Zona ${zone.id}: ${zone.name}`, {
						geometry: Boolean(normalizeZoneGeometry(zone.geometry)),
						markers: zone.markers?.length ?? 0,
						paths: zone.paths?.length ?? 0,
						species: zone.species_locations?.length ?? 0,
					})
				})

				setZones(receivedZones)

				setSelectedZoneId(null)
			} catch (apiError) {
				console.error('❌ Error cargando mapa:', apiError)

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

	const selectedZone = useMemo(() => {
		if (selectedZoneId === null) {
			return null
		}

		return (
			zones.find((zone) => Number(zone.id) === Number(selectedZoneId)) ?? null
		)
	}, [zones, selectedZoneId])

	const zonesGeoJson = useMemo(() => {
		const features = zones
			.map((zone) => {
				const geometry = normalizeZoneGeometry(zone.geometry)

				if (!geometry) {
					console.log('⚠️ Zona sin geometría:', zone.name)

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

		console.log('🟩 ZONAS A PINTAR:', features.length)

		return {
			type: 'FeatureCollection',
			features,
		}
	}, [zones])

	const pathsGeoJson = useMemo(() => {
		const features: any[] = []

		zones.forEach((zone) => {
			if (
				selectedZoneId !== null &&
				Number(zone.id) !== Number(selectedZoneId)
			) {
				return
			}

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

		console.log('🔵 CAMINOS A PINTAR:', features.length)

		return {
			type: 'FeatureCollection',
			features,
		}
	}, [zones, selectedZoneId])

	const navigationGraph = useMemo(() => {
		const nodes = new globalThis.Map<string, GraphNode>()

		const edges = new globalThis.Map<string, GraphEdge[]>()

		zones.forEach((zone) => {
			if (
				selectedZoneId !== null &&
				Number(zone.id) !== Number(selectedZoneId)
			) {
				return
			}

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
	}, [zones, selectedZoneId])

	const selectableItems = useMemo(() => {
		const items: SelectableItem[] = []

		zones.forEach((zone) => {
			if (
				selectedZoneId !== null &&
				Number(zone.id) !== Number(selectedZoneId)
			) {
				return
			}

			;(zone.markers ?? []).forEach((marker) => {
				const longitude = toNumber(marker.longitude)

				const latitude = toNumber(marker.latitude)

				if (longitude === null || latitude === null) {
					return
				}

				items.push({
					id: `marker-${marker.id}`,
					name: String(marker.name ?? 'Punto'),
					type: 'marker',
					description: marker.description,
					coordinate: [longitude, latitude],
					color: marker.color ?? '#2563eb',
					icon: marker.icon ?? '📍',
				})
			})

			;(zone.species_locations ?? []).forEach((speciesLocation) => {
				const longitude = toNumber(speciesLocation.longitude)

				const latitude = toNumber(speciesLocation.latitude)

				if (longitude === null || latitude === null) {
					return
				}

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
					color: '#16a34a',
					icon: '🦁',
					species: speciesLocation.species,
				})
			})
		})

		console.log('📍 PUNTOS A MOSTRAR:', items.length)

		return items
	}, [zones, selectedZoneId])

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

		console.log('📍 Usuario dentro:', inside)
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
			} catch (cameraError) {
				console.log('⚠️ No fue posible centrar cámara:', cameraError)
			}
		}, 300)

		return () => clearTimeout(timer)
	}, [mapReady, userLocation])

	const selectZone = (zone: Zone) => {
		setSelectedZoneId(Number(zone.id))

		setZoneSelectorOpen(false)
		setSelectedItem(null)
		setRoute(null)

		const geometry = normalizeZoneGeometry(zone.geometry)

		const center = getGeometryCenter(geometry)

		if (!center) {
			console.log('⚠️ La zona no tiene centro:', zone.name)

			return
		}

		setTimeout(() => {
			try {
				cameraRef.current?.flyTo({
					center,
					zoom: 17,
					duration: 800,
				})
			} catch (cameraError) {
				console.log('⚠️ Error centrando zona:', cameraError)
			}
		}, 250)
	}

	const calculateRoute = (
		origin: Coordinate,
		destination: Coordinate,
	): RouteResult | null => {
		if (navigationGraph.nodes.size === 0) {
			console.log('⚠️ No hay nodos de navegación.')

			return null
		}

		let startNode: GraphNode | null = null

		let endNode: GraphNode | null = null

		let startDistance = Number.POSITIVE_INFINITY

		let endDistance = Number.POSITIVE_INFINITY

		navigationGraph.nodes.forEach((node) => {
			const originDistance = haversineDistance(origin, node.coordinate)

			const destinationDistance = haversineDistance(
				destination,
				node.coordinate,
			)

			if (originDistance < startDistance) {
				startDistance = originDistance
				startNode = node
			}

			if (destinationDistance < endDistance) {
				endDistance = destinationDistance
				endNode = node
			}
		})

		if (!startNode || !endNode) {
			return null
		}

		const startId = startNode.id
		const endId = endNode.id

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
			console.log('⚠️ No existe ruta entre los puntos.')

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

		const coordinates = ids
			.map((id) => navigationGraph.nodes.get(id)?.coordinate)
			.filter(
				(coordinate): coordinate is Coordinate => coordinate !== undefined,
			)

		if (coordinates.length < 2) {
			return null
		}

		const graphDistance = distances.get(endId) ?? 0

		const totalDistance = graphDistance + startDistance + endDistance

		const routeCoordinates: Coordinate[] = [origin, ...coordinates, destination]

		return {
			coordinates: routeCoordinates,
			distance: totalDistance,
		}
	}

	const routeGeoJson = useMemo(() => {
		if (!route || route.coordinates.length < 2) {
			return {
				type: 'FeatureCollection',
				features: [],
			}
		}

		return {
			type: 'FeatureCollection',
			features: [
				{
					type: 'Feature',
					properties: {},
					geometry: {
						type: 'LineString',
						coordinates: route.coordinates,
					},
				},
			],
		}
	}, [route])

	const flyToDestination = (coordinate: Coordinate, duration = 800) => {
		try {
			cameraRef.current?.flyTo({
				center: coordinate,
				zoom: 18,
				duration,
			})
		} catch {}
	}

	const selectItem = (item: SelectableItem) => {
		setSelectedItem(item)
		setRoute(null)
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
			console.log('⚠️ Usuario fuera del zoológico.')

			setRoute(null)
			return
		}

		const result = calculateRoute(userLocation, selectedItem.coordinate)

		setRoute(result)

		if (result) {
			flyToDestination(selectedItem.coordinate, 800)
		}
	}

	const showAllZoo = () => {
		setSelectedZoneId(null)
		setSelectedItem(null)
		setRoute(null)
		setZoneSelectorOpen(false)

		setTimeout(() => {
			try {
				cameraRef.current?.flyTo({
					center: ZOO_CENTER,
					zoom: 17,
					duration: 800,
				})
			} catch {}
		}, 250)
	}

	if (loading) {
		return (
			<SafeAreaView style={styles.loadingContainer}>
				<ActivityIndicator size='large' color='#16a34a' />

				<Text style={styles.loadingText}>Cargando mapa...</Text>
			</SafeAreaView>
		)
	}

	if (error) {
		return (
			<SafeAreaView style={styles.loadingContainer}>
				<Text style={styles.errorIcon}>⚠️</Text>

				<Text style={styles.errorTitle}>No fue posible cargar el mapa</Text>

				<Text style={styles.errorText}>{error}</Text>
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
					console.log('🗺️ Mapa listo')

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

				<GeoJSONSource id='zoo-zones-source' data={zonesGeoJson as any}>
					<Layer
						id='zoo-zones-fill'
						type='fill'
						source='zoo-zones-source'
						paint={{
							'fill-color': [
								'case',
								['==', ['get', 'id'], selectedZoneId ?? -1],
								'#16a34a',
								'#64748b',
							],
							'fill-opacity': [
								'case',
								['==', ['get', 'id'], selectedZoneId ?? -1],
								0.38,
								0.12,
							],
						}}
					/>

					<Layer
						id='zoo-zones-outline'
						type='line'
						source='zoo-zones-source'
						paint={{
							'line-color': [
								'case',
								['==', ['get', 'id'], selectedZoneId ?? -1],
								'#15803d',
								'#475569',
							],
							'line-width': [
								'case',
								['==', ['get', 'id'], selectedZoneId ?? -1],
								5,
								2,
							],
							'line-opacity': [
								'case',
								['==', ['get', 'id'], selectedZoneId ?? -1],
								1,
								0.75,
							],
						}}
					/>
				</GeoJSONSource>

				<GeoJSONSource id='zoo-paths-source' data={pathsGeoJson as any}>
					<Layer
						id='zoo-paths-outline'
						type='line'
						source='zoo-paths-source'
						paint={{
							'line-color': '#ffffff',
							'line-width': 9,
							'line-opacity': 0.7,
							'line-cap': 'round',
							'line-join': 'round',
						}}
					/>

					<Layer
						id='zoo-paths-line'
						type='line'
						source='zoo-paths-source'
						paint={{
							'line-color': '#2563eb',
							'line-width': 5,
							'line-opacity': 0.95,
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
						paint={{
							'line-color': '#ffffff',
							'line-width': 12,
							'line-opacity': 0.9,
							'line-cap': 'round',
							'line-join': 'round',
						}}
					/>

					<Layer
						id='zoo-route-line'
						type='line'
						source='zoo-route-source'
						paint={{
							'line-color': '#dc2626',
							'line-width': 7,
							'line-opacity': 1,
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
										backgroundColor: item.color ?? '#2563eb',
									},
								]}
							>
								<Text style={styles.mapMarkerIcon}>{item.icon ?? '📍'}</Text>
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
							<View style={styles.speciesMarker}>
								<Text style={styles.mapMarkerIcon}>🦁</Text>
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
									: styles.destinationMarker
							}
						>
							<Text style={styles.destinationIcon}>
								{selectedItem.type === 'species' ? '🦁' : '📍'}
							</Text>
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
									backgroundColor: isUserInsideZoo ? '#16a34a' : '#f59e0b',
								},
							]}
						/>

						<Text style={styles.statusText}>
							{isUserInsideZoo ? 'Dentro' : 'Fuera'}
						</Text>
					</View>
				</View>

				<Text style={styles.selectorLabel}>Zona</Text>

				<Pressable
					style={styles.zoneSelector}
					onPress={() => setZoneSelectorOpen(true)}
				>
					<View style={styles.zoneSelectorTextContainer}>
						<Text style={styles.zoneSelectorTitle} numberOfLines={1}>
							{selectedZone ? selectedZone.name : 'Todo el zoológico'}
						</Text>
					</View>

					<Text style={styles.chevron}>›</Text>
				</Pressable>
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

			{selectedItem && (
				<View style={styles.bottomCard}>
					<View style={styles.bottomCardHeader}>
						<View style={styles.itemIcon}>
							<Text>{selectedItem.type === 'species' ? '🦁' : '📍'}</Text>
						</View>

						<View style={styles.itemTextContainer}>
							<Text style={styles.itemTitle}>{selectedItem.name}</Text>

							<Text style={styles.itemType}>
								{selectedItem.type === 'species'
									? 'Especie'
									: 'Punto de interés'}
							</Text>
						</View>

						<Pressable
							onPress={() => {
								setSelectedItem(null)
								setRoute(null)
							}}
							style={styles.closeButton}
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
						<Pressable
							style={[
								styles.howToButton,
								!userLocation || !isUserInsideZoo
									? styles.howToButtonDisabled
									: null,
							]}
							onPress={handleHowToGetThere}
						>
							<Text style={styles.howToIcon}>➜</Text>

							<Text style={styles.howToButtonText}>Cómo llegar</Text>
						</Pressable>
					</View>

					{!isUserInsideZoo && userLocation && (
						<Text style={styles.outsideZooText}>
							Debes estar dentro del zoológico para calcular una ruta por los
							caminos internos.
						</Text>
					)}

					{route && (
						<View style={styles.routeInfo}>
							<View>
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
								style={styles.routeButton}
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

			<Modal
				visible={zoneSelectorOpen}
				transparent
				animationType='fade'
				onRequestClose={() => setZoneSelectorOpen(false)}
			>
				<View style={styles.modalOverlay}>
					<Pressable
						style={StyleSheet.absoluteFill}
						onPress={() => setZoneSelectorOpen(false)}
					/>

					<View style={styles.modalContainer}>
						<View style={styles.modalHeader}>
							<View>
								<Text style={styles.modalTitle}>Seleccionar zona</Text>

								<Text style={styles.modalSubtitle}>
									Elige el área que quieres explorar
								</Text>
							</View>

							<Pressable
								onPress={() => setZoneSelectorOpen(false)}
								style={styles.modalCloseButton}
							>
								<Text style={styles.modalCloseText}>×</Text>
							</Pressable>
						</View>

						<ScrollView
							style={styles.zoneList}
							showsVerticalScrollIndicator={false}
						>
							<Pressable
								style={
									selectedZoneId === null
										? [styles.zoneOption, styles.zoneOptionActive]
										: styles.zoneOption
								}
								onPress={showAllZoo}
							>
								<View
									style={
										selectedZoneId === null
											? [styles.zoneOptionIcon, styles.zoneOptionIconActive]
											: styles.zoneOptionIcon
									}
								>
									<Text>🦁</Text>
								</View>

								<View style={styles.zoneOptionText}>
									<Text
										style={
											selectedZoneId === null
												? [styles.zoneOptionTitle, styles.zoneOptionTitleActive]
												: styles.zoneOptionTitle
										}
									>
										Todo el zoológico
									</Text>
								</View>

								{selectedZoneId === null && (
									<View style={styles.checkCircle}>
										<Text style={styles.checkText}>✓</Text>
									</View>
								)}
							</Pressable>

							{zones.map((zone) => {
								const active = Number(zone.id) === Number(selectedZoneId)

								return (
									<Pressable
										key={zone.id}
										style={
											active
												? [styles.zoneOption, styles.zoneOptionActive]
												: styles.zoneOption
										}
										onPress={() => selectZone(zone)}
									>
										<View
											style={
												active
													? [styles.zoneOptionIcon, styles.zoneOptionIconActive]
													: styles.zoneOptionIcon
											}
										>
											<Text>🗺️</Text>
										</View>

										<View style={styles.zoneOptionText}>
											<Text
												style={
													active
														? [
																styles.zoneOptionTitle,
																styles.zoneOptionTitleActive,
															]
														: styles.zoneOptionTitle
												}
											>
												{zone.name}
											</Text>
										</View>

										{active && (
											<View style={styles.checkCircle}>
												<Text style={styles.checkText}>✓</Text>
											</View>
										)}
									</Pressable>
								)
							})}
						</ScrollView>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f8fafc',
	},

	map: {
		flex: 1,
	},

	loadingContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#f8fafc',
		paddingHorizontal: 30,
	},

	loadingText: {
		marginTop: 14,
		fontSize: 15,
		color: '#475569',
	},

	errorIcon: {
		fontSize: 42,
		marginBottom: 15,
	},

	errorTitle: {
		fontSize: 20,
		fontWeight: '700',
		color: '#0f172a',
		textAlign: 'center',
		marginBottom: 8,
	},

	errorText: {
		fontSize: 14,
		lineHeight: 21,
		color: '#64748b',
		textAlign: 'center',
	},

	topPanel: {
		position: 'absolute',
		top: 12,
		left: 12,
		right: 12,
		backgroundColor: 'rgba(255,255,255,0.97)',
		borderRadius: 22,
		padding: 16,
		shadowColor: '#000000',
		shadowOpacity: 0.15,
		shadowRadius: 10,
		shadowOffset: {
			width: 0,
			height: 4,
		},
		elevation: 7,
	},

	headerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},

	headerTextContainer: {
		flex: 1,
		paddingRight: 10,
	},

	title: {
		fontSize: 19,
		fontWeight: '800',
		color: '#0f172a',
	},

	subtitle: {
		marginTop: 3,
		fontSize: 12,
		color: '#64748b',
	},

	statusBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 999,
		paddingHorizontal: 10,
		paddingVertical: 7,
		backgroundColor: '#f8fafc',
	},

	statusDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		marginRight: 5,
	},

	statusText: {
		fontSize: 11,
		fontWeight: '700',
		color: '#334155',
	},

	selectorLabel: {
		marginTop: 14,
		marginBottom: 6,
		fontSize: 11,
		fontWeight: '700',
		color: '#64748b',
		textTransform: 'uppercase',
		letterSpacing: 0.5,
	},

	zoneSelector: {
		minHeight: 56,
		borderWidth: 1,
		borderColor: '#e2e8f0',
		backgroundColor: '#f8fafc',
		borderRadius: 999,
		paddingHorizontal: 16,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},

	zoneSelectorTextContainer: {
		flex: 1,
		paddingRight: 10,
	},

	zoneSelectorTitle: {
		fontSize: 15,
		fontWeight: '700',
		color: '#0f172a',
	},

	chevron: {
		fontSize: 28,
		lineHeight: 28,
		color: '#64748b',
		transform: [
			{
				rotate: '90deg',
			},
		],
	},

	locationBadge: {
		position: 'absolute',
		right: 14,
		top: 190,
		backgroundColor: 'rgba(255,255,255,0.96)',
		borderRadius: 999,
		paddingHorizontal: 11,
		paddingVertical: 8,
		flexDirection: 'row',
		alignItems: 'center',
		shadowColor: '#000000',
		shadowOpacity: 0.12,
		shadowRadius: 7,
		shadowOffset: {
			width: 0,
			height: 3,
		},
		elevation: 5,
	},

	locationBadgeDot: {
		width: 9,
		height: 9,
		borderRadius: 5,
		backgroundColor: '#2563eb',
		marginRight: 7,
	},

	locationBadgeTitle: {
		fontSize: 11,
		fontWeight: '700',
		color: '#0f172a',
	},

	locationBadgeText: {
		marginTop: 1,
		fontSize: 9,
		color: '#64748b',
	},

	mapMarker: {
		width: 38,
		height: 38,
		borderRadius: 999,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 3,
		borderColor: '#ffffff',
		shadowColor: '#000000',
		shadowOpacity: 0.3,
		shadowRadius: 4,
		shadowOffset: {
			width: 0,
			height: 2,
		},
		elevation: 6,
	},

	speciesMarker: {
		width: 42,
		height: 42,
		borderRadius: 999,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#16a34a',
		borderWidth: 3,
		borderColor: '#ffffff',
		shadowColor: '#000000',
		shadowOpacity: 0.3,
		shadowRadius: 4,
		shadowOffset: {
			width: 0,
			height: 2,
		},
		elevation: 7,
	},

	mapMarkerIcon: {
		fontSize: 18,
	},

	userLocationOuter: {
		width: 46,
		height: 46,
		borderRadius: 999,
		backgroundColor: 'rgba(37,99,235,0.20)',
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: 'rgba(37,99,235,0.40)',
	},

	userLocationInner: {
		width: 17,
		height: 17,
		borderRadius: 999,
		backgroundColor: '#2563eb',
		borderWidth: 3,
		borderColor: '#ffffff',
		shadowColor: '#000000',
		shadowOpacity: 0.3,
		shadowRadius: 3,
		shadowOffset: {
			width: 0,
			height: 1,
		},
		elevation: 5,
	},

	destinationMarker: {
		width: 46,
		height: 46,
		borderRadius: 999,
		backgroundColor: '#dc2626',
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 4,
		borderColor: '#ffffff',
		shadowColor: '#000000',
		shadowOpacity: 0.35,
		shadowRadius: 5,
		shadowOffset: {
			width: 0,
			height: 3,
		},
		elevation: 8,
	},

	destinationSpecies: {
		width: 48,
		height: 48,
		borderRadius: 999,
		backgroundColor: '#dc2626',
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 4,
		borderColor: '#ffffff',
		shadowColor: '#000000',
		shadowOpacity: 0.35,
		shadowRadius: 5,
		shadowOffset: {
			width: 0,
			height: 3,
		},
		elevation: 8,
	},

	destinationIcon: {
		fontSize: 20,
	},

	bottomCard: {
		position: 'absolute',
		left: 12,
		right: 12,
		bottom: 15,
		backgroundColor: 'rgba(255,255,255,0.98)',
		borderRadius: 22,
		padding: 16,
		shadowColor: '#000000',
		shadowOpacity: 0.18,
		shadowRadius: 12,
		shadowOffset: {
			width: 0,
			height: 5,
		},
		elevation: 8,
	},

	bottomCardHeader: {
		flexDirection: 'row',
		alignItems: 'center',
	},

	itemIcon: {
		width: 42,
		height: 42,
		borderRadius: 999,
		backgroundColor: '#f1f5f9',
		alignItems: 'center',
		justifyContent: 'center',
	},

	itemTextContainer: {
		flex: 1,
		marginLeft: 10,
	},

	itemTitle: {
		fontSize: 16,
		fontWeight: '800',
		color: '#0f172a',
	},

	itemType: {
		marginTop: 2,
		fontSize: 11,
		color: '#64748b',
	},

	scientificName: {
		marginTop: 8,
		fontSize: 12,
		fontStyle: 'italic',
		color: '#64748b',
	},

	closeButton: {
		width: 34,
		height: 34,
		borderRadius: 999,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#f1f5f9',
	},

	closeButtonText: {
		fontSize: 23,
		lineHeight: 25,
		color: '#475569',
	},

	itemDescription: {
		marginTop: 12,
		fontSize: 13,
		lineHeight: 19,
		color: '#475569',
	},

	actionRow: {
		marginTop: 14,
	},

	howToButton: {
		minHeight: 46,
		borderRadius: 999,
		backgroundColor: '#16a34a',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 18,
	},

	howToButtonDisabled: {
		backgroundColor: '#94a3b8',
	},

	howToIcon: {
		fontSize: 18,
		color: '#ffffff',
		marginRight: 8,
	},

	howToButtonText: {
		fontSize: 14,
		fontWeight: '800',
		color: '#ffffff',
	},

	outsideZooText: {
		marginTop: 10,
		fontSize: 11,
		lineHeight: 17,
		color: '#b45309',
	},

	routeInfo: {
		marginTop: 14,
		paddingTop: 13,
		borderTopWidth: 1,
		borderTopColor: '#e2e8f0',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 10,
	},

	routeLabel: {
		fontSize: 11,
		color: '#64748b',
	},

	routeDistance: {
		marginTop: 2,
		fontSize: 17,
		fontWeight: '800',
		color: '#dc2626',
	},

	routeTimeBox: {
		alignItems: 'center',
	},

	routeTime: {
		fontSize: 13,
		fontWeight: '800',
		color: '#0f172a',
	},

	routeTimeLabel: {
		fontSize: 9,
		color: '#64748b',
	},

	routeButton: {
		backgroundColor: '#0f172a',
		borderRadius: 999,
		paddingHorizontal: 15,
		paddingVertical: 10,
	},

	routeButtonText: {
		fontSize: 11,
		fontWeight: '700',
		color: '#ffffff',
	},

	routeHint: {
		marginTop: 10,
		fontSize: 11,
		lineHeight: 17,
		color: '#64748b',
	},

	noRouteText: {
		marginTop: 12,
		fontSize: 12,
		lineHeight: 18,
		color: '#64748b',
	},

	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(15,23,42,0.45)',
		justifyContent: 'flex-end',
	},

	modalContainer: {
		backgroundColor: '#ffffff',
		borderTopLeftRadius: 28,
		borderTopRightRadius: 28,
		maxHeight: '75%',
		paddingBottom: 25,
	},

	modalHeader: {
		paddingHorizontal: 20,
		paddingTop: 20,
		paddingBottom: 14,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		borderBottomWidth: 1,
		borderBottomColor: '#f1f5f9',
	},

	modalTitle: {
		fontSize: 20,
		fontWeight: '800',
		color: '#0f172a',
	},

	modalSubtitle: {
		marginTop: 3,
		fontSize: 12,
		color: '#64748b',
	},

	modalCloseButton: {
		width: 38,
		height: 38,
		borderRadius: 999,
		backgroundColor: '#f1f5f9',
		alignItems: 'center',
		justifyContent: 'center',
	},

	modalCloseText: {
		fontSize: 25,
		lineHeight: 27,
		color: '#475569',
	},

	zoneList: {
		paddingHorizontal: 14,
		paddingTop: 8,
	},

	zoneOption: {
		minHeight: 62,
		borderRadius: 18,
		paddingHorizontal: 12,
		marginVertical: 5,
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#e2e8f0',
		backgroundColor: '#ffffff',
	},

	zoneOptionActive: {
		borderColor: '#86efac',
		backgroundColor: '#f0fdf4',
	},

	zoneOptionIcon: {
		width: 44,
		height: 44,
		borderRadius: 999,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#f1f5f9',
	},

	zoneOptionIconActive: {
		backgroundColor: '#dcfce7',
	},

	zoneOptionText: {
		flex: 1,
		marginLeft: 11,
	},

	zoneOptionTitle: {
		fontSize: 15,
		fontWeight: '700',
		color: '#0f172a',
	},

	zoneOptionTitleActive: {
		color: '#15803d',
	},

	checkCircle: {
		width: 28,
		height: 28,
		borderRadius: 999,
		backgroundColor: '#16a34a',
		alignItems: 'center',
		justifyContent: 'center',
	},

	checkText: {
		color: '#ffffff',
		fontSize: 15,
		fontWeight: '800',
	},
})
