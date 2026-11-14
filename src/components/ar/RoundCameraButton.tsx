import type { IconSvgElement } from '@hugeicons/react-native'
import { Pressable, View } from 'react-native'

import { FocusRing, useFocusRing } from '@/components/ui/FocusRing'
import { Icon } from '@/components/ui/Icon'
import colors from '@/theme/colors'

type RoundCameraButtonProps = {
	icon: IconSvgElement
	label: string
	onPress: () => void
	tone: 'white' | 'lima'
}

// 52dp round button over the camera (DS p.7), white or Lima.
export function RoundCameraButton({
	icon,
	label,
	onPress,
	tone,
}: RoundCameraButtonProps) {
	const { focused, focusProps } = useFocusRing()

	return (
		<View>
			<Pressable
				onPress={onPress}
				accessibilityRole='button'
				accessibilityLabel={label}
				{...focusProps}
				className={`h-[52px] w-[52px] items-center justify-center rounded-full active:opacity-80 ${tone === 'lima' ? 'bg-lima' : 'bg-blanco'} ${focused ? 'border-2 border-bosque' : ''}`}
			>
				<Icon icon={icon} color={colors.bosque} strong />
			</Pressable>

			<FocusRing visible={focused} radiusClassName='rounded-full' />
		</View>
	)
}
