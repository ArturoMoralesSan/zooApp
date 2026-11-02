import { Cards01Icon } from '@hugeicons/core-free-icons'
import { router } from 'expo-router'
import { useMemo, useState } from 'react'
import { RefreshControl, View } from 'react-native'

import { CardGrid } from '@/components/deck/CardGrid'
import { DeckCardTile } from '@/components/deck/DeckCardTile'
import { KeyboardScrollView } from '@/components/ui/KeyboardScrollView'
import { QueryView } from '@/components/ui/QueryView'
import { ScreenBackground } from '@/components/ui/ScreenBackground'
import { SearchField } from '@/components/ui/SearchField'
import { SegmentedTabs } from '@/components/ui/SegmentedTabs'
import { ScreenHeader } from '@/components/ui/TabHeader'
import { TopBar } from '@/components/ui/TopBar'
import { useCards } from '@/hooks/useCards'
import { useScrolled } from '@/hooks/useScrolled'
import { useSessionRedirect } from '@/hooks/useSessionRedirect'
import colors from '@/theme/colors'
import { useScrollBottomSpace } from '@/theme/layout'

type DeckTab = 'owned' | 'all'

const PRIMARY = colors.esmeralda

export default function DeckScreen() {
	const { scrolled, pastTitle, onScroll, onTitleLayout } = useScrolled()
	const bottomSpace = useScrollBottomSpace(40)

	const cardsQuery = useCards()
	const cards = useMemo(() => cardsQuery.data ?? [], [cardsQuery.data])
	const [tab, setTab] = useState<DeckTab>('owned')
	const [search, setSearch] = useState('')
	const [refreshing, setRefreshing] = useState(false)

	useSessionRedirect()

	const ownedCount = cards.filter((card) => card.encountered).length
	const query = search.trim().toLowerCase()

	const visibleCards = useMemo(
		() =>
			cards.filter((card) => {
				// Unowned cards have no name, so a search only matches owned ones.
				if (!card.encountered) return tab === 'all' && !query

				return !query || card.name.toLowerCase().includes(query)
			}),
		[cards, tab, query],
	)

	const handleRefresh = async () => {
		setRefreshing(true)

		try {
			await cardsQuery.refresh()
		} finally {
			setRefreshing(false)
		}
	}

	return (
		<ScreenBackground>
			<TopBar
				onBack={() => router.back()}
				title='Mi Deck'
				showTitle={pastTitle}
				scrolled={scrolled}
			/>

			<KeyboardScrollView
				onScroll={onScroll}
				scrollEventThrottle={16}
				className='flex-1'
				contentContainerClassName='grow px-5 pt-2'
				contentContainerStyle={{ paddingBottom: bottomSpace }}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={handleRefresh}
						tintColor={PRIMARY}
						colors={[PRIMARY]}
					/>
				}
			>
				<ScreenHeader
					title='Mi Deck'
					subtitle='Las tarjetas que has ganado en tus duelos.'
					className='mb-6'
					onLayout={onTitleLayout}
				/>

				<SegmentedTabs
					value={tab}
					onChange={setTab}
					tabs={[
						{
							key: 'owned',
							label: `Obtenidos · ${ownedCount}`,
						},
						{ key: 'all', label: `Todos · ${cards.length}` },
					]}
				/>

				<SearchField
					label='Buscar tarjeta'
					value={search}
					onChangeText={setSearch}
					placeholder='Buscar tarjeta'
				/>

				<QueryView
					query={cardsQuery}
					loadingMessage='Cargando tus tarjetas…'
					loadingLayout='tiles'
					errorTitle='No pudimos cargar tus tarjetas'
					isEmpty={() => visibleCards.length === 0}
					empty={
						query
							? {
									icon: Cards01Icon,
									title: 'No encontramos tarjetas',
									message: 'Intenta con otro nombre.',
								}
							: {
									icon: Cards01Icon,
									title: 'Aún no tienes tarjetas',
									message:
										'Escanea el QR de un recinto y gana el duelo para obtener tu primera tarjeta.',
								}
					}
					className='mt-6'
				>
					{() => (
						<View className='mt-6'>
							<CardGrid
								cards={visibleCards}
								columns={2}
								renderCard={(card) => <DeckCardTile card={card} />}
							/>
						</View>
					)}
				</QueryView>
			</KeyboardScrollView>
		</ScreenBackground>
	)
}
