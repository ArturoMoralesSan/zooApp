import {
	ArrowRight01Icon,
	HeartIcon,
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
	Image,
	NativeScrollEvent,
	NativeSyntheticEvent,
	Pressable,
	RefreshControl,
	ScrollView,
	Text,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import AppCard from '@/components/AppCard'
import UserHeader from '@/components/UserHeader'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/services/api'
import { getToken } from '@/services/auth'

import colors from '@/theme/colors'
import { cardShadow } from '@/theme/shadows'

const PRIMARY = colors.esmeralda
const EVENT_CARD_WIDTH = 292
const CAROUSEL_GAP = 10

// Cambia este valor para personalizar el fondo de la tarjeta de donación.
// Si no se define un color diferente, utiliza el verde predeterminado.
const donationCardBackground = colors.bosque
const donationAccentBackground = colors.lima

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
	const parsedDate = new Date(date)

	if (Number.isNaN(parsedDate.getTime())) {
		return ''
	}

	return parsedDate.toLocaleDateString('es-MX', {
		day: 'numeric',
		month: 'long',
	})
}

function formatEventTime(date: string): string {
	const parsedDate = new Date(date)

	if (Number.isNaN(parsedDate.getTime())) {
		return ''
	}

	return parsedDate.toLocaleTimeString('es-MX', {
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
	const { loading: authLoading, refreshUser } = useAuth()

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

			setEvents(response.data.featured_events ?? [])
			setActiveEventIndex(0)
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: 'No fue posible cargar los eventos.',
			)
		} finally {
			setLoading(false)
			setRefreshing(false)
		}
	}, [])

	useEffect(() => {
		if (!authLoading) {
			void loadExplore()
		}
	}, [authLoading, loadExplore])

	const handleRefresh = async () => {
		setRefreshing(true)

		try {
			await Promise.all([loadExplore(), refreshUser()])
		} finally {
			setRefreshing(false)
		}
	}

	const handleCarouselScroll = (
		event: NativeSyntheticEvent<NativeScrollEvent>,
	) => {
		const offsetX = event.nativeEvent.contentOffset.x
		const index = Math.round(offsetX / (EVENT_CARD_WIDTH + CAROUSEL_GAP))

		if (index >= 0 && index < events.length) {
			setActiveEventIndex(index)
		}
	}

	return (
		<SafeAreaView className='flex-1 bg-blanco' edges={['top']}>
			<ScrollView
				className='flex-1'
				contentContainerClassName='grow px-3 pb-[140px] pt-2'
				showsVerticalScrollIndicator
				nestedScrollEnabled
				bounces
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={handleRefresh}
						tintColor={PRIMARY}
						colors={[PRIMARY]}
					/>
				}
			>
				{/* ENCABEZADO */}
				<UserHeader title='Explorar' />

				{/* EVENTOS DESTACADOS */}
				<View className='mt-[21px]'>
					<Text className='mb-[10.5px] text-[21px] font-extrabold leading-[27px] text-tinta'>
						Eventos destacados
					</Text>

					{loading ? (
						<View className='min-h-[190px] items-center justify-center rounded-3xl border border-card-border bg-niebla'>
							<ActivityIndicator size='large' color={PRIMARY} />
							<Text className='mt-[10.5px] text-[13px] text-tinta-2'>
								Cargando eventos...
							</Text>
						</View>
					) : error ? (
						<View
							className='rounded-[22px] border border-card-border bg-niebla p-[17.5px]'
							style={cardShadow}
						>
							<Text className='text-[16px] font-extrabold leading-[21px] text-tinta'>
								No pudimos cargar los eventos
							</Text>

							<Text className='mt-[7px] text-[13px] leading-[18px] text-tinta-2'>
								{error}
							</Text>

							<Pressable
								className='mt-3.5 self-start rounded-2xl bg-esmeralda px-[17.5px] py-[10.5px] active:opacity-80'
								onPress={() => {
									setLoading(true)
									void loadExplore()
								}}
							>
								<Text className='font-extrabold text-blanco'>Reintentar</Text>
							</Pressable>
						</View>
					) : events.length === 0 ? (
						<View className='rounded-[22px] border border-card-border bg-niebla p-[21px]'>
							<Text className='text-center text-[16px] font-extrabold leading-[21px] text-tinta'>
								No hay eventos destacados
							</Text>

							<Text className='mt-[7px] text-center text-[13px] leading-[18px] text-tinta-2'>
								Pronto tendremos nuevas actividades para ti.
							</Text>
						</View>
					) : (
						<>
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								nestedScrollEnabled
								decelerationRate='fast'
								snapToInterval={EVENT_CARD_WIDTH + CAROUSEL_GAP}
								snapToAlignment='start'
								disableIntervalMomentum
								onMomentumScrollEnd={handleCarouselScroll}
								contentContainerClassName='pr-2'
							>
								{events.map((event, index) => {
									const imageUrl = getEventImageUrl(event.image)

									return (
										<View
											key={event.id}
											className={`w-[292px] ${index === events.length - 1 ? '' : 'mr-2.5'}`}
										>
											<View
												className='h-[203px] overflow-hidden rounded-3xl bg-bosque'
												style={cardShadow}
											>
												<Pressable
													className='flex-1 overflow-hidden rounded-[24px] active:opacity-[0.92]'
													onPress={() =>
														Alert.alert(
															event.name,
															event.description ||
																'Consulta próximamente todos los detalles de este evento.',
														)
													}
												>
													<View className='flex-1'>
														{imageUrl ? (
															<Image
																source={{ uri: imageUrl }}
																className='absolute inset-0 h-full w-full'
																resizeMode='cover'
															/>
														) : (
															<View className='absolute inset-0 bg-tinta-2'>
																<View className='absolute left-0 right-0 top-0 h-[47%] bg-tinta-2' />
															</View>
														)}

														<View className='absolute bottom-0 left-0 right-0 h-[55%] bg-bosque opacity-[0.98]' />

														<View className='absolute left-[10.5px] top-[10.5px] rounded-[20px] bg-lima px-3 py-1'>
															<Text className='text-[10px] font-extrabold tracking-[0.3px] text-bosque'>
																{(event.type || 'Educativo').toUpperCase()}
															</Text>
														</View>

														<View className='absolute bottom-0 left-0 right-0 p-3.5'>
															<View className='flex-row items-end'>
																<View className='flex-1 pr-[7px]'>
																	<Text
																		className='text-[23px] font-extrabold leading-7 text-blanco'
																		numberOfLines={1}
																	>
																		{event.name}
																	</Text>

																	{event.description ? (
																		<Text
																			className='mt-[3.5px] text-[12px] font-semibold leading-[17px] text-blanco'
																			numberOfLines={1}
																		>
																			{event.description}
																		</Text>
																	) : null}
																</View>

																<Pressable
																	accessibilityRole='button'
																	accessibilityLabel={`Ver evento ${event.name}`}
																	onPress={() =>
																		Alert.alert(
																			event.name,
																			event.description ||
																				'Consulta próximamente todos los detalles de este evento.',
																		)
																	}
																	className='h-[31.5px] w-[31.5px] items-center justify-center rounded-full bg-lima'
																>
																	<HugeiconsIcon
																		icon={ArrowRight01Icon}
																		size={22}
																		strokeWidth={2}
																		color={colors.bosque}
																	/>
																</Pressable>
															</View>

															<View className='mt-[10.5px] flex-row items-center'>
																<Text
																	className='text-[12px] font-bold text-blanco'
																	numberOfLines={1}
																>
																	{formatEventDate(event.start_at)}
																</Text>

																<Text className='mx-[7px] font-black text-lima'>
																	•
																</Text>

																<Text className='text-[12px] font-bold text-blanco'>
																	{formatEventTime(event.start_at)}
																</Text>
															</View>
														</View>
													</View>
												</Pressable>
											</View>
										</View>
									)
								})}
							</ScrollView>

							{events.length > 1 && (
								<View className='mt-3 flex-row items-center justify-center gap-1.5'>
									{events.map((event, index) => (
										<View
											key={event.id}
											className={`h-[7px] rounded-[10px] ${index === activeEventIndex ? 'w-[21px] bg-esmeralda' : 'w-[7px] bg-tinta-2 opacity-80'}`}
										/>
									))}
								</View>
							)}
						</>
					)}
				</View>

				{/* ACCIONES */}
				<View className='mt-5'>
					<Text className='mb-[10.5px] text-[21px] font-extrabold leading-[27px] text-tinta'>
						¿Qué quieres hacer?
					</Text>

					{/* BOLETOS Y ESPECIES: DOS COLUMNAS SIN FLECHAS */}
					<View className='mb-3 flex-row items-stretch gap-3'>
						<View className='min-w-0 flex-1'>
							<AppCard
								icon={Ticket01Icon}
								title='Comprar boletos'
								iconPosition='top'
								description='Planea tu visita al zoológico.'
								onPress={() => router.push('/tickets')}
								backgroundColor={colors.niebla}
								borderColor={colors.cardBorder}
								minHeight={130}
								iconColor={PRIMARY}
								showArrow={false}
							/>
						</View>

						<View className='min-w-0 flex-1'>
							<AppCard
								icon={UserGroupIcon}
								iconPosition='top'
								title='Conoce las especies'
								description='Descubre nuestros animales.'
								onPress={() => router.push('/species')}
								backgroundColor={colors.niebla}
								borderColor={colors.cardBorder}
								minHeight={130}
								iconColor={PRIMARY}
								showArrow={false}
							/>
						</View>
					</View>

					{/* MAPA: ANCHO COMPLETO CON FLECHA */}
					<AppCard
						icon={Location01Icon}
						title='Mapa del zoológico'
						description='Explora caminos, especies y puntos de interés.'
						onPress={() => router.push('/map')}
						backgroundColor={colors.niebla}
						borderColor={colors.cardBorder}
						iconColor={PRIMARY}
						showArrow={true}
					/>

					{/* DONACIÓN: FONDO CONFIGURABLE */}
					<AppCard
						title='Apoya al zoológico'
						description='Tu donación ayuda a cuidar y proteger a nuestros animales.'
						icon={HeartIcon}
						onPress={() => router.push('/donations')}
						backgroundColor={donationCardBackground}
						borderColor={colors.cardBorder}
						iconColor={colors.bosque}
						iconBackgroundColor={donationAccentBackground}
						arrowBackgroundColor={donationAccentBackground}
						arrowColor={colors.bosque}
						textColor={colors.blanco}
						descriptionColor={colors.hoja}
						showArrow
					/>
				</View>
			</ScrollView>
		</SafeAreaView>
	)
}
