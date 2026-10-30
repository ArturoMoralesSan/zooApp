import { FocusRing, useFocusRing } from '@/components/ui/FocusRing'
import { Icon } from '@/components/ui/Icon'
import colors from '@/theme/colors'
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'
import { Animated, Pressable } from 'react-native'

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

const variants = {
	soft: 'border-1.5 border-card-border bg-niebla active:bg-hoja',
	outline: 'border-1.5 border-input-border bg-blanco active:bg-hoja',
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
	const { focused, focusProps } = useFocusRing()

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
			<Pressable
				onPress={onPress}
				hitSlop={4}
				accessibilityRole='button'
				accessibilityLabel={accessibilityLabel}
				{...focusProps}
				className={`h-10 w-10 items-center justify-center rounded-xl ${focused ? 'border-2 border-bosque bg-blanco' : variants[variant]}`}
			>
				<Icon icon={ArrowLeft01Icon} color={colors.bosque} strong />
			</Pressable>

			<FocusRing visible={focused} />
		</Animated.View>
	)
}
