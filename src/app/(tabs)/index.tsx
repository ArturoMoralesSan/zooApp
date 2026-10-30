import {
	HeartIcon,
	Location01Icon,
	Ticket01Icon,
	UserGroupIcon,
} from '@hugeicons/core-free-icons'
import { router } from 'expo-router'
import { useState } from 'react'

import {
	ActivityIndicator,
	NativeScrollEvent,
	NativeSyntheticEvent,
	Pressable,
	RefreshControl,
	ScrollView,
	Text,
	View,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

import AppCard from '@/components/AppCard'
import { EventCard } from '@/components/explore/EventCard'
import { EventCarouselDots } from '@/components/explore/EventCarouselDots'
import UserHeader from '@/components/UserHeader'
import { useAuth } from '@/contexts/AuthContext'
import { useExplore } from '@/hooks/useExplore'
import { useSessionRedirect } from '@/hooks/useSessionRedirect'

import colors from '@/theme/colors'
import { getTabBarExtraSpace } from '@/theme/layout'
import { cardShadow } from '@/theme/shadows'

const PRIMARY = colors.esmeralda
const EVENT_CARD_WIDTH = 292
const CAROUSEL_GAP = 10

// Cambia este valor para personalizar el fondo de la tarjeta de donación.
// Si no se define un color diferente, utiliza el verde predeterminado.
const donationCardBackground = colors.bosque
const donationAccentBackground = colors.lima

export default function Explorar() {
	const insets = useSafeAreaInsets()

	const { refreshUser } = useAuth()

	const { data, error, isLoading: loading, refresh } = useExplore()
	const events = data?.featured_events ?? []

	const [refreshing, setRefreshing] = useState(false)
	const [activeEventIndex, setActiveEventIndex] = useState(0)

	useSessionRedirect()

	const handleRefresh = async () => {
		setRefreshing(true)

		try {
			await Promise.all([refresh(), refreshUser()])
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
				contentContainerClassName='grow px-3 pt-2'
				contentContainerStyle={{
					paddingBottom: 140 + getTabBarExtraSpace(insets.bottom),
				}}
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
				<View className='mt-5'>
					<Text className='text-h2 mb-2.5 text-tinta'>Eventos destacados</Text>

					{loading ? (
						<View className='min-h-[190px] items-center justify-center rounded-3xl border border-card-border bg-niebla'>
							<ActivityIndicator size='large' color={PRIMARY} />
							<Text className='text-body mt-2.5 text-tinta-2'>
								Cargando eventos...
							</Text>
						</View>
					) : error ? (
						<View
							className='rounded-[22px] border border-card-border bg-niebla p-4'
							style={cardShadow}
						>
							<Text className='text-h3 text-tinta'>
								No pudimos cargar los eventos
							</Text>

							<Text className='text-body mt-2 text-tinta-2'>
								{error.message || 'No fue posible cargar los eventos.'}
							</Text>

							<Pressable
								className='mt-3.5 self-start rounded-2xl bg-esmeralda px-4 py-2.5 active:opacity-80'
								onPress={() => {
									void refresh()
								}}
							>
								<Text className='text-button text-blanco'>Reintentar</Text>
							</Pressable>
						</View>
					) : events.length === 0 ? (
						<View className='rounded-[22px] border border-card-border bg-niebla p-5'>
							<Text className='text-h3 text-center text-tinta'>
								No hay eventos destacados
							</Text>

							<Text className='text-body mt-2 text-center text-tinta-2'>
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
								{events.map((event, index) => (
									<EventCard
										key={event.id}
										event={event}
										isLast={index === events.length - 1}
									/>
								))}
							</ScrollView>

							{events.length > 1 && (
								<EventCarouselDots
									events={events}
									activeEventIndex={activeEventIndex}
								/>
							)}
						</>
					)}
				</View>

				{/* ACCIONES */}
				<View className='mt-5'>
					<Text className='text-h2 mb-2.5 text-tinta'>¿Qué quieres hacer?</Text>

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
