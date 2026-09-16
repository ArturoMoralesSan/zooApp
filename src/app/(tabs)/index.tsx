import { api } from '@/services/api'
import { getToken } from '@/services/auth'
import {
	ArrowRight01Icon,
	Location01Icon,
	Ticket01Icon,
	UserGroupIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { router } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	Dimensions,
	Image,
	NativeScrollEvent,
	NativeSyntheticEvent,
	Pressable,
	RefreshControl,
	ScrollView,
	Text,
	View,
} from 'react-native'

const { width: screenWidth } = Dimensions.get('window')

const horizontalPadding = 20
const carouselGap = 12
const eventCardWidth = screenWidth - horizontalPadding * 2 - 28

type ExploreZone = {
	id: number
	name: string
}

type ExploreEvent = {
	id: number
	name: string
	slug: string
	description: string | null
	type: string | null
	start_at: string
	end_at: string | null
	image: string | null
	capacity: number | null
	zone: ExploreZone | null
}

type ExploreResponse = {
	success: boolean
	data: {
		featured_events: ExploreEvent[]
	}
}

function formatEventDate(date: string): string {
	const eventDate = new Date(date)

	if (Number.isNaN(eventDate.getTime())) {
		return ''
	}

	return eventDate.toLocaleDateString('es-MX', {
		day: 'numeric',
		month: 'long',
	})
}

function formatEventTime(date: string): string {
	const eventDate = new Date(date)

	if (Number.isNaN(eventDate.getTime())) {
		return ''
	}

	return eventDate.toLocaleTimeString('es-MX', {
		hour: 'numeric',
		minute: '2-digit',
	})
}

function getEventImageUrl(image: string | null): string | null {
	if (!image) {
		return null
	}

	if (image.startsWith('http://') || image.startsWith('https://')) {
		return image
	}

	return null
}

export default function Explorar() {
	const [events, setEvents] = useState<ExploreEvent[]>([])
	const [loading, setLoading] = useState(true)
	const [refreshing, setRefreshing] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [activeEventIndex, setActiveEventIndex] = useState(0)

	const loadExplore = useCallback(async () => {
		try {
			setError(null)

			const token = await getToken()

			if (!token) {
				router.replace('/login')
				return
			}

			const response = await api<ExploreResponse>('/explore', {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (!response.success) {
				throw new Error('No fue posible cargar la información de Explorar.')
			}

			const featuredEvents = response.data.featured_events ?? []

			setEvents(featuredEvents)
			setActiveEventIndex(0)
		} catch (error) {
			console.error('EXPLORE ERROR:', error)

			setError(
				error instanceof Error
					? error.message
					: 'No fue posible cargar los eventos.',
			)
		} finally {
			setLoading(false)
			setRefreshing(false)
		}
	}, [])

	useEffect(() => {
		void loadExplore()
	}, [loadExplore])

	const handleRefresh = () => {
		setRefreshing(true)
		void loadExplore()
	}

	const handleCarouselScroll = (
		event: NativeSyntheticEvent<NativeScrollEvent>,
	) => {
		const offsetX = event.nativeEvent.contentOffset.x

		const index = Math.round(offsetX / (eventCardWidth + carouselGap))

		if (index >= 0 && index < events.length && index !== activeEventIndex) {
			setActiveEventIndex(index)
		}
	}

	return (
		<View className='flex-1 bg-gray-50'>
			<ScrollView
				className='flex-1'
				contentContainerStyle={{
					paddingHorizontal: horizontalPadding,
					paddingTop: 55,
					paddingBottom: 120,
				}}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
				}
			>
				{/* Encabezado */}
				<View>
					<Text className='text-3xl font-bold text-gray-900'>Explorar</Text>

					<Text className='mt-2 text-base text-gray-500'>
						Descubre todo lo que ZooApp tiene para ti.
					</Text>
				</View>

				{/* Eventos destacados */}
				<View className='mt-7'>
					<Text className='mb-4 text-xl font-bold text-gray-900'>
						Eventos destacados
					</Text>

					{loading ? (
						<View className='h-60 items-center justify-center overflow-hidden rounded-3xl bg-white'>
							<ActivityIndicator size='large' color='#047857' />

							<Text className='mt-3 text-sm text-gray-500'>
								Cargando eventos...
							</Text>
						</View>
					) : error ? (
						<View className='rounded-3xl bg-white p-5'>
							<Text className='text-base font-bold text-gray-900'>
								No pudimos cargar los eventos
							</Text>

							<Text className='mt-2 text-sm leading-5 text-gray-500'>
								{error}
							</Text>

							<Pressable
								className='mt-4 self-start rounded-full bg-emerald-700 px-5 py-3'
								onPress={() => {
									setLoading(true)
									void loadExplore()
								}}
							>
								<Text className='font-bold text-white'>Reintentar</Text>
							</Pressable>
						</View>
					) : events.length === 0 ? (
						<View className='rounded-3xl bg-white p-6'>
							<Text className='text-center text-base font-bold text-gray-900'>
								No hay eventos destacados
							</Text>

							<Text className='mt-2 text-center text-sm leading-5 text-gray-500'>
								Pronto tendremos nuevas actividades para ti.
							</Text>
						</View>
					) : (
						<View>
							{/* Carousel */}
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								decelerationRate='fast'
								snapToInterval={eventCardWidth + carouselGap}
								snapToAlignment='start'
								disableIntervalMomentum
								onMomentumScrollEnd={handleCarouselScroll}
								contentContainerStyle={{
									paddingRight: 8,
								}}
							>
								{events.map((event, index) => {
									const imageUrl = getEventImageUrl(event.image)

									return (
										<View
											key={event.id}
											style={{
												width: eventCardWidth,
												marginRight:
													index === events.length - 1 ? 0 : carouselGap,
											}}
										>
											<Pressable
												className='overflow-hidden rounded-3xl bg-white'
												style={({ pressed }) => ({
													opacity: pressed ? 0.92 : 1,
												})}
												onPress={() =>
													Alert.alert(
														event.name,
														event.description ||
															'Consulta próximamente todos los detalles de este evento.',
													)
												}
											>
												<View className='relative h-60'>
													{imageUrl ? (
														<Image
															source={{
																uri: imageUrl,
															}}
															className='h-full w-full'
															resizeMode='cover'
														/>
													) : (
														<View className='h-full w-full items-center justify-center bg-emerald-100'>
															<Text className='text-6xl font-bold text-emerald-700'>
																Z
															</Text>
														</View>
													)}

													{/* Degradado */}
													<View
														className='absolute inset-x-0 bottom-0 h-40'
														style={{
															backgroundColor: 'rgba(0,0,0,0.48)',
														}}
													/>

													{/* Etiqueta */}
													<View className='absolute left-4 top-4 rounded-full bg-emerald-600 px-3 py-1.5'>
														<Text className='text-xs font-bold uppercase tracking-wide text-white'>
															{event.type || 'Destacado'}
														</Text>
													</View>

													{/* Información */}
													<View className='absolute bottom-4 left-4 right-4'>
														<Text
															className='text-2xl font-bold text-white'
															numberOfLines={1}
														>
															{event.name}
														</Text>

														{event.description ? (
															<Text
																className='mt-1 text-sm font-medium text-white/90'
																numberOfLines={2}
															>
																{event.description}
															</Text>
														) : null}

														<View className='mt-3 flex-row items-center'>
															<Text className='text-sm font-semibold text-white'>
																{formatEventDate(event.start_at)}
															</Text>

															<Text className='mx-2 text-white/60'>•</Text>

															<Text className='text-sm font-semibold text-white'>
																{formatEventTime(event.start_at)}
															</Text>

															<View className='ml-2'>
																<HugeiconsIcon
																	icon={ArrowRight01Icon}
																	size={16}
																	color='#ffffff'
																/>
															</View>
														</View>
													</View>
												</View>
											</Pressable>
										</View>
									)
								})}
							</ScrollView>

							{/* Indicadores */}
							{events.length > 1 && (
								<View className='mt-4 flex-row items-center justify-center'>
									{events.map((event, index) => (
										<View
											key={event.id}
											className={
												index === activeEventIndex
													? 'ml-1.5 h-2 w-5 rounded-full bg-emerald-700'
													: 'ml-1.5 h-2 w-2 rounded-full bg-gray-300'
											}
										/>
									))}
								</View>
							)}
						</View>
					)}
				</View>

				{/* Acciones principales */}
				<View className='mt-8'>
					<Text className='mb-4 text-xl font-bold text-gray-900'>
						¿Qué quieres hacer?
					</Text>

					<View className='flex-row'>
						{/* Comprar boletos */}
						<Pressable
							onPress={() =>
								Alert.alert(
									'Comprar boletos',
									'Esta sección estará disponible próximamente.',
								)
							}
							className='mr-2 flex-1 rounded-2xl bg-white p-5'
							style={({ pressed }) => ({
								opacity: pressed ? 0.7 : 1,
							})}
						>
							<View className='h-12 w-12 items-center justify-center rounded-xl bg-emerald-50'>
								<HugeiconsIcon icon={Ticket01Icon} size={25} color='#047857' />
							</View>

							<Text className='mt-4 text-base font-bold text-gray-900'>
								Comprar boletos
							</Text>

							<Text className='mt-1 text-sm leading-5 text-gray-500'>
								Planea tu visita
							</Text>
						</Pressable>

						{/* Especies */}
						<Pressable
							onPress={() =>
								Alert.alert(
									'Conoce las especies',
									'Esta sección estará disponible próximamente.',
								)
							}
							className='ml-2 flex-1 rounded-2xl bg-white p-5'
							style={({ pressed }) => ({
								opacity: pressed ? 0.7 : 1,
							})}
						>
							<View className='h-12 w-12 items-center justify-center rounded-xl bg-emerald-50'>
								<HugeiconsIcon icon={UserGroupIcon} size={25} color='#047857' />
							</View>

							<Text className='mt-4 text-base font-bold text-gray-900'>
								Conoce las especies
							</Text>

							<Text className='mt-1 text-sm leading-5 text-gray-500'>
								Descubre nuestros animales
							</Text>
						</Pressable>
					</View>
				</View>

				{/* Mapa */}
				<Pressable
					onPress={() => router.push('/map')}
					className='mt-4 rounded-2xl bg-white p-5'
					style={({ pressed }) => ({
						opacity: pressed ? 0.7 : 1,
					})}
				>
					<View className='flex-row items-center'>
						<View className='h-12 w-12 items-center justify-center rounded-xl bg-emerald-50'>
							<HugeiconsIcon icon={Location01Icon} size={25} color='#047857' />
						</View>

						<View className='ml-4 flex-1'>
							<Text className='text-base font-bold text-gray-900'>
								Mapa del zoológico
							</Text>

							<Text className='mt-1 text-sm text-gray-500'>
								Explora caminos, especies y puntos de interés.
							</Text>
						</View>

						<HugeiconsIcon icon={ArrowRight01Icon} size={22} color='#9ca3af' />
					</View>
				</Pressable>
			</ScrollView>
		</View>
	)
}
