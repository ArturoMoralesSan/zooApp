import { type User } from '@/services/auth'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { StatCard } from '@/components/ui/StatCard'
import { Animated, ImageBackground, Text, View } from 'react-native'

type ProfileProgressProps = {
	progressMarginTop: Animated.AnimatedInterpolation<number>
	user: User | null
	points: number
	currentLevel: string
	progress: number
	pointsToNextLevel: number
	nextLevel: string
}

export function ProfileProgress({
	progressMarginTop,
	user,
	points,
	currentLevel,
	progress,
	pointsToNextLevel,
	nextLevel,
}: ProfileProgressProps) {
	return (
		<Animated.View
			className='relative z-10 overflow-hidden rounded-t-3xl bg-blanco'
			style={{ marginTop: progressMarginTop }}
		>
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				resizeMode='repeat'
				imageClassName='opacity-[0.12]'
				className='bg-blanco'
			>
				<View className='px-5 pb-7 pt-6'>
					<SectionTitle
						title='Tu progreso'
						subtitle='Sigue acumulando puntos en ZooApp.'
						className=''
					/>

					<View className='mt-5 flex-row gap-3'>
						<StatCard
							layout='overline'
							tone='brand'
							value={points}
							label='Puntos'
						/>

						<StatCard layout='overline' value={currentLevel} label='Nivel' />
					</View>

					{user?.gamification?.next_level && (
						<Card className='mt-3'>
							<View className='flex-row items-center justify-between'>
								<Text className='flex-1 font-sans-semibold text-[14px] text-tinta'>
									Progreso al siguiente nivel
								</Text>

								<Badge label={`${progress}%`} tone='success' />
							</View>

							<View className='mt-3 h-2.5 overflow-hidden rounded-full bg-card-border'>
								<View
									className='h-full rounded-full bg-esmeralda'
									style={{ width: `${progress}%` }}
								/>
							</View>

							<Text className='text-body mt-3 text-tinta'>
								Te faltan{' '}
								<Text className='font-sans-bold text-tinta'>
									{pointsToNextLevel}
								</Text>{' '}
								puntos para{' '}
								<Text className='font-sans-semibold text-tinta'>
									{nextLevel}
								</Text>
								.
							</Text>
						</Card>
					)}
				</View>
			</ImageBackground>
		</Animated.View>
	)
}
