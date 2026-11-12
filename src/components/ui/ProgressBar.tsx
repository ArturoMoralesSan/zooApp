import { View } from 'react-native'

type ProgressBarProps = {
	// 0–1.
	progress: number
	size?: 'md' | 'sm'
	accessibilityLabel?: string
	className?: string
}

const heights = { md: 'h-2.5', sm: 'h-1.5' }

// Esmeralda fill on a Card border track, fully rounded.
export function ProgressBar({
	progress,
	size = 'md',
	accessibilityLabel,
	className = '',
}: ProgressBarProps) {
	const percent = Math.round(Math.min(1, Math.max(0, progress)) * 100)

	return (
		<View
			accessible
			accessibilityRole='progressbar'
			accessibilityLabel={accessibilityLabel}
			accessibilityValue={{ min: 0, max: 100, now: percent }}
			className={`overflow-hidden rounded-full bg-card-border ${heights[size]} ${className}`}
		>
			<View
				className='h-full rounded-full bg-esmeralda'
				style={{ width: `${percent}%` }}
			/>
		</View>
	)
}
