import { type User } from '@/services/auth'
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
			className='relative z-10 overflow-hidden rounded-t-[30px] bg-blanco'
			style={{ marginTop: progressMarginTop }}
		>
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				resizeMode='repeat'
				imageClassName='opacity-[0.12]'
				className='bg-blanco'
			>
				<View className='px-5 pb-7 pt-6'>
					<Text className='text-h2 text-tinta'>Tu progreso</Text>

					<Text className='text-body mt-1 text-tinta'>
						Sigue acumulando puntos en ZooApp.
					</Text>

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
						<View className='mt-5 rounded-[18px] border-1.5 border-card-border bg-niebla p-4'>
							<View className='flex-row items-center justify-between'>
								<Text className='flex-1 font-sans-semibold text-[14px] text-tinta'>
									Progreso al siguiente nivel
								</Text>

								<View className='self-start rounded-full bg-lima px-2.5 py-1'>
									<Text className='font-display-x text-[12px] text-tinta'>
										{progress}%
									</Text>
								</View>
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
						</View>
					)}
				</View>
			</ImageBackground>
		</Animated.View>
	)
}
