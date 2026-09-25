import {
	ArrowRight01Icon,
	HeartAddIcon,
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
	ImageBackground,
	NativeScrollEvent,
	NativeSyntheticEvent,
	Pressable,
	RefreshControl,
	ScrollView,
	Text,
	View,
} from 'react-native'

import { SafeAreaView } from 'react-native-safe-area-context'

import UserHeader from '@/components/UserHeader'

import { useAuth } from '@/contexts/AuthContext'

import { api } from '@/services/api'

import { getToken } from '@/services/auth'

import {
	actionBottomTextStyle,
	actionPressableStyle,
	actionsContainerStyle,
	actionsRowStyle,
	backgroundImageStyle,
	backgroundStyle,
	cardShadow,
	colors,
	donationArrowStyle,
	donationCardStyle,
	donationDescriptionStyle,
	donationIconBoxStyle,
	donationTitleStyle,
	dotStyle,
	dotsContainerStyle,
	errorCardStyle,
	eventCardContainerStyle,
	eventCardStyle,
	eventCardWidth,
	eventDescriptionStyle,
	eventFallbackStyle,
	eventFallbackTextStyle,
	eventMetaStyle,
	eventOverlayStyle,
	eventPressableStyle,
	eventSeparatorStyle,
	eventTitleStyle,
	eventTypeStyle,
	eventTypeTextStyle,
	loadingCardStyle,
	loadingTextStyle,
	mapCardStyle,
	mapIconContainerStyle,
	mapIconStyle,
	retryButtonStyle,
	rightColumnStyle,
	screenStyle,
	scrollContentStyle,
	secondaryTextStyle,
	speciesCardStyle,
	speciesDescriptionStyle,
	speciesIconContainerStyle,
	ticketBackgroundIconStyle,
	ticketIconBoxStyle,
	ticketsCardStyle,
	titleTextStyle,
} from '@/styles/explore'

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

			const featuredEvents = response.data.featured_events ?? []

			setEvents(featuredEvents)
			setActiveEventIndex(0)
		} catch (error) {
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

		const index = Math.round(offsetX / (eventCardWidth + 12))

		if (index >= 0 && index < events.length && index !== activeEventIndex) {
			setActiveEventIndex(index)
		}
	}

	return (
		<SafeAreaView className='flex-1' edges={['top']} style={screenStyle}>
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				className='flex-1'
				resizeMode='repeat'
				imageStyle={backgroundImageStyle}
				style={backgroundStyle}
			>
				<ScrollView
					className='flex-1'
					contentContainerStyle={scrollContentStyle}
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
					{/* HEADER */}
					<UserHeader title='Explorar' />

					{/* EVENTOS */}
					<View className='mt-7'>
						{loading ? (
							<View
								className='items-center justify-center overflow-hidden rounded-[28px]'
								style={loadingCardStyle}
							>
								<ActivityIndicator size='large' color={colors.primary} />

								<Text className='mt-3 text-sm' style={loadingTextStyle}>
									Cargando eventos...
								</Text>
							</View>
						) : error ? (
							<View className='rounded-[28px] p-5' style={errorCardStyle}>
								<Text className='text-base font-bold' style={titleTextStyle}>
									No pudimos cargar los eventos
								</Text>

								<Text
									className='mt-2 text-sm leading-5'
									style={secondaryTextStyle}
								>
									{error}
								</Text>

								<Pressable
									className='mt-4 self-start overflow-hidden rounded-[18px]'
									onPress={() => {
										setLoading(true)
										void loadExplore()
									}}
									style={({ pressed }) => retryButtonStyle(pressed)}
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
									style={titleTextStyle}
								>
									No hay eventos destacados
								</Text>

								<Text
									className='mt-2 text-center text-sm leading-5'
									style={secondaryTextStyle}
								>
									Pronto tendremos nuevas actividades para ti.
								</Text>
							</View>
						) : (
							<View>
								<ScrollView
									horizontal
									showsHorizontalScrollIndicator={false}
									decelerationRate='fast'
									snapToInterval={eventCardWidth + 12}
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
												style={eventCardContainerStyle(index, events.length)}
											>
												<View
													className='overflow-hidden rounded-[28px]'
													style={eventCardStyle}
												>
													<Pressable
														className='flex-1 overflow-hidden rounded-[28px]'
														onPress={() =>
															Alert.alert(
																event.name,
																event.description ||
																	'Consulta próximamente todos los detalles de este evento.',
															)
														}
														style={({ pressed }) =>
															eventPressableStyle(pressed)
														}
													>
														<View className='relative flex-1'>
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
																	style={eventFallbackStyle}
																>
																	<Text style={eventFallbackTextStyle}>Z</Text>
																</View>
															)}

															<View
																className='absolute inset-x-0 bottom-0'
																style={eventOverlayStyle}
															/>

															<View
																className='absolute right-4 top-3 rounded-full px-4 py-1.5'
																style={eventTypeStyle}
															>
																<Text style={eventTypeTextStyle}>
																	{event.type || 'Evento'}
																</Text>
															</View>

															<View className='absolute bottom-4 left-4 right-4'>
																<Text style={eventTitleStyle} numberOfLines={1}>
																	{event.name}
																</Text>

																{event.description ? (
																	<Text
																		className='mt-1'
																		style={eventDescriptionStyle}
																		numberOfLines={1}
																	>
																		{event.description}
																	</Text>
																) : null}

																<View className='mt-3 flex-row items-center'>
																	<Text style={eventMetaStyle}>
																		{formatEventDate(event.start_at)}
																	</Text>

																	<Text
																		className='mx-2'
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
							</View>
						)}
					</View>

					{/* ACCIONES */}
					<View style={actionsContainerStyle}>
						<View style={actionsRowStyle}>
							{/* ENTRADAS */}
							<View
								className='mr-2 flex-1 overflow-hidden rounded-[22px]'
								style={ticketsCardStyle}
							>
								<Pressable
									onPress={() => router.push('/tickets')}
									className='flex-1 rounded-[22px] p-4'
									style={({ pressed }) => actionPressableStyle(pressed)}
								>
									<View
										className='h-12 w-12 items-center justify-center rounded-[16px]'
										style={ticketIconBoxStyle}
									>
										<HugeiconsIcon
											icon={Ticket01Icon}
											size={28}
											strokeWidth={1.8}
											color={colors.primary}
										/>
									</View>

									<Text className='mt-5' style={titleTextStyle}>
										Entradas
									</Text>

									<Text
										className='mt-1'
										style={{
											...secondaryTextStyle,
											fontSize: 12,
											lineHeight: 17,
										}}
									>
										Compra tus entradas en la app y llega directo a disfrutar.
									</Text>

									<View
										className='absolute bottom-3 right-2'
										style={ticketBackgroundIconStyle}
									>
										<HugeiconsIcon
											icon={Ticket01Icon}
											size={100}
											strokeWidth={1}
											color={colors.primaryLight}
										/>
									</View>
								</Pressable>
							</View>

							{/* COLUMNA DERECHA */}
							<View style={rightColumnStyle}>
								{/* MAPA */}
								<View
									className='mb-3 overflow-hidden rounded-[22px]'
									style={mapCardStyle}
								>
									<Pressable
										onPress={() => router.push('/map')}
										className='flex-1 rounded-[22px] p-4'
										style={({ pressed }) => actionPressableStyle(pressed)}
									>
										<View className='absolute' style={mapIconContainerStyle}>
											<View style={mapIconStyle}>
												<HugeiconsIcon
													icon={Location01Icon}
													size={72}
													strokeWidth={1}
													color={colors.coral}
												/>
											</View>
										</View>

										<View className='absolute bottom-3 left-4'>
											<Text style={actionBottomTextStyle}>
												Mapa interactivo
											</Text>
										</View>
									</Pressable>
								</View>

								{/* ZOODECK */}
								<View
									className='overflow-hidden rounded-[22px]'
									style={speciesCardStyle}
								>
									<Pressable
										onPress={() => router.push('/species')}
										className='flex-1 rounded-[22px] p-4'
										style={({ pressed }) => actionPressableStyle(pressed)}
									>
										<View
											className='absolute'
											style={speciesIconContainerStyle}
										>
											<HugeiconsIcon
												icon={UserGroupIcon}
												size={78}
												strokeWidth={1}
												color={colors.primaryLight}
											/>
										</View>

										<View className='absolute bottom-3 left-4 right-3'>
											<Text style={actionBottomTextStyle}>ZooDeck</Text>

											<Text
												className='mt-1'
												numberOfLines={2}
												style={speciesDescriptionStyle}
											>
												Descubre las especies del zoológico.
											</Text>
										</View>
									</Pressable>
								</View>
							</View>
						</View>

						{/* DONACIONES */}
						<View
							className='mt-3 overflow-hidden rounded-[22px]'
							style={donationCardStyle}
						>
							<Pressable
								onPress={() => router.push('/donations')}
								className='rounded-[22px] px-4 py-4'
								style={({ pressed }) => actionPressableStyle(pressed)}
							>
								<View className='flex-row items-center'>
									<View
										className='h-11 w-11 items-center justify-center rounded-[15px]'
										style={donationIconBoxStyle}
									>
										<HugeiconsIcon
											icon={HeartAddIcon}
											size={23}
											strokeWidth={1.8}
											color={colors.primary}
										/>
									</View>

									<View className='ml-3 flex-1'>
										<Text style={donationTitleStyle}>Apoya al zoológico</Text>

										<Text
											className='mt-1'
											numberOfLines={1}
											style={donationDescriptionStyle}
										>
											Haz una donación y ayuda a conservar nuestra fauna.
										</Text>
									</View>

									<HugeiconsIcon
										icon={ArrowRight01Icon}
										size={20}
										strokeWidth={1.8}
										color={donationArrowStyle.color}
									/>
								</View>
							</Pressable>
						</View>
					</View>
				</ScrollView>
			</ImageBackground>
		</SafeAreaView>
	)
}
