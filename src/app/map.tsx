import { Camera, Map as MapView } from '@maplibre/maplibre-react-native'

import { router } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { View } from 'react-native'

import { SafeAreaView } from 'react-native-safe-area-context'
import type { Coordinate, SelectableItem, Zone } from '@/types/map'
import { CollapsedRouteCard } from '@/components/map/CollapsedRouteCard'
import { DestinationMarker } from '@/components/map/DestinationMarker'
import { LocationBadge } from '@/components/map/LocationBadge'
import { MapControls } from '@/components/map/MapControls'
import { MapHeaderCard } from '@/components/map/MapHeaderCard'
import { MapLayers } from '@/components/map/MapLayers'
import { QueryView } from '@/components/ui/QueryView'
import BackButton from '@/components/ui/BackButton'
import { PoiMarker } from '@/components/map/PoiMarker'
import { RouteCard } from '@/components/map/RouteCard'
import { SpeciesMarker } from '@/components/map/SpeciesMarker'
import { UserLocationMarker } from '@/components/map/UserLocationMarker'
import { useMapData } from '@/hooks/useMapData'
import { useMapFeatures } from '@/hooks/useMapFeatures'
import { useRoute } from '@/hooks/useRoute'
import { useUserLocation } from '@/hooks/useUserLocation'
import {
	DEFAULT_ZOOM,
	normalizeZoneGeometry,
	pointInGeometry,
	USER_ZOOM,
	ZOO_CENTER,
} from '@/utils/map'

const NO_ZONES: Zone[] = []

export default function MapScreen() {
	const mapRef = useRef<any>(null)
	const cameraRef = useRef<any>(null)

	const mapData = useMapData()

	const zones = mapData.data ?? NO_ZONES

	const { userLocation, locationAccuracy } = useUserLocation()

	const [selectedItem, setSelectedItem] = useState<SelectableItem | null>(null)

	const { route, setRoute, calculateRoute, routeGeoJson } = useRoute(zones)

	const [mapReady, setMapReady] = useState(false)

	const [routeCardCollapsed, setRouteCardCollapsed] = useState(false)

	const { zonesGeoJson, mapImages, pathsGeoJson, selectableItems } =
		useMapFeatures(zones)

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

	const zoomBy = async (delta: number) => {
		try {
			const zoom = await mapRef.current?.getZoom()
			if (typeof zoom !== 'number') return

			cameraRef.current?.easeTo({ zoom: zoom + delta, duration: 250 })
		} catch {
			return
		}
	}

	const locateUser = () => {
		try {
			cameraRef.current?.flyTo({
				center: userLocation ?? ZOO_CENTER,
				zoom: userLocation ? USER_ZOOM : DEFAULT_ZOOM,
				duration: 500,
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

	// A failed refetch keeps the cached map; QueryView only shows the states
	// while there's no map yet.
	return (
		<QueryView
			query={mapData}
			loadingMessage='Cargando mapa…'
			errorTitle='No pudimos cargar el mapa'
			wrapper={(state) => (
				<SafeAreaView className='flex-1 bg-screen px-5 pt-2'>
					<BackButton onPress={() => router.back()} position='relative' />
					<View className='flex-1 justify-center'>{state}</View>
				</SafeAreaView>
			)}
		>
			{() => (
				<SafeAreaView
					className='flex-1 bg-screen'
					edges={['top', 'left', 'right']}
				>
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

						<MapLayers
							mapImages={mapImages}
							zonesGeoJson={zonesGeoJson}
							pathsGeoJson={pathsGeoJson}
							routeGeoJson={routeGeoJson}
						/>

						{selectableItems
							.filter((item) => item.type === 'marker')
							.map((item) => (
								<PoiMarker
									key={item.id}
									item={item}
									onPress={() => selectItem(item)}
								/>
							))}

						{selectableItems
							.filter((item) => item.type === 'species')
							.map((item) => (
								<SpeciesMarker
									key={item.id}
									item={item}
									onPress={() => selectItem(item)}
								/>
							))}

						{userLocation && <UserLocationMarker userLocation={userLocation} />}

						{selectedItem && <DestinationMarker selectedItem={selectedItem} />}
					</MapView>

					<MapHeaderCard
						isUserInsideZoo={isUserInsideZoo}
						onBack={() => router.back()}
					/>

					<MapControls
						onLocate={locateUser}
						onZoomIn={() => void zoomBy(1)}
						onZoomOut={() => void zoomBy(-1)}
					/>

					{userLocation && (
						<LocationBadge locationAccuracy={locationAccuracy} />
					)}

					{selectedItem && !routeCardCollapsed && (
						<RouteCard
							selectedItem={selectedItem}
							route={route}
							userLocation={userLocation}
							isUserInsideZoo={isUserInsideZoo}
							onCollapse={() => setRouteCardCollapsed(true)}
							onHowToGetThere={handleHowToGetThere}
							onShowDestination={() =>
								flyToDestination(selectedItem.coordinate, 500)
							}
							onViewSpecies={
								selectedItem.species
									? () => router.push(`/species/${selectedItem.species?.id}`)
									: undefined
							}
						/>
					)}

					{selectedItem && routeCardCollapsed && (
						<CollapsedRouteCard
							selectedItem={selectedItem}
							route={route}
							onExpand={() => setRouteCardCollapsed(false)}
						/>
					)}
				</SafeAreaView>
			)}
		</QueryView>
	)
}
