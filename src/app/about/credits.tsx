import { Album02Icon, SquareLock02Icon } from '@hugeicons/core-free-icons'
import { router } from 'expo-router'
import { useMemo, useState } from 'react'
import { SectionList, View } from 'react-native'

import { CreditAssetCard } from '@/components/about/CreditAssetCard'
import { Chip } from '@/components/ui/Chip'
import { Icon } from '@/components/ui/Icon'
import { QueryView } from '@/components/ui/QueryView'
import { ScreenBackground } from '@/components/ui/ScreenBackground'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { ScreenHeader } from '@/components/ui/TabHeader'
import { TopBar } from '@/components/ui/TopBar'
import {
	HIDDEN_CARD_NAME,
	useCreditCardName,
	useCredits,
} from '@/hooks/useCredits'
import { useScrolled } from '@/hooks/useScrolled'
import colors from '@/theme/colors'
import { useScrollBottomSpace } from '@/theme/layout'
import type { CreditAsset, CreditsSection } from '@/types/credits'
import { groupByAsset, type AssetGroup } from '@/utils/credits'

type Filter = 'all' | 'images' | 'models'

const FILTERS: { key: Filter; label: string; assets: CreditAsset[] }[] = [
	{ key: 'all', label: 'Todo', assets: ['artwork', 'thumbnail', 'model'] },
	{ key: 'images', label: 'Imágenes', assets: ['artwork', 'thumbnail'] },
	{ key: 'models', label: 'Modelos 3D', assets: ['model'] },
]

type Section = {
	key: string
	title: string
	hidden: boolean
	count: number
	data: AssetGroup[]
}

// Who made each card's images and 3D model: one section per card, one
// block per asset. Cards not won yet keep their name hidden.
export default function CreditsScreen() {
	const { scrolled, pastTitle, onScroll, onTitleLayout } = useScrolled()
	const bottomSpace = useScrollBottomSpace(32)
	const credits = useCredits()
	const cardName = useCreditCardName()
	const [filter, setFilter] = useState<Filter>('all')

	const toSections = useMemo(() => {
		const assets = FILTERS.find((item) => item.key === filter)?.assets ?? []

		return (data: CreditsSection[]): Section[] =>
			data
				.map((section) => {
					const shown = section.credits.filter((credit) =>
						assets.includes(credit.asset),
					)
					const title = cardName(section)

					return {
						key: String(section.card.id),
						title,
						hidden: title === HIDDEN_CARD_NAME,
						count: shown.length,
						data: groupByAsset(shown),
					}
				})
				.filter((section) => section.data.length > 0)
	}, [filter, cardName])

	return (
		<ScreenBackground>
			<TopBar
				onBack={() => router.back()}
				title='Créditos del contenido'
				showTitle={pastTitle}
				scrolled={scrolled}
			/>

			<QueryView
				query={credits}
				loadingMessage='Cargando créditos…'
				errorTitle='No pudimos cargar los créditos'
				isEmpty={(data) => data.length === 0}
				empty={{
					icon: Album02Icon,
					title: 'Aún no hay créditos que mostrar',
				}}
				className='mx-5 mt-4'
			>
				{(data) => (
					<SectionList
						sections={toSections(data)}
						keyExtractor={(group) => group.asset}
						onScroll={onScroll}
						scrollEventThrottle={16}
						stickySectionHeadersEnabled={false}
						className='flex-1'
						contentContainerClassName='px-5 pt-2'
						contentContainerStyle={{ paddingBottom: bottomSpace }}
						ListHeaderComponent={
							<View className='mb-2'>
								<ScreenHeader
									title='Créditos del contenido'
									subtitle='Quién hizo las imágenes y los modelos 3D de las tarjetas, y con qué licencia.'
									className='mb-4'
									onLayout={onTitleLayout}
								/>
								<View
									accessibilityRole='radiogroup'
									className='flex-row flex-wrap gap-2'
								>
									{FILTERS.map((item) => (
										<Chip
											key={item.key}
											label={item.label}
											selected={filter === item.key}
											onPress={() => setFilter(item.key)}
										/>
									))}
								</View>
							</View>
						}
						renderSectionHeader={({ section }) => (
							<SectionTitle
								title={section.title}
								subtitle={
									section.hidden
										? 'Gánala en un duelo para ver su nombre.'
										: section.count === 1
											? '1 crédito'
											: `${section.count} créditos`
								}
								trailing={
									section.hidden ? (
										<Icon icon={SquareLock02Icon} color={colors.apagado} />
									) : undefined
								}
								className='mb-3 mt-6'
							/>
						)}
						renderItem={({ item }) => (
							<CreditAssetCard group={item} className='mb-3' />
						)}
					/>
				)}
			</QueryView>
		</ScreenBackground>
	)
}
