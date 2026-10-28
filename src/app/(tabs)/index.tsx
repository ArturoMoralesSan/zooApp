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

import {
	actionsContainerStyle,
	colors,
	dotStyle,
	dotsContainerStyle,
	errorCardStyle,
	eventCardContainerStyle,
	eventCardStyle,
	eventCardWidth,
	eventDescriptionStyle,
	eventFallbackStyle,
	eventMetaStyle,
	eventOverlayStyle,
	eventPressableStyle,
	eventSeparatorStyle,
	eventTitleStyle,
	eventTypeStyle,
	eventTypeTextStyle,
	loadingCardStyle,
	loadingTextStyle,
	retryButtonStyle,
	screenStyle,
	scrollContentStyle,
	secondaryTextStyle,
	titleTextStyle,
} from '@/styles/explore'

// Cambia este valor para personalizar el fondo de la tarjeta de donación.
// Si no se define un color diferente, utiliza el verde predeterminado.
const donationCardBackground = colors.primaryDark
const donationAccentBackground = colors.primaryLight

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
		const index = Math.round(offsetX / (eventCardWidth + 10))

		if (index >= 0 && index < events.length) {
			setActiveEventIndex(index)
		}
	}

	return (
		<SafeAreaView className='flex-1' edges={['top']} style={screenStyle}>
			<ScrollView
				className='flex-1'
				style={{ flex: 1 }}
				contentContainerStyle={[
					scrollContentStyle,
					{
						flexGrow: 1,
						paddingBottom: 140,
					},
				]}
				showsVerticalScrollIndicator
				nestedScrollEnabled
				bounces
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={handleRefresh}
						tintColor={colors.primary}
						colors={[colors.primary]}
					/>
				}
			>
				{/* ENCABEZADO */}
				<UserHeader title='Explorar' />

				{/* EVENTOS DESTACADOS */}
				<View className='mt-[21px]'>
					<Text
						className='mb-[10.5px]'
						style={{
							color: colors.text,
							fontSize: 21,
							fontWeight: '800',
							lineHeight: 27,
						}}
					>
						Eventos destacados
					</Text>

					{loading ? (
						<View style={loadingCardStyle}>
							<ActivityIndicator size='large' color={colors.primary} />
							<Text className='mt-[10.5px]' style={loadingTextStyle}>
								Cargando eventos...
							</Text>
						</View>
					) : error ? (
						<View className='rounded-[22px] p-[17.5px]' style={errorCardStyle}>
							<Text style={titleTextStyle}>No pudimos cargar los eventos</Text>

							<Text className='mt-[7px]' style={secondaryTextStyle}>
								{error}
							</Text>

							<Pressable
								className='mt-3.5 self-start rounded-full px-[17.5px] py-[10.5px]'
								style={({ pressed }) => retryButtonStyle(pressed)}
								onPress={() => {
									setLoading(true)
									void loadExplore()
								}}
							>
								<Text
									style={{
										color: colors.white,
										fontWeight: '800',
									}}
								>
									Reintentar
								</Text>
							</Pressable>
						</View>
					) : events.length === 0 ? (
						<View
							className='rounded-[22px] p-[21px]'
							style={{
								backgroundColor: colors.cardLight,
								borderColor: colors.border,
								borderWidth: 1,
							}}
						>
							<Text className='text-center' style={titleTextStyle}>
								No hay eventos destacados
							</Text>

							<Text className='mt-[7px] text-center' style={secondaryTextStyle}>
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
								snapToInterval={eventCardWidth + 10}
								snapToAlignment='start'
								disableIntervalMomentum
								onMomentumScrollEnd={handleCarouselScroll}
								contentContainerStyle={{ paddingRight: 8 }}
							>
								{events.map((event, index) => {
									const imageUrl = getEventImageUrl(event.image)

									return (
										<View
											key={event.id}
											style={eventCardContainerStyle(index, events.length)}
										>
											<View style={eventCardStyle}>
												<Pressable
													className='flex-1 overflow-hidden rounded-[24px]'
													onPress={() =>
														Alert.alert(
															event.name,
															event.description ||
																'Consulta próximamente todos los detalles de este evento.',
														)
													}
													style={({ pressed }) => eventPressableStyle(pressed)}
												>
													<View className='flex-1'>
														{imageUrl ? (
															<Image
																source={{ uri: imageUrl }}
																className='absolute inset-0 h-full w-full'
																resizeMode='cover'
															/>
														) : (
															<View
																className='absolute inset-0'
																style={eventFallbackStyle}
															>
																<View
																	style={{
																		position: 'absolute',
																		top: 0,
																		left: 0,
																		right: 0,
																		height: '47%',
																		backgroundColor: '#315744',
																	}}
																/>
															</View>
														)}

														<View style={eventOverlayStyle} />

														<View
															className='absolute left-[10.5px] top-[10.5px] rounded-full'
															style={eventTypeStyle}
														>
															<Text style={eventTypeTextStyle}>
																{(event.type || 'Educativo').toUpperCase()}
															</Text>
														</View>

														<View className='absolute bottom-0 left-0 right-0 p-3.5'>
															<View className='flex-row items-end'>
																<View className='flex-1 pr-[7px]'>
																	<Text
																		style={eventTitleStyle}
																		numberOfLines={1}
																	>
																		{event.name}
																	</Text>

																	{event.description ? (
																		<Text
																			className='mt-[3.5px]'
																			style={eventDescriptionStyle}
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
																	className='h-[31.5px] w-[31.5px] items-center justify-center rounded-full'
																	style={{
																		backgroundColor: colors.primaryLight,
																	}}
																>
																	<HugeiconsIcon
																		icon={ArrowRight01Icon}
																		size={22}
																		strokeWidth={2}
																		color={colors.primaryDark}
																	/>
																</Pressable>
															</View>

															<View className='mt-[10.5px] flex-row items-center'>
																<Text style={eventMetaStyle} numberOfLines={1}>
																	{formatEventDate(event.start_at)}
																</Text>

																<Text
																	className='mx-[7px]'
																	style={eventSeparatorStyle}
																>
																	•
																</Text>

																<Text style={eventMetaStyle}>
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
								<View style={dotsContainerStyle}>
									{events.map((event, index) => (
										<View
											key={event.id}
											style={dotStyle(index === activeEventIndex)}
										/>
									))}
								</View>
							)}
						</>
					)}
				</View>

				{/* ACCIONES */}
				<View style={actionsContainerStyle}>
					<Text
						className='mb-[10.5px]'
						style={{
							color: colors.text,
							fontSize: 21,
							fontWeight: '800',
							lineHeight: 27,
						}}
					>
						¿Qué quieres hacer?
					</Text>

					{/* BOLETOS Y ESPECIES: DOS COLUMNAS SIN FLECHAS */}
					<View
						style={{
							flexDirection: 'row',
							gap: 12,
							marginBottom: 12,
							alignItems: 'stretch',
						}}
					>
						<View style={{ flex: 1, minWidth: 0 }}>
							<AppCard
								icon={Ticket01Icon}
								title='Comprar boletos'
								iconPosition='top'
								description='Planea tu visita al zoológico.'
								onPress={() => router.push('/tickets')}
								backgroundColor={colors.cardLight}
								borderColor={colors.border}
								minHeight={130}
								iconColor={colors.primary}
								showArrow={false}
							/>
						</View>

						<View style={{ flex: 1, minWidth: 0 }}>
							<AppCard
								icon={UserGroupIcon}
								iconPosition='top'
								title='Conoce las especies'
								description='Descubre nuestros animales.'
								onPress={() => router.push('/species')}
								backgroundColor={colors.cardLight}
								borderColor={colors.border}
								minHeight={130}
								iconColor={colors.primary}
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
						backgroundColor={colors.cardLight}
						borderColor={colors.border}
						iconColor={colors.primary}
						showArrow={true}
					/>

					{/* DONACIÓN: FONDO CONFIGURABLE */}
					<AppCard
						title='Apoya al zoológico'
						description='Tu donación ayuda a cuidar y proteger a nuestros animales.'
						icon={HeartIcon}
						onPress={() => router.push('/donations')}
						backgroundColor={donationCardBackground ?? colors.card}
						borderColor={colors.border}
						iconColor={colors.primaryDark}
						iconBackgroundColor={donationAccentBackground}
						arrowBackgroundColor={donationAccentBackground}
						arrowColor={colors.primaryDark}
						textColor='#FFFFFF'
						descriptionColor='#D4E8D9'
						showArrow
					/>
				</View>
			</ScrollView>
		</SafeAreaView>
	)
}
