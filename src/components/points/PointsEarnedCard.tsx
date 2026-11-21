import { Coins02Icon, Crown02Icon } from '@hugeicons/core-free-icons'
import { Animated, Text, View } from 'react-native'

import { SeasonPointsNotice } from '@/components/points/SeasonPointsNotice'
import { Badge } from '@/components/ui/Badge'
import { IconBox } from '@/components/ui/IconBox'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { usePointsReveal } from '@/hooks/usePointsReveal'
import { useProfile } from '@/hooks/useProfile'
import type { PointsAward } from '@/types/points'
import type { PointsSubject } from '@/utils/pointSeason'
import { levelProgress } from '@/utils/profile'

type PointsEarnedCardProps = {
	points: PointsAward
	// "Esta compra…" / "Esta donación…" in the season notice.
	subject: Exclude<PointsSubject, 'carta'>
	className?: string
}

const formatPoints = (value: number) => value.toLocaleString('es-MX')

// Success screens (tickets, donations): the points the server gave for the
// action, counted up, with the progress to the next level and the season
// notice. No card at 0 points (never "+0"); the notice still explains a
// season that turned the action off.
export function PointsEarnedCard({
	points,
	subject,
	className = '',
}: PointsEarnedCardProps) {
	const { awarded, total, level, level_up } = points
	const season = points.season ?? null
	const levelName = level_up ? level?.name : undefined
	const { shown, counted, levelOpacity } = usePointsReveal(awarded, levelName)

	// The screen revalidates the profile after the action. Until it reports
	// this action's total, its progress is the old one: don't show it.
	const gamification = useProfile().data?.gamification
	const fresh = gamification?.points === total
	const { progress, topLevel, pointsToNextLevel, nextLevel } =
		levelProgress(gamification)

	if (awarded === 0 && !season) return null

	const summary = [
		`Ganaste ${formatPoints(awarded)} puntos.`,
		`Total: ${formatPoints(total)} puntos.`,
		levelName ? `Subiste a nivel ${levelName}.` : null,
		fresh && nextLevel
			? `Te faltan ${formatPoints(pointsToNextLevel)} puntos para ${nextLevel}.`
			: null,
	]
		.filter(Boolean)
		.join(' ')

	return (
		<View className={`gap-3 ${className}`}>
			{awarded > 0 && (
				<View
					accessible
					accessibilityLabel={summary}
					className='rounded-2xl border-1.5 border-card-border bg-hoja p-4'
				>
					<View className='flex-row items-center gap-3'>
						<IconBox icon={Coins02Icon} tone='accent' />

						<View style={{ flex: 1, minWidth: 0 }}>
							<Text className='text-overline text-tinta-2'>Puntos ganados</Text>
							<View className='flex-row items-baseline gap-1.5'>
								<Text className='font-display-x text-[34px] text-bosque'>
									+{formatPoints(shown)}
								</Text>
								<Text className='text-h3 text-bosque'>puntos</Text>
							</View>
						</View>
					</View>

					<Text className='text-meta mt-2 text-tinta-2'>
						Total: {formatPoints(total)} puntos
						{level ? ` · Nivel ${level.name}` : ''}
					</Text>

					{fresh && (
						<>
							<ProgressBar
								progress={progress}
								accessibilityLabel='Progreso al siguiente nivel'
								className='mt-3'
							/>
							{!topLevel && nextLevel && (
								<Text className='text-meta mt-2 text-tinta'>
									Te faltan{' '}
									<Text className='font-sans-bold'>
										{formatPoints(pointsToNextLevel)}
									</Text>{' '}
									puntos para{' '}
									<Text className='font-sans-bold'>{nextLevel}</Text>
								</Text>
							)}
						</>
					)}

					{levelName && counted && (
						<Animated.View className='mt-3' style={{ opacity: levelOpacity }}>
							<Badge
								tone='success'
								icon={Crown02Icon}
								label={`¡Subiste a nivel ${levelName}!`}
							/>
						</Animated.View>
					)}
				</View>
			)}

			{season && (
				<SeasonPointsNotice
					season={season}
					awarded={awarded}
					subject={subject}
				/>
			)}
		</View>
	)
}
