import type { ReactNode } from 'react'
import { Text, View } from 'react-native'

import { ProgressBar } from '@/components/ui/ProgressBar'

type LevelCardProps = {
	level: string
	points: number
	// 0–1; the screen passes 1 once the top level is reached.
	progress: number
	pointsToNextLevel: number
	// The "te faltan" line is hidden without it (top level, or no data).
	nextLevel?: string
	// Under the progress (the points season chip).
	footer?: ReactNode
}

// A-06 header card: current level and points on Esmeralda, with the Lima
// progress toward the next level.
export function LevelCard({
	level,
	points,
	progress,
	pointsToNextLevel,
	nextLevel,
	footer,
}: LevelCardProps) {
	return (
		<View className='rounded-2xl border-1.5 border-esmeralda bg-esmeralda p-4'>
			{/* Grouped apart from the footer, which has its own button. */}
			<View
				accessible
				accessibilityLabel={`Nivel actual ${level}, ${points} puntos`}
			>
				<View className='flex-row items-end justify-between gap-3'>
					<View className='min-w-0 flex-1'>
						<Text className='text-overline text-hoja'>Nivel actual</Text>
						<Text
							className='mt-1 font-display text-[22px] text-blanco'
							numberOfLines={1}
						>
							{level}
						</Text>
					</View>

					<View className='items-end'>
						<Text className='text-overline text-hoja'>Puntos</Text>
						<Text className='mt-1 font-display text-[22px] text-blanco'>
							{points.toLocaleString('es-MX')}
						</Text>
					</View>
				</View>

				<ProgressBar
					progress={progress}
					tone='onDark'
					accessibilityLabel='Progreso al siguiente nivel'
					className='mt-3'
				/>

				{nextLevel && (
					<Text className='text-meta mt-3 text-blanco'>
						Te faltan{' '}
						<Text className='font-sans-bold text-blanco'>
							{pointsToNextLevel.toLocaleString('es-MX')}
						</Text>{' '}
						puntos para{' '}
						<Text className='font-sans-bold text-blanco'>{nextLevel}</Text>
					</Text>
				)}
			</View>

			{footer && <View className='mt-3'>{footer}</View>}
		</View>
	)
}
