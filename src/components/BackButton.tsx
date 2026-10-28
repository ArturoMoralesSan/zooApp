import colors from '@/theme/colors'
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { Animated, Pressable } from 'react-native'

type BackButtonProps = {
	onPress: () => void
	opacity?: Animated.AnimatedInterpolation<number> | number
	backgroundColor?: string
	iconColor?: string
	position?: 'absolute' | 'relative'
	top?: number
	left?: number
}

export default function BackButton({
	onPress,
	opacity = 1,
	backgroundColor = colors.niebla,
	iconColor = '#1E4930',
	position = 'absolute',
	top = 56,
	left = 20,
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
			<Pressable
				onPress={onPress}
				hitSlop={8}
				android_ripple={{ color: '#DCE7DF' }}
				className='h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-[#DCE7DF]'
				style={{ backgroundColor }}
			>
				<HugeiconsIcon
					icon={ArrowLeft01Icon}
					size={27}
					color={iconColor}
					strokeWidth={2}
				/>
			</Pressable>
		</Animated.View>
	)
}
