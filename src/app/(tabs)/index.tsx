import {
	Calendar03Icon,
	HeartIcon,
	Location01Icon,
	Ticket01Icon,
	UserGroupIcon,
} from '@hugeicons/core-free-icons'
import { router } from 'expo-router'
import { useState } from 'react'

import {
	NativeScrollEvent,
	NativeSyntheticEvent,
	RefreshControl,
	ScrollView,
	View,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

import { ListCard } from '@/components/ui/ListCard'
import { QueryView } from '@/components/ui/QueryView'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { EventCard } from '@/components/explore/EventCard'
import { EventCarouselDots } from '@/components/explore/EventCarouselDots'
import { TabHeader } from '@/components/ui/TabHeader'
import { useAuth } from '@/contexts/AuthContext'
import { useExplore } from '@/hooks/useExplore'
import { useSessionRedirect } from '@/hooks/useSessionRedirect'

import colors from '@/theme/colors'
import { getTabBarExtraSpace } from '@/theme/layout'

const PRIMARY = colors.esmeralda
const EVENT_CARD_WIDTH = 292
const CAROUSEL_GAP = 10

export default function Explorar() {
	const insets = useSafeAreaInsets()

	const { refreshUser } = useAuth()

	const explore = useExplore()
	const { refresh } = explore
	const events = explore.data?.featured_events ?? []
	const firstLoad = explore.isLoading && !explore.data

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
				<TabHeader title='Explorar' />

				{/* EVENTOS DESTACADOS */}
				<View>
					<SectionTitle title='Eventos destacados' />

					<QueryView
						query={explore}
						loadingMessage='Cargando eventos…'
						loadingLayout='tiles'
						errorTitle='No pudimos cargar los eventos'
						isEmpty={(explore) => explore.featured_events.length === 0}
						empty={{
							icon: Calendar03Icon,
							title: 'No hay eventos destacados',
							message: 'Pronto tendremos nuevas actividades para ti.',
						}}
					>
						{() => (
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
					</QueryView>
				</View>

				{/* ACCIONES: the first load shows skeletons in their place (A-43) */}
				{!firstLoad && (
					<View className='mt-6'>
						<SectionTitle title='¿Qué quieres hacer?' />

						{/* BOLETOS Y ESPECIES: DOS COLUMNAS SIN FLECHAS */}
						<View className='mb-3 flex-row items-stretch gap-3'>
							<View className='min-w-0 flex-1'>
								<ListCard
									className='grow'
									icon={Ticket01Icon}
									title='Comprar boletos'
									layout='tile'
									description='Planea tu visita al zoológico.'
									onPress={() => router.push('/tickets')}
									showChevron={false}
								/>
							</View>

							<View className='min-w-0 flex-1'>
								<ListCard
									className='grow'
									icon={UserGroupIcon}
									layout='tile'
									title='Conoce las especies'
									description='Descubre nuestros animales.'
									onPress={() => router.push('/species')}
									showChevron={false}
								/>
							</View>
						</View>

						{/* MAPA: ANCHO COMPLETO CON FLECHA */}
						<ListCard
							className='mb-3'
							icon={Location01Icon}
							title='Mapa del zoológico'
							description='Explora caminos, especies y puntos de interés.'
							onPress={() => router.push('/map')}
							showChevron={true}
						/>

						{/* DONACIÓN: FONDO CONFIGURABLE */}
						<ListCard
							className='mb-3'
							tone='dark'
							title='Apoya al zoológico'
							description='Tu donación ayuda a cuidar y proteger a nuestros animales.'
							icon={HeartIcon}
							onPress={() => router.push('/donations')}
							showChevron
						/>
					</View>
				)}
			</ScrollView>
		</SafeAreaView>
	)
}
