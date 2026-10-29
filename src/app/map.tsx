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

import { useEffect, useRef, useState } from 'react'

import {
	ActivityIndicator,
	Pressable,
	Text,
	View,
	type ViewStyle,
} from 'react-native'

import { SafeAreaView } from 'react-native-safe-area-context'
import colors from '@/theme/colors'
import type { Coordinate, SelectableItem, Zone } from '@/types/map'
import { useMapData } from '@/hooks/useMapData'
import { useMapFeatures } from '@/hooks/useMapFeatures'
import { useRoute } from '@/hooks/useRoute'
import {
	DEFAULT_ZOOM,
	formatDistance,
	formatMinutes,
	normalizeZoneGeometry,
	pointInGeometry,
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

	const { route, setRoute, calculateRoute, routeGeoJson } = useRoute(zones)

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
