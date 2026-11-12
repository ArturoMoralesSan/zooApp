import {
	Bug01Icon,
	Cards01Icon,
	QrCodeScanIcon,
	SwordsIcon,
} from '@hugeicons/core-free-icons'
import { router } from 'expo-router'
import { useCallback, useState } from 'react'
import { RefreshControl, ScrollView, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

import { CardGrid } from '@/components/deck/CardGrid'
import { CollectionTile } from '@/components/deck/CollectionTile'
import { MapPreviewCard } from '@/components/deck/MapPreviewCard'
import { OfflinePackCard } from '@/components/deck/OfflinePackCard'
import { OfflinePackIntroModal } from '@/components/deck/OfflinePackIntroModal'
import { ListCard } from '@/components/ui/ListCard'
import { Notice } from '@/components/ui/Notice'
import { QueryView } from '@/components/ui/QueryView'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { TabHeader } from '@/components/ui/TabHeader'
import { TextLink } from '@/components/ui/TextLink'
import Toast from '@/components/ui/Toast'
import { useAuth } from '@/contexts/AuthContext'
import { useCards } from '@/hooks/useCards'
import { useOfflinePackPrompts } from '@/hooks/useOfflinePackPrompts'
import { usePackStatus } from '@/hooks/usePackStatus'
import { useScrolled } from '@/hooks/useScrolled'
import { useSessionRedirect } from '@/hooks/useSessionRedirect'
import { syncPack } from '@/services/packSync'
import colors from '@/theme/colors'
import { getTabBarExtraSpace } from '@/theme/layout'
import { formatBytes } from '@/utils/format'
import { ZOODECK_QUIZ_DEBUG } from '@/utils/zoodeckDebug'

const PRIMARY = colors.esmeralda
const COLLECTION_PREVIEW = 6

export default function ZooDeck() {
	const { scrolled, onScroll } = useScrolled()
	const insets = useSafeAreaInsets()
	const { refreshUser } = useAuth()

	const cards = useCards()
	const pack = usePackStatus()
	const prompts = useOfflinePackPrompts()
	const [refreshing, setRefreshing] = useState(false)
	const [comingSoon, setComingSoon] = useState<string | null>(null)
	const hideComingSoon = useCallback(() => setComingSoon(null), [])

	useSessionRedirect()

	const handleRefresh = async () => {
		setRefreshing(true)

		try {
			await Promise.all([cards.refresh(), refreshUser(), syncPack()])
		} finally {
			setRefreshing(false)
		}
	}

	const owned = cards.data?.filter((card) => card.encountered).length ?? 0
	const total = cards.data?.length ?? 0

	return (
		<SafeAreaView className='flex-1 bg-blanco' edges={['top']}>
			<TabHeader scrolled={scrolled} title='ZooDeck' />

			<ScrollView
				onScroll={onScroll}
				scrollEventThrottle={16}
				className='flex-1'
				contentContainerClassName='grow px-5 pt-2'
				contentContainerStyle={{
					paddingBottom: 140 + getTabBarExtraSpace(insets.bottom),
				}}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={handleRefresh}
						tintColor={PRIMARY}
						colors={[PRIMARY]}
					/>
				}
			>
				{/* MAPA: placeholder until the zoo map is shown here */}
				<MapPreviewCard
					onOpenMap={() =>
						setComingSoon('El mapa de ZooDeck estará disponible pronto.')
					}
				/>

				{/* PAQUETE SIN CONEXIÓN: prepared at home for the visit */}
				{prompts.mobileNoticeVisible && (
					<Notice
						tone='warning'
						title='Ahorra datos en tu visita'
						message='Descarga el paquete en casa con Wi-Fi.'
						className='mt-6'
					/>
				)}
				<OfflinePackCard
					className={prompts.mobileNoticeVisible ? 'mt-3' : 'mt-6'}
				/>

				{/* MI COLECCIÓN */}
				<View className='mt-6'>
					<SectionTitle
						title='Mi colección'
						subtitle={cards.data ? `${owned} de ${total} tarjetas` : undefined}
						trailing={
							<TextLink
								label='Ver todas'
								onPress={() => router.push('/deck')}
							/>
						}
					/>

					<QueryView
						query={cards}
						loadingMessage='Cargando tu colección…'
						loadingLayout='tiles'
						errorTitle='No pudimos cargar tu colección'
						isEmpty={(data) => data.length === 0}
						empty={{
							icon: Cards01Icon,
							title: 'Aún no hay tarjetas',
							message: 'Pronto podrás retar a los animales del zoológico.',
						}}
					>
						{(data) => (
							<CardGrid
								cards={data.slice(0, COLLECTION_PREVIEW)}
								columns={3}
								gapClassName='gap-2'
								renderCard={(card) => (
									<CollectionTile
										card={card}
										onPress={
											card.encountered
												? () => router.push(`/deck/${card.id}`)
												: undefined
										}
									/>
								)}
							/>
						)}
					</QueryView>
				</View>

				{/* Debug mode only (EXPO_PUBLIC_ZOODECK_QUIZ_DEBUG=1). */}
				{ZOODECK_QUIZ_DEBUG && (
					<ListCard
						className='mt-6'
						tone='hoja'
						icon={Bug01Icon}
						title='Duelo de prueba'
						description='Quiz falso sin QR ni AR que termina en la vista 3D.'
						onPress={() => router.push('/duel/debug')}
					/>
				)}

				{/* DUELOS: the dark card stays the primary game action; the QR card
				    above it is the secondary (Niebla card, Esmeralda chevron). */}
				<ListCard
					className='mt-6'
					icon={QrCodeScanIcon}
					title='Escanear QR'
					description='Escanea la placa de un recinto y reta al animal.'
					onPress={() => router.push('/duel/scan')}
				/>
				<ListCard
					className='mt-3'
					tone='dark'
					icon={SwordsIcon}
					title='Duelos'
					description='Reta a los animales del zoológico y gana su tarjeta.'
					onPress={() =>
						setComingSoon('Los duelos del mapa estarán disponibles pronto.')
					}
				/>
			</ScrollView>

			<OfflinePackIntroModal
				visible={prompts.introVisible}
				size={formatBytes(pack.totalBytes)}
				cellular={prompts.isCellular}
				onDownload={prompts.download}
				onLater={prompts.later}
			/>

			<Toast
				visible={comingSoon !== null}
				type='warning'
				title='Próximamente'
				message={comingSoon ?? ''}
				onHide={hideComingSoon}
			/>
		</SafeAreaView>
	)
}
