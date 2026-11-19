import {
	Album02Icon,
	ChampionIcon,
	GiftIcon,
	HeartIcon,
	UserGroupIcon,
} from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react-native'
import { router } from 'expo-router'
import { useState } from 'react'
import { RefreshControl, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { LevelCard } from '@/components/mizoo/LevelCard'
import { SeeMoreTile } from '@/components/mizoo/SeeMoreTile'
import { SpeciesTile } from '@/components/mizoo/SpeciesTile'
import { SeasonBanner } from '@/components/points/SeasonBanner'
import { SeasonChip } from '@/components/points/SeasonChip'
import { Badge } from '@/components/ui/Badge'
import { ListCard } from '@/components/ui/ListCard'
import { QueryView } from '@/components/ui/QueryView'
import { ScreenBackground } from '@/components/ui/ScreenBackground'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { TabHeader } from '@/components/ui/TabHeader'
import { TextLink } from '@/components/ui/TextLink'
import { useAuth } from '@/contexts/AuthContext'
import { usePointSeason } from '@/hooks/usePointSeason'
import { useProfile } from '@/hooks/useProfile'
import { useScrolled } from '@/hooks/useScrolled'
import { useSessionRedirect } from '@/hooks/useSessionRedirect'
import { useSpecies } from '@/hooks/useSpecies'
import colors from '@/theme/colors'
import { getTabBarExtraSpace } from '@/theme/layout'

// Species shown before the "Ver más" tile.
const CAROUSEL_LIMIT = 8

type MockReward = {
	title: string
	description: string
	icon: IconSvgElement
	// Points earned ("+50 pts") or a reward's cost ("100 pts"); a "2/3" count
	// while in progress.
	badge?: string
	progress?: string
}

// Placeholders until achievements and rewards exist in the API.
const ACHIEVEMENTS: MockReward[] = [
	{
		title: 'Primer hallazgo',
		description: 'Captura tu primera tarjeta',
		icon: Album02Icon,
		badge: '+50 pts',
	},
	{
		title: 'Explorador de la Sabana',
		description: 'Captura 3 especies de la Sabana',
		icon: ChampionIcon,
		progress: '2/3',
	},
	{
		title: 'Amigo del zoológico',
		description: 'Haz tu primera donación',
		icon: HeartIcon,
		badge: '+50 pts',
	},
]

const REWARDS: MockReward[] = [
	{
		title: 'Sticker del Zoológico',
		description: 'Canjéalo en taquilla con tu código QR',
		icon: GiftIcon,
		badge: '100 pts',
	},
]

function MockRewardCard({ item }: { item: MockReward }) {
	return (
		<ListCard
			className='mb-3'
			icon={item.icon}
			// In progress: white box, so it doesn't read as earned.
			iconTone={item.progress ? 'surface' : undefined}
			title={item.title}
			description={item.description}
			trailing={
				item.progress ? (
					<Text className='text-meta'>{item.progress}</Text>
				) : (
					item.badge && <Badge label={item.badge} tone='success' />
				)
			}
		/>
	)
}

export default function MiZoo() {
	const { scrolled, onScroll } = useScrolled()
	const insets = useSafeAreaInsets()

	const { user, refreshUser } = useAuth()
	const profile = useProfile()
	const speciesQuery = useSpecies()
	const season = usePointSeason()

	const [refreshing, setRefreshing] = useState(false)

	useSessionRedirect()

	const handleRefresh = async () => {
		setRefreshing(true)

		try {
			await Promise.all([
				speciesQuery.refresh(),
				profile.refresh(),
				refreshUser(),
				season.refresh(),
			])
		} finally {
			setRefreshing(false)
		}
	}

	// Same derivation as the profile screen; the session user covers a
	// profile that hasn't loaded.
	const gamification = profile.data?.gamification
	const points = gamification?.points ?? user?.points ?? 0
	const level =
		gamification?.current_level?.name || user?.level?.name || 'Bronce'
	const progress = Math.min(100, Math.max(0, gamification?.progress ?? 0))
	// Full bar only when the profile says there's no next level; unknown
	// (profile not loaded) stays empty.
	const topLevel = Boolean(gamification) && !gamification?.next_level

	return (
		<ScreenBackground>
			{/* ENCABEZADO FIJO */}
			<TabHeader scrolled={scrolled} title='MiZoo' />

			<ScrollView
				onScroll={onScroll}
				scrollEventThrottle={16}
				className='flex-1'
				contentContainerClassName='px-5 pt-2'
				contentContainerStyle={{
					paddingBottom: 120 + getTabBarExtraSpace(insets.bottom),
				}}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={handleRefresh}
						tintColor={colors.esmeralda}
						colors={[colors.esmeralda]}
					/>
				}
			>
				{/* NIVEL Y PUNTOS */}
				<LevelCard
					level={level}
					points={points}
					progress={topLevel ? 1 : progress / 100}
					pointsToNextLevel={gamification?.points_to_next_level ?? 0}
					nextLevel={gamification?.next_level?.name || undefined}
					footer={
						// Stays after the banner is closed, so the details are
						// always one tap away.
						season.data && (
							<SeasonChip
								look='soft'
								title={season.data.title}
								icon={season.data.icon}
								color={season.data.color}
								onPress={() => router.push('/points/season')}
							/>
						)
					}
				/>

				<SeasonBanner className='mt-3' />

				{/* ESPECIES: replaces A-06's card collection */}
				<View className='mt-6'>
					<SectionTitle
						title='Especies'
						subtitle={
							speciesQuery.data
								? `${speciesQuery.data.length} especies en el zoológico`
								: undefined
						}
						trailing={
							<TextLink
								label='Ver todas'
								onPress={() => router.push('/species')}
							/>
						}
					/>

					<QueryView
						query={speciesQuery}
						loadingMessage='Cargando especies…'
						loadingLayout='tiles'
						errorTitle='No pudimos cargar las especies'
						isEmpty={(species) => species.length === 0}
						empty={{
							icon: UserGroupIcon,
							title: 'No hay especies',
							message: 'Pronto conocerás a los habitantes del zoológico.',
						}}
					>
						{(species) => (
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								nestedScrollEnabled
								className='-mx-5'
								contentContainerClassName='gap-3 px-5'
							>
								{species.slice(0, CAROUSEL_LIMIT).map((item) => (
									<SpeciesTile
										key={item.id}
										species={item}
										onPress={() => router.push(`/species/${item.id}`)}
									/>
								))}

								{species.length > CAROUSEL_LIMIT && (
									<SeeMoreTile
										remaining={species.length - CAROUSEL_LIMIT}
										onPress={() => router.push('/species')}
									/>
								)}
							</ScrollView>
						)}
					</QueryView>
				</View>

				{/* LOGROS */}
				<View className='mt-6'>
					<SectionTitle title='Logros' />

					{ACHIEVEMENTS.map((item) => (
						<MockRewardCard key={item.title} item={item} />
					))}
				</View>

				{/* RECOMPENSAS */}
				<View className='mt-3'>
					<SectionTitle title='Recompensas' />

					{REWARDS.map((item) => (
						<MockRewardCard key={item.title} item={item} />
					))}
				</View>
			</ScrollView>
		</ScreenBackground>
	)
}
