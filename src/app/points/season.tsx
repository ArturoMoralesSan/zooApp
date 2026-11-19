import { SparklesIcon } from '@hugeicons/core-free-icons'
import { router } from 'expo-router'
import { Fragment, useState } from 'react'
import { RefreshControl, ScrollView, Text, View } from 'react-native'

import { SeasonChangeRow } from '@/components/points/SeasonChangeRow'
import { Card } from '@/components/ui/Card'
import { Divider } from '@/components/ui/Divider'
import { Icon } from '@/components/ui/Icon'
import { QueryView } from '@/components/ui/QueryView'
import { ScreenBackground } from '@/components/ui/ScreenBackground'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { ScreenHeader } from '@/components/ui/TabHeader'
import { TopBar } from '@/components/ui/TopBar'
import { usePointSeason } from '@/hooks/usePointSeason'
import { useScrolled } from '@/hooks/useScrolled'
import { useSessionRedirect } from '@/hooks/useSessionRedirect'
import colors from '@/theme/colors'
import { useScrollBottomSpace } from '@/theme/layout'
import type { PointSeason } from '@/types/points'
import { rarityLabel } from '@/utils/cards'
import {
	pointChange,
	seasonIcon,
	seasonTones,
	withAlpha,
} from '@/utils/pointSeason'

type Change = { key: string; label: string; base: number; points: number }

function ChangeList({ items }: { items: Change[] }) {
	return (
		<Card>
			{items.map((item, index) => (
				<Fragment key={item.key}>
					{index > 0 && <Divider />}
					<SeasonChangeRow
						label={item.label}
						basePoints={item.base}
						points={item.points}
					/>
				</Fragment>
			))}
		</Card>
	)
}

function SeasonHero({ season }: { season: PointSeason }) {
	const tones = seasonTones(season.color)

	return (
		<View
			className='flex-row items-start gap-3 rounded-2xl border-1.5 p-4'
			style={{
				backgroundColor: tones.soft,
				borderColor: withAlpha(tones.accent, 0.35),
			}}
		>
			<View
				className='h-10 w-10 items-center justify-center rounded-xl'
				style={{ backgroundColor: tones.accent }}
			>
				<Icon icon={seasonIcon(season.icon)} color={tones.onAccent} />
			</View>

			<View style={{ flex: 1, minWidth: 0 }}>
				<Text className='text-h2' style={{ color: tones.text }}>
					{season.title}
				</Text>
				{season.message && (
					<Text className='text-body mt-1' style={{ color: tones.text }}>
						{season.message}
					</Text>
				)}
			</View>
		</View>
	)
}

// "2 suben · 1 baja" for the sections' subtitles.
function summarize(items: Change[]): string {
	const up = items.filter((i) => pointChange(i.base, i.points) === 'up').length
	const down = items.filter(
		(i) => pointChange(i.base, i.points) === 'down',
	).length

	return [
		up ? `${up} ${up === 1 ? 'sube' : 'suben'}` : null,
		down ? `${down} ${down === 1 ? 'baja' : 'bajan'}` : null,
	]
		.filter(Boolean)
		.join(' · ')
}

// What the active points season changes: cards per rarity, then any other
// action. Informative only: the real points come with each action.
export default function PointSeasonScreen() {
	const { scrolled, pastTitle, onScroll, onTitleLayout } = useScrolled()
	const season = usePointSeason()
	const bottomSpace = useScrollBottomSpace(32)

	const [refreshing, setRefreshing] = useState(false)

	useSessionRedirect()

	const handleRefresh = async () => {
		setRefreshing(true)

		try {
			await season.refresh()
		} finally {
			setRefreshing(false)
		}
	}

	return (
		<ScreenBackground>
			<TopBar
				onBack={() => router.back()}
				title='Temporada de puntos'
				showTitle={pastTitle}
				scrolled={scrolled}
			/>

			<ScrollView
				onScroll={onScroll}
				scrollEventThrottle={16}
				className='flex-1'
				contentContainerClassName='grow px-5 pt-2'
				contentContainerStyle={{ paddingBottom: bottomSpace }}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={handleRefresh}
						tintColor={colors.esmeralda}
						colors={[colors.esmeralda]}
					/>
				}
			>
				<ScreenHeader
					title='Temporada de puntos'
					subtitle='Así cambian los puntos mientras dure.'
					className='mb-6'
					onLayout={onTitleLayout}
				/>

				<QueryView
					query={season}
					loadingMessage='Cargando la temporada…'
					errorTitle='No pudimos cargar la temporada'
					isEmpty={(data) => data === null}
					empty={{
						icon: SparklesIcon,
						title: 'No hay temporada activa',
						message: 'Por ahora cada acción da sus puntos de siempre.',
					}}
				>
					{(data) => {
						if (!data) return null

						const cards: Change[] = data.cards.map((card) => ({
							key: card.rarity,
							label: `Carta ${rarityLabel(card.rarity).toLowerCase()}`,
							base: card.base_points,
							points: card.points,
						}))
						const other: Change[] = data.other.map((rule) => ({
							key: rule.type,
							label: rule.name,
							base: rule.base_points,
							points: rule.points,
						}))

						return (
							<View className='gap-6'>
								<SeasonHero season={data} />

								{cards.length > 0 && (
									<View>
										<SectionTitle
											title='Cartas'
											subtitle={`Al capturar una carta · ${summarize(cards)}`}
										/>
										<ChangeList items={cards} />
									</View>
								)}

								{other.length > 0 && (
									<View>
										<SectionTitle
											title='Otras acciones'
											subtitle={summarize(other)}
										/>
										<ChangeList items={other} />
									</View>
								)}

								<Text className='text-meta text-tinta-2'>
									{cards.length + other.length > 0
										? 'Lo que no aparece aquí da sus puntos de siempre. Los puntos que ganas te los confirmamos al completar cada acción.'
										: 'Esta temporada no cambia los puntos: cada acción da sus puntos de siempre.'}
								</Text>
							</View>
						)
					}}
				</QueryView>
			</ScrollView>
		</ScreenBackground>
	)
}
