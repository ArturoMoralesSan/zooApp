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
	ImageBackground,
	NativeScrollEvent,
	NativeSyntheticEvent,
	Pressable,
	RefreshControl,
	ScrollView,
	Text,
	View,
} from 'react-native'

const { width: screenWidth } = Dimensions.get('window')

/* -------------------------------------------------------------------------- */
/*                                   LAYOUT                                   */
/* -------------------------------------------------------------------------- */

const horizontalPadding = 20
const carouselGap = 12
const eventCardWidth = screenWidth - horizontalPadding * 2 - 28

/* -------------------------------------------------------------------------- */
/*                                   COLORS                                   */
/* -------------------------------------------------------------------------- */

const colors = {
	// Background
	background: '#F7F9F8',

	// Primary
	primary: '#075C3B',
	primaryLight: '#16845D',

	// Cards
	card: '#DDF5EA',
	cardLight: '#E8F7F0',
	active: '#BDEED9',

	// Text
	text: '#17372C',
	textSecondary: '#557067',

	// Borders
	border: '#B8E6D3',

	// Base
	white: '#FFFFFF',

	// Accent colors
	blue: '#48C6D1',
	coral: '#D95C4F',
	gold: '#E8B84A',

	// Error
	errorBackground: '#FFF3F1',
	errorBorder: '#F3D5D0',
	errorText: '#8C4037',

	// Map icon
	mapBackground: '#F8E1DE',
	mapBorder: '#EFC2BC',

	// Event overlay
	eventOverlay: 'rgba(7, 92, 59, 0.82)',
}

/* -------------------------------------------------------------------------- */
/*                                   SHADOW                                   */
/* -------------------------------------------------------------------------- */

const cardShadow = {
	shadowColor: '#075C3B',
	shadowOffset: {
		width: 0,
		height: 5,
	},
	shadowOpacity: 0.12,
	shadowRadius: 10,
	elevation: 4,
}

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                                  COMPONENT                                 */
/* -------------------------------------------------------------------------- */

export default function Explorar() {
	const [events, setEvents] = useState<ExploreEvent[]>([])
	const [loading, setLoading] = useState(true)
	const [refreshing, setRefreshing] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [activeEventIndex, setActiveEventIndex] = useState(0)

	/* ---------------------------------------------------------------------- */
	/*                              LOAD EXPLORE                              */
	/* ---------------------------------------------------------------------- */

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

	/* ---------------------------------------------------------------------- */
	/*                                  EFFECT                                */
	/* ---------------------------------------------------------------------- */

	useEffect(() => {
		void loadExplore()
	}, [loadExplore])

	/* ---------------------------------------------------------------------- */
	/*                                 REFRESH                                */
	/* ---------------------------------------------------------------------- */

	const handleRefresh = () => {
		setRefreshing(true)
		void loadExplore()
	}

	/* ---------------------------------------------------------------------- */
	/*                            CAROUSEL SCROLL                             */
	/* ---------------------------------------------------------------------- */

	const handleCarouselScroll = (
		event: NativeSyntheticEvent<NativeScrollEvent>,
	) => {
		const offsetX = event.nativeEvent.contentOffset.x

		const index = Math.round(offsetX / (eventCardWidth + carouselGap))

		if (index >= 0 && index < events.length && index !== activeEventIndex) {
			setActiveEventIndex(index)
		}
	}

	/* ---------------------------------------------------------------------- */
	/*                                  RETURN                                */
	/* ---------------------------------------------------------------------- */

	return (
		<ImageBackground
			source={require('@/assets/images/zoo-pattern.png')}
			className='flex-1'
			resizeMode='repeat'
			imageStyle={{
				opacity: 0.3,
			}}
			style={{
				backgroundColor: colors.background,
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
						tintColor={colors.primary}
						colors={[colors.primary]}
					/>
				}
			>
				{/* ========================================================== */}
				{/*                             HEADER                         */}
				{/* ========================================================== */}

				<View>
					<Text
						className='text-3xl font-bold'
						style={{
							color: colors.primary,
						}}
					>
						Explorar
					</Text>

					<Text
						className='mt-2 text-base'
						style={{
							color: colors.textSecondary,
						}}
					>
						Descubre todo lo que ZooApp tiene para ti.
					</Text>
				</View>

				{/* ========================================================== */}
				{/*                        EVENTOS DESTACADOS                   */}
				{/* ========================================================== */}

				<View className='mt-7'>
					<Text
						className='mb-4 text-xl font-bold'
						style={{
							color: colors.text,
						}}
					>
						Eventos destacados
					</Text>

					{/* ------------------------------------------------------ */}
					{/*                            LOADING                     */}
					{/* ------------------------------------------------------ */}

					{loading ? (
						<View
							className='h-60 items-center justify-center overflow-hidden rounded-[28px]'
							style={{
								backgroundColor: colors.cardLight,
								borderWidth: 1,
								borderColor: colors.border,
								...cardShadow,
							}}
						>
							<ActivityIndicator size='large' color={colors.primary} />

							<Text
								className='mt-3 text-sm'
								style={{
									color: colors.textSecondary,
								}}
							>
								Cargando eventos...
							</Text>
						</View>
					) : error ? (
						/* -------------------------------------------------- */
						/*                             ERROR                    */
						/* -------------------------------------------------- */

						<View
							className='rounded-[28px] p-5'
							style={{
								backgroundColor: colors.errorBackground,
								borderWidth: 1,
								borderColor: colors.errorBorder,
							}}
						>
							<Text
								className='text-base font-bold'
								style={{
									color: colors.text,
								}}
							>
								No pudimos cargar los eventos
							</Text>

							<Text
								className='mt-2 text-sm leading-5'
								style={{
									color: colors.textSecondary,
								}}
							>
								{error}
							</Text>

							<Pressable
								className='mt-4 self-start overflow-hidden rounded-[18px]'
								onPress={() => {
									setLoading(true)
									void loadExplore()
								}}
								style={({ pressed }) => ({
									backgroundColor: pressed
										? colors.primaryLight
										: colors.primary,
									transform: [
										{
											scale: pressed ? 0.98 : 1,
										},
									],
								})}
							>
								<View className='px-5 py-3'>
									<Text
										className='font-bold'
										style={{
											color: colors.white,
										}}
									>
										Reintentar
									</Text>
								</View>
							</Pressable>
						</View>
					) : events.length === 0 ? (
						/* -------------------------------------------------- */
						/*                       SIN EVENTOS                    */
						/* -------------------------------------------------- */

						<View
							className='rounded-[28px] p-6'
							style={{
								backgroundColor: colors.cardLight,
								borderWidth: 1,
								borderColor: colors.border,
								...cardShadow,
							}}
						>
							<Text
								className='text-center text-base font-bold'
								style={{
									color: colors.text,
								}}
							>
								No hay eventos destacados
							</Text>

							<Text
								className='mt-2 text-center text-sm leading-5'
								style={{
									color: colors.textSecondary,
								}}
							>
								Pronto tendremos nuevas actividades para ti.
							</Text>
						</View>
					) : (
						<View>
							{/* ------------------------------------------------ */}
							{/*                       CAROUSEL                    */}
							{/* ------------------------------------------------ */}

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
												className='overflow-hidden rounded-[28px]'
												style={{
													backgroundColor: colors.cardLight,
													borderWidth: 1,
													borderColor: colors.border,
													...cardShadow,
												}}
											>
												<Pressable
													className='overflow-hidden rounded-[28px]'
													onPress={() =>
														Alert.alert(
															event.name,
															event.description ||
																'Consulta próximamente todos los detalles de este evento.',
														)
													}
													style={({ pressed }) => ({
														backgroundColor: colors.cardLight,
														opacity: pressed ? 0.96 : 1,
														transform: [
															{
																scale: pressed ? 0.995 : 1,
															},
														],
													})}
												>
													<View className='relative h-60'>
														{/* Imagen */}
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
																	backgroundColor: colors.active,
																}}
															>
																<Text
																	className='text-6xl font-bold'
																	style={{
																		color: colors.primary,
																	}}
																>
																	Z
																</Text>
															</View>
														)}

														{/* Overlay */}
														<View
															className='absolute inset-x-0 bottom-0 h-32'
															style={{
																backgroundColor: colors.eventOverlay,
															}}
														/>

														{/* Etiqueta */}
														<View
															className='absolute left-4 top-3 rounded-full px-4 py-2'
															style={{
																backgroundColor: colors.primary,
															}}
														>
															<Text
																className='text-xs font-bold uppercase tracking-wide'
																style={{
																	color: colors.white,
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
																	color: colors.white,
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
																		color: colors.white,
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
																		color: colors.white,
																	}}
																>
																	{formatEventTime(event.start_at)}
																</Text>

																<View
																	className='ml-2 h-7 w-7 items-center justify-center rounded-full'
																	style={{
																		backgroundColor: 'rgba(189,238,217,0.22)',
																		borderWidth: 1,
																		borderColor: 'rgba(255,255,255,0.16)',
																	}}
																>
																	<HugeiconsIcon
																		icon={ArrowRight01Icon}
																		size={15}
																		strokeWidth={1.8}
																		color={colors.white}
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

							{/* ------------------------------------------------ */}
							{/*                     INDICADORES                   */}
							{/* ------------------------------------------------ */}

							{events.length > 1 && (
								<View className='mt-4 flex-row items-center justify-center'>
									{events.map((event, index) => (
										<View
											key={event.id}
											className='ml-1.5 h-2 rounded-full'
											style={{
												width: index === activeEventIndex ? 20 : 8,
												backgroundColor:
													index === activeEventIndex
														? colors.primary
														: colors.border,
											}}
										/>
									))}
								</View>
							)}
						</View>
					)}
				</View>

				{/* ========================================================== */}
				{/*                         ACCIONES                            */}
				{/* ========================================================== */}

				<View className='mt-8'>
					<Text
						className='mb-4 text-xl font-bold'
						style={{
							color: colors.text,
						}}
					>
						¿Qué quieres hacer?
					</Text>

					<View className='flex-row'>
						{/* ================================================== */}
						{/*                         BOLETOS                    */}
						{/* ================================================== */}

						<View
							className='mr-2 flex-1 overflow-hidden rounded-[28px]'
							style={{
								backgroundColor: colors.card,
								borderWidth: 1,
								borderColor: colors.border,
								...cardShadow,
							}}
						>
							<Pressable
								onPress={() => router.push('/tickets')}
								className='rounded-[28px] p-5'
								style={({ pressed }) => ({
									backgroundColor: colors.card,
									opacity: pressed ? 0.96 : 1,
									transform: [
										{
											scale: pressed ? 0.99 : 1,
										},
									],
								})}
							>
								<View
									className='h-12 w-12 items-center justify-center rounded-[16px]'
									style={{
										backgroundColor: colors.active,
										borderWidth: 1,
										borderColor: colors.border,
									}}
								>
									<HugeiconsIcon
										icon={Ticket01Icon}
										size={25}
										strokeWidth={1.8}
										color={colors.primary}
									/>
								</View>

								<Text
									className='mt-4 text-base font-bold'
									style={{
										color: colors.text,
									}}
								>
									Comprar boletos
								</Text>

								<Text
									className='mt-1 text-sm leading-5'
									style={{
										color: colors.textSecondary,
									}}
								>
									Planea tu visita
								</Text>
							</Pressable>
						</View>

						{/* ================================================== */}
						{/*                        ESPECIES                    */}
						{/* ================================================== */}

						<View
							className='ml-2 flex-1 overflow-hidden rounded-[28px]'
							style={{
								backgroundColor: colors.card,
								borderWidth: 1,
								borderColor: colors.border,
								...cardShadow,
							}}
						>
							<Pressable
								onPress={() => router.push('/species')}
								className='rounded-[28px] p-5'
								style={({ pressed }) => ({
									backgroundColor: colors.card,
									opacity: pressed ? 0.96 : 1,
									transform: [
										{
											scale: pressed ? 0.99 : 1,
										},
									],
								})}
							>
								<View
									className='h-12 w-12 items-center justify-center rounded-[16px]'
									style={{
										backgroundColor: colors.active,
										borderWidth: 1,
										borderColor: colors.border,
									}}
								>
									<HugeiconsIcon
										icon={UserGroupIcon}
										size={25}
										strokeWidth={1.8}
										color={colors.primary}
									/>
								</View>

								<Text
									className='mt-4 text-base font-bold'
									style={{
										color: colors.text,
									}}
								>
									Conoce las especies
								</Text>

								<Text
									className='mt-1 text-sm leading-5'
									style={{
										color: colors.textSecondary,
									}}
								>
									Descubre nuestros animales
								</Text>
							</Pressable>
						</View>
					</View>
				</View>

				{/* ========================================================== */}
				{/*                             MAPA                           */}
				{/* ========================================================== */}

				<View
					className='mt-4 overflow-hidden rounded-[28px]'
					style={{
						backgroundColor: colors.cardLight,
						borderWidth: 1,
						borderColor: colors.border,
						...cardShadow,
					}}
				>
					<Pressable
						onPress={() => router.push('/map')}
						className='rounded-[28px] p-5'
						style={({ pressed }) => ({
							backgroundColor: colors.cardLight,
							opacity: pressed ? 0.96 : 1,
							transform: [
								{
									scale: pressed ? 0.99 : 1,
								},
							],
						})}
					>
						<View className='flex-row items-center'>
							{/* Icono mapa */}
							<View
								className='h-12 w-12 items-center justify-center rounded-[16px]'
								style={{
									backgroundColor: colors.mapBackground,
									borderWidth: 1,
									borderColor: colors.mapBorder,
								}}
							>
								<HugeiconsIcon
									icon={Location01Icon}
									size={25}
									strokeWidth={1.8}
									color={colors.coral}
								/>
							</View>

							{/* Información */}
							<View className='ml-4 flex-1'>
								<Text
									className='text-base font-bold'
									style={{
										color: colors.text,
									}}
								>
									Mapa del zoológico
								</Text>

								<Text
									className='mt-1 text-sm leading-5'
									style={{
										color: colors.textSecondary,
									}}
								>
									Explora caminos, especies y puntos de interés.
								</Text>
							</View>

							{/* Flecha */}
							<HugeiconsIcon
								icon={ArrowRight01Icon}
								size={22}
								strokeWidth={1.8}
								color='#7DA996'
							/>
						</View>
					</Pressable>
				</View>
			</ScrollView>
		</ImageBackground>
	)
}
