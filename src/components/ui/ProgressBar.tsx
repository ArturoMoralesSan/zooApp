import { View } from 'react-native'

type ProgressBarProps = {
	// 0–1.
	progress: number
	size?: 'md' | 'sm'
	// onDark: Lima fill on a translucent white track, for Esmeralda/Bosque panels.
	tone?: 'default' | 'onDark'
	accessibilityLabel?: string
	className?: string
}

const heights = { md: 'h-2.5', sm: 'h-1.5' }

const tones = {
	default: { track: 'bg-card-border', fill: 'bg-esmeralda' },
	onDark: { track: 'bg-blanco/25', fill: 'bg-lima' },
}

// Esmeralda fill on a Card border track, fully rounded.
export function ProgressBar({
	progress,
	size = 'md',
	tone = 'default',
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
			className={`overflow-hidden rounded-full ${tones[tone].track} ${heights[size]} ${className}`}
		>
			<View
				className={`h-full rounded-full ${tones[tone].fill}`}
				style={{ width: `${percent}%` }}
			/>
		</View>
	)
}
