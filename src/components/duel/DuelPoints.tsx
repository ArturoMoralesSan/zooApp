import { Coins02Icon, Crown02Icon } from '@hugeicons/core-free-icons'
import { Animated, Text, View } from 'react-native'

import { SeasonPointsNotice } from '@/components/points/SeasonPointsNotice'
import { Badge } from '@/components/ui/Badge'
import { usePointsReveal } from '@/hooks/usePointsReveal'
import type { PointsAward } from '@/types/points'

type DuelPointsProps = {
	points: PointsAward
}

const formatPoints = (value: number) => value.toLocaleString('es-MX')

// A-22: points from the server for the won card. Counts up, then shows the
// new level, below the card so it never covers it.
export function DuelPoints({ points }: DuelPointsProps) {
	const { awarded, total, level, level_up } = points
	const season = points.season ?? null
	const levelName = level_up ? level?.name : undefined
	const { shown, counted, levelOpacity } = usePointsReveal(awarded, levelName)

	const summary = [
		awarded > 0 ? `Ganaste ${formatPoints(awarded)} puntos.` : null,
		`Total: ${formatPoints(total)} puntos.`,
		levelName ? `Subiste a nivel ${levelName}.` : null,
	]
		.filter(Boolean)
		.join(' ')

	return (
		<View className='w-full items-center gap-3'>
			<View
				accessible
				accessibilityLabel={summary}
				className='items-center gap-2'
			>
				{/* Wrapped: Badge is self-start, the wrapper centers it. */}
				{awarded > 0 && (
					<View>
						<Badge icon={Coins02Icon} label={`+${formatPoints(shown)}`} />
					</View>
				)}

				<Text className='text-meta text-center text-tinta-2'>
					Total: {formatPoints(total)} puntos
				</Text>

				{levelName && counted && (
					<Animated.View style={{ opacity: levelOpacity }}>
						<Badge
							tone='success'
							icon={Crown02Icon}
							label={`¡Subiste a nivel ${levelName}!`}
						/>
					</Animated.View>
				)}
			</View>

			{/* Its own element, read after the points. Shown even at 0 points:
			    it explains why none were given. */}
			{season && (
				<SeasonPointsNotice season={season} awarded={awarded} subject='carta' />
			)}
		</View>
	)
}
