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
	GraphEdge,
	GraphNode,
	ImageCorners,
	RouteResult,
	SelectableItem,
	Zone,
} from '@/types/map'
import { useMapData } from '@/hooks/useMapData'
import {
	DEFAULT_ZOOM,
	findNearestPathPoint,
	formatDistance,
	formatMinutes,
	haversineDistance,
	isImageIcon,
	normalizeImageBounds,
	normalizeMapImageUrl,
	normalizeMarkerIconUrl,
	normalizePathGraph,
	normalizeSpeciesImageUrl,
	normalizeZoneGeometry,
	pointInGeometry,
	toNumber,
	USER_ZOOM,
	ZOO_CENTER,
} from '@/utils/map'

const mapShadow: ViewStyle = {
	// eslint-disable-next-line no-restricted-syntax -- neutral shadow over the map imagery
	shadowColor: '#000000',
	shadowOffset: { width: 0, height: 5 },
	shadowOpacity: 0.18,
	shadowRadius: 8,
	elevation: 1,
}

const NO_ZONES: Zone[] = []

export default function MapScreen() {
	const mapRef = useRef<any>(null)
	const cameraRef = useRef<any>(null)

	const locationSubscription = useRef<Location.LocationSubscription | null>(
		null,
	)

	const { data, error: mapError, isLoading: loading } = useMapData()

	const zones = data ?? NO_ZONES

	// Before SWR the map loaded once, so an error could only replace an empty
	// map. Keep it that way: a failed background refetch keeps the cached map.
	const error =
		mapError && !data
			? mapError.message || 'No fue posible cargar el mapa.'
			: null

	const [userLocation, setUserLocation] = useState<Coordinate | null>(null)

	const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null)

	const [selectedItem, setSelectedItem] = useState<SelectableItem | null>(null)

	const [route, setRoute] = useState<RouteResult | null>(null)

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
					coordinates: ImageCorners
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

	const isUserInsideZoo =
		userLocation !== null &&
		zones.some((zone) => {
			const geometry = normalizeZoneGeometry(zone.geometry)

			return pointInGeometry(userLocation, geometry)
		})

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
					minzoom={0}
					maxzoom={19}
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
						}}
						layout={{
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
						}}
						layout={{
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
						}}
						layout={{
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
						}}
						layout={{
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
						}}
						layout={{
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
