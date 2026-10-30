import { IconButton } from '@/components/ui/IconButton'
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'
import { Animated } from 'react-native'

type BackButtonProps = {
	onPress: () => void
	opacity?: Animated.AnimatedInterpolation<number> | number
	// soft: Niebla on light screens; outline: white, for photos and patterns.
	variant?: 'soft' | 'outline'
	position?: 'absolute' | 'relative'
	top?: number
	left?: number
	accessibilityLabel?: string
}

// 40 × 40, radius 12.
export default function BackButton({
	onPress,
	opacity = 1,
	variant = 'soft',
	position = 'absolute',
	top = 56,
	left = 20,
	accessibilityLabel = 'Regresar',
}: BackButtonProps) {
	return (
		// Animated.View keeps inline styles: opacity is animated and
		// position/top/left come from props.
		<Animated.View
			style={{
				position,
				...(position === 'absolute' ? { left, top, zIndex: 20 } : {}),
				opacity,
				alignSelf: 'flex-start',
			}}
		>
			<IconButton
				icon={ArrowLeft01Icon}
				onPress={onPress}
				variant={variant}
				accessibilityLabel={accessibilityLabel}
			/>
		</Animated.View>
	)
}
