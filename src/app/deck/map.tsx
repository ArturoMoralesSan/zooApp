import { Camera, Map as MapView } from '@maplibre/maplibre-react-native'
import * as Location from 'expo-location'
import { router, useFocusEffect } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Linking, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { MapControls } from '@/components/map/MapControls'
import { MapLayers } from '@/components/map/MapLayers'
import { UserLocationMarker } from '@/components/map/UserLocationMarker'
import BackButton from '@/components/ui/BackButton'
import { QueryView } from '@/components/ui/QueryView'
import { TextLink } from '@/components/ui/TextLink'
import { DuelMapHeader } from '@/components/zoodeck/DuelMapHeader'
import { DuelMarker } from '@/components/zoodeck/DuelMarker'
import { DuelSheet } from '@/components/zoodeck/DuelSheet'
import { DuelSpeciesCard } from '@/components/zoodeck/DuelSpeciesCard'
import { VisitNotice } from '@/components/zoodeck/VisitNotice'
import { useMapCamera } from '@/hooks/useMapCamera'
import { useMapFeatures } from '@/hooks/useMapFeatures'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { useRoute } from '@/hooks/useRoute'
import { useSessionRedirect } from '@/hooks/useSessionRedirect'
import { useUserLocation } from '@/hooks/useUserLocation'
import { useZooDeckMap } from '@/hooks/useZooDeckMap'
import { notifyOffline } from '@/services/offline-notice'
import type { SelectableItem, Zone } from '@/types/map'
import {
	haversineDistance,
	normalizeZoneGeometry,
	pointInGeometry,
} from '@/utils/map'
import { duelCardOf, zoneNamesByItem } from '@/utils/zoodeck'
import { ZOODECK_VISIT_CHECKS } from '@/utils/zoodeckDebug'

const NO_ZONES: Zone[] = []

// A-17 Duelos: the zoo map with only the animals that can be challenged
// (active card, questions and a usable QR), each with its card's state.
export default function ZooDeckMapScreen() {
	const { userLocation, locating, retry } = useUserLocation()
	const zoodeck = useZooDeckMap(userLocation)
	const { isOffline } = useNetworkStatus()

	const zones = zoodeck.data?.zones ?? NO_ZONES
	const visit = zoodeck.data?.visit ?? null

	const { zonesGeoJson, mapImages, pathsGeoJson, selectableItems } =
		useMapFeatures(zones)
	const { route, setRoute, calculateRoute, routeGeoJson } = useRoute(zones)
	const [sheetHeight, setSheetHeight] = useState(0)
	const camera = useMapCamera(userLocation, {
		bottomInset: sheetHeight,
		centerOnUser: false,
	})

	const [selectedId, setSelectedId] = useState<string | null>(null)

	useSessionRedirect()

	// Back from a duel, a ticket purchase or the settings: states may have
	// changed. The first focus is the initial load.
	const { refresh } = zoodeck
	const focusedBefore = useRef(false)

	useFocusEffect(
		useCallback(() => {
			if (focusedBefore.current) void refresh()
			focusedBefore.current = true
		}, [refresh]),
	)

	const species = useMemo(
		() => selectableItems.filter((item) => item.type === 'species'),
		[selectableItems],
	)
	const zoneNames = useMemo(() => zoneNamesByItem(zones), [zones])

	const distanceTo = (item: SelectableItem) =>
		userLocation ? haversineDistance(userLocation, item.coordinate) : null

	// Until the user picks one: the nearest animal still to win, else the
	// nearest one.
	const nearest = (items: SelectableItem[]) =>
		items.reduce<SelectableItem | null>(
			(best, item) =>
				!best || (distanceTo(item) ?? 0) < (distanceTo(best) ?? 0)
					? item
					: best,
			null,
		)
	const selected =
		species.find((item) => item.id === selectedId) ??
		nearest(
			species.filter(
				(item) => duelCardOf(item.species)?.status === 'available',
			),
		) ??
		nearest(species)
	const selectedCard = duelCardOf(selected?.species)

	const isUserInsideZoo =
		userLocation !== null &&
		zones.some((zone) =>
			pointInGeometry(userLocation, normalizeZoneGeometry(zone.geometry)),
		)

	// First view (A-17): every animal to challenge, plus the user when they're
	// in the zoo. Waits for the sheet's height and the first fix (or no fix).
	const framed = useRef(false)
	const { mapReady, fitTo } = camera

	useEffect(() => {
		if (framed.current || !mapReady || !sheetHeight || locating) return
		if (species.length === 0 && !userLocation) return

		framed.current = true
		fitTo([
			...species.map((item) => item.coordinate),
			...(isUserInsideZoo && userLocation ? [userLocation] : []),
		])
	}, [
		mapReady,
		sheetHeight,
		locating,
		species,
		userLocation,
		isUserInsideZoo,
		fitTo,
	])

	// A location_required from before the first fix (or from the previous
	// key, while the one with coordinates loads) isn't the real answer yet.
	const visitReason =
		ZOODECK_VISIT_CHECKS &&
		visit?.enforced &&
		visit.reason &&
		!(
			visit.reason === 'location_required' &&
			(locating || userLocation !== null)
		)
			? visit.reason
			: null

	// The server answers per card on scan; this only spares a useless trip.
	const canScan = !ZOODECK_VISIT_CHECKS || !visit || visit.can_duel

	const selectItem = (item: SelectableItem) => {
		setSelectedId(item.id)
		setRoute(null)
		camera.flyTo(item.coordinate)
	}

	const howToGetThere = () => {
		if (!selected || !userLocation) return

		const result = calculateRoute(userLocation, selected.coordinate)

		setRoute(result)
		if (result) camera.flyTo(selected.coordinate)
	}

	const allowLocation = async () => {
		const permission = await Location.requestForegroundPermissionsAsync()

		if (permission.granted) {
			retry()
		} else if (!permission.canAskAgain) {
			void Linking.openSettings()
		}
	}

	const scan = () => {
		if (isOffline) {
			notifyOffline()
			return
		}

		router.push('/duel/scan')
	}

	return (
		<QueryView
			query={zoodeck}
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
						ref={camera.mapRef}
						style={{ flex: 1 }}
						mapStyle={{ version: 8, sources: {}, layers: [] }}
						onDidFinishLoadingMap={camera.onMapReady}
					>
						<Camera
							ref={camera.cameraRef}
							initialViewState={camera.initialViewState}
						/>

						<MapLayers
							mapImages={mapImages}
							zonesGeoJson={zonesGeoJson}
							pathsGeoJson={pathsGeoJson}
							routeGeoJson={routeGeoJson}
						/>

						{species.map((item) => (
							<DuelMarker
								key={item.id}
								item={item}
								card={duelCardOf(item.species)}
								selected={item.id === selected?.id}
								onPress={() => selectItem(item)}
							/>
						))}

						{userLocation && <UserLocationMarker userLocation={userLocation} />}
					</MapView>

					<DuelMapHeader onBack={() => router.back()} />

					<MapControls
						className='top-[22%]'
						onLocate={camera.locateUser}
						onZoomIn={() => void camera.zoomBy(1)}
						onZoomOut={() => void camera.zoomBy(-1)}
					/>

					<DuelSheet
						canScan={canScan}
						onOpenDeck={() => router.push('/deck')}
						onScan={scan}
						onLayout={(event) =>
							setSheetHeight(Math.round(event.nativeEvent.layout.height))
						}
					>
						{visitReason && (
							<VisitNotice
								reason={visitReason}
								onAllowLocation={() => void allowLocation()}
								onBuyTicket={() => router.push('/tickets')}
							/>
						)}

						{selected && selectedCard ? (
							<View>
								<DuelSpeciesCard
									item={selected}
									card={selectedCard}
									zoneName={zoneNames[selected.id] ?? null}
									distance={route ? route.distance : distanceTo(selected)}
								/>

								{(isUserInsideZoo || route) && (
									<TextLink
										label={route ? 'Quitar ruta' : 'Cómo llegar'}
										onPress={route ? () => setRoute(null) : howToGetThere}
										className='mt-1 self-start'
									/>
								)}
							</View>
						) : (
							<Text className='text-meta'>
								Aún no hay animales para retar. Vuelve pronto.
							</Text>
						)}
					</DuelSheet>
				</SafeAreaView>
			)}
		</QueryView>
	)
}
