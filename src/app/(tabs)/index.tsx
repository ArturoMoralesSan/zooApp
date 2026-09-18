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

const cardShadow = {
	shadowColor: '#000000',
	shadowOffset: {
		width: 0,
		height: 5,
	},
	shadowOpacity: 0.18,
	shadowRadius: 8,
	elevation: 1,
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
		<View
			className='flex-1'
			style={{
				backgroundColor: '#F7F8F3',
			}}
		>
			<ScrollView
				className='flex-1'
				contentContainerStyle={{
					paddingHorizontal: horizontalPadding,
					paddingTop: 55,
					paddingBottom: 120,
				}}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={handleRefresh}
						tintColor='#087A5A'
						colors={['#087A5A']}
					/>
				}
			>
				{/* Encabezado */}
				<View>
					<Text
						className='text-3xl font-bold'
						style={{
							color: '#123C32',
						}}
					>
						Explorar
					</Text>

					<Text
						className='mt-2 text-base'
						style={{
							color: '#6F8A7D',
						}}
					>
						Descubre todo lo que ZooApp tiene para ti.
					</Text>
				</View>

				{/* Eventos destacados */}
				<View className='mt-7'>
					<Text
						className='mb-4 text-xl font-bold'
						style={{
							color: '#123C32',
						}}
					>
						Eventos destacados
					</Text>

					{loading ? (
						<View
							className='h-60 items-center justify-center overflow-hidden rounded-3xl'
							style={{
								backgroundColor: '#F7F7EE',
								...cardShadow,
							}}
						>
							<ActivityIndicator size='large' color='#087A5A' />

							<Text
								className='mt-3 text-sm'
								style={{
									color: '#6F8A7D',
								}}
							>
								Cargando eventos...
							</Text>
						</View>
					) : error ? (
						<View
							className='rounded-3xl p-5'
							style={{
								backgroundColor: '#FFF1F0',
								borderWidth: 1,
								borderColor: '#FFE3E1',
							}}
						>
							<Text
								className='text-base font-bold'
								style={{
									color: '#123C32',
								}}
							>
								No pudimos cargar los eventos
							</Text>

							<Text
								className='mt-2 text-sm leading-5'
								style={{
									color: '#6F8A7D',
								}}
							>
								{error}
							</Text>

							<Pressable
								className='mt-4 self-start overflow-hidden rounded-2xl'
								onPress={() => {
									setLoading(true)
									void loadExplore()
								}}
								style={({ pressed }) => ({
									backgroundColor: pressed ? '#064D36' : '#087A5A',
								})}
							>
								<View className='px-5 py-3'>
									<Text
										className='font-bold'
										style={{
											color: '#FFFFFF',
										}}
									>
										Reintentar
									</Text>
								</View>
							</Pressable>
						</View>
					) : events.length === 0 ? (
						<View
							className='rounded-3xl p-6'
							style={{
								backgroundColor: '#F7F7EE',
								...cardShadow,
							}}
						>
							<Text
								className='text-center text-base font-bold'
								style={{
									color: '#123C32',
								}}
							>
								No hay eventos destacados
							</Text>

							<Text
								className='mt-2 text-center text-sm leading-5'
								style={{
									color: '#6F8A7D',
								}}
							>
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
											<View
												className='overflow-hidden rounded-3xl'
												style={{
													backgroundColor: '#F7F7EE',
													...cardShadow,
												}}
											>
												<Pressable
													className='overflow-hidden rounded-3xl'
													onPress={() =>
														Alert.alert(
															event.name,
															event.description ||
																'Consulta próximamente todos los detalles de este evento.',
														)
													}
													style={({ pressed }) => ({
														backgroundColor: '#F7F7EE',
														opacity: pressed ? 0.94 : 1,
													})}
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
															<View
																className='h-full w-full items-center justify-center'
																style={{
																	backgroundColor: '#DCEFE5',
																}}
															>
																<Text
																	className='text-6xl font-bold'
																	style={{
																		color: '#087A5A',
																	}}
																>
																	Z
																</Text>
															</View>
														)}

														{/* Degradado */}
														<View
															className='absolute inset-x-0 bottom-0 h-28'
															style={{
																backgroundColor: 'rgba(6,77,54,0.78)',
															}}
														/>

														{/* Etiqueta */}
														<View
															className='absolute left-4 top-2 rounded-2xl px-3 py-1.5'
															style={{
																backgroundColor: '#087A5A',
															}}
														>
															<Text
																className='text-xs font-bold uppercase tracking-wide'
																style={{
																	color: '#FFFFFF',
																}}
															>
																{event.type || 'Destacado'}
															</Text>
														</View>

														{/* Información */}
														<View className='absolute bottom-4 left-4 right-4'>
															<Text
																className='text-2xl font-bold'
																style={{
																	color: '#FFFFFF',
																}}
																numberOfLines={1}
															>
																{event.name}
															</Text>

															{event.description ? (
																<Text
																	className='mt-1 text-sm font-medium'
																	style={{
																		color: 'rgba(255,255,255,0.88)',
																	}}
																	numberOfLines={2}
																>
																	{event.description}
																</Text>
															) : null}

															<View className='mt-3 flex-row items-center'>
																<Text
																	className='text-sm font-semibold'
																	style={{
																		color: '#FFFFFF',
																	}}
																>
																	{formatEventDate(event.start_at)}
																</Text>

																<Text
																	className='mx-2'
																	style={{
																		color: 'rgba(255,255,255,0.65)',
																	}}
																>
																	•
																</Text>

																<Text
																	className='text-sm font-semibold'
																	style={{
																		color: '#FFFFFF',
																	}}
																>
																	{formatEventTime(event.start_at)}
																</Text>

																<View
																	className='ml-2 h-7 w-7 items-center justify-center rounded-full'
																	style={{
																		backgroundColor: 'rgba(255,255,255,0.15)',
																	}}
																>
																	<HugeiconsIcon
																		icon={ArrowRight01Icon}
																		size={15}
																		strokeWidth={1.8}
																		color='#FFFFFF'
																	/>
																</View>
															</View>
														</View>
													</View>
												</Pressable>
											</View>
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
											className='ml-1.5 h-2 rounded-2xl'
											style={{
												width: index === activeEventIndex ? 20 : 8,
												backgroundColor:
													index === activeEventIndex ? '#087A5A' : '#B8DCCA',
											}}
										/>
									))}
								</View>
							)}
						</View>
					)}
				</View>

				{/* Acciones principales */}
				<View className='mt-8'>
					<Text
						className='mb-4 text-xl font-bold'
						style={{
							color: '#123C32',
						}}
					>
						¿Qué quieres hacer?
					</Text>

					<View className='flex-row'>
						{/* Comprar boletos */}
						<View
							className='mr-2 flex-1 rounded-2xl'
							style={{
								backgroundColor: '#FFFFFF',
								...cardShadow,
							}}
						>
							<Pressable
								onPress={() =>
									Alert.alert(
										'Comprar boletos',
										'Esta sección estará disponible próximamente.',
									)
								}
								className='rounded-2xl p-5'
								style={({ pressed }) => ({
									backgroundColor: '#FFFFFF',
									opacity: pressed ? 0.7 : 1,
								})}
							>
								<View
									className='h-12 w-12 items-center justify-center rounded-xl'
									style={{
										backgroundColor: '#DCEFE5',
									}}
								>
									<HugeiconsIcon
										icon={Ticket01Icon}
										size={25}
										strokeWidth={1.8}
										color='#087A5A'
									/>
								</View>

								<Text
									className='mt-4 text-base font-bold'
									style={{
										color: '#123C32',
									}}
								>
									Comprar boletos
								</Text>

								<Text
									className='mt-1 text-sm leading-5'
									style={{
										color: '#6F8A7D',
									}}
								>
									Planea tu visita
								</Text>
							</Pressable>
						</View>

						{/* Especies */}
						<View
							className='ml-2 flex-1 rounded-2xl'
							style={{
								backgroundColor: '#FFFFFF',
								...cardShadow,
							}}
						>
							<Pressable
								onPress={() => router.push('/species')}
								className='rounded-2xl p-5'
								style={({ pressed }) => ({
									backgroundColor: '#FFFFFF',
									opacity: pressed ? 0.7 : 1,
								})}
							>
								<View
									className='h-12 w-12 items-center justify-center rounded-xl'
									style={{
										backgroundColor: '#DCEFE5',
									}}
								>
									<HugeiconsIcon
										icon={UserGroupIcon}
										size={25}
										strokeWidth={1.8}
										color='#087A5A'
									/>
								</View>

								<Text
									className='mt-4 text-base font-bold'
									style={{
										color: '#123C32',
									}}
								>
									Conoce las especies
								</Text>

								<Text
									className='mt-1 text-sm leading-5'
									style={{
										color: '#6F8A7D',
									}}
								>
									Descubre nuestros animales
								</Text>
							</Pressable>
						</View>
					</View>
				</View>

				{/* Mapa */}
				<View
					className='mt-4 rounded-2xl'
					style={{
						backgroundColor: '#FFFFFF',
						...cardShadow,
					}}
				>
					<Pressable
						onPress={() => router.push('/map')}
						className='rounded-2xl p-5'
						style={({ pressed }) => ({
							backgroundColor: '#FFFFFF',
							opacity: pressed ? 0.7 : 1,
						})}
					>
						<View className='flex-row items-center'>
							<View
								className='h-12 w-12 items-center justify-center rounded-xl'
								style={{
									backgroundColor: '#DCEFE5',
								}}
							>
								<HugeiconsIcon
									icon={Location01Icon}
									size={25}
									strokeWidth={1.8}
									color='#087A5A'
								/>
							</View>

							<View className='ml-4 flex-1'>
								<Text
									className='text-base font-bold'
									style={{
										color: '#123C32',
									}}
								>
									Mapa del zoológico
								</Text>

								<Text
									className='mt-1 text-sm'
									style={{
										color: '#6F8A7D',
									}}
								>
									Explora caminos, especies y puntos de interés.
								</Text>
							</View>

							<HugeiconsIcon
								icon={ArrowRight01Icon}
								size={22}
								strokeWidth={1.8}
								color='#8FB9A8'
							/>
						</View>
					</Pressable>
				</View>
			</ScrollView>
		</View>
	)
}
