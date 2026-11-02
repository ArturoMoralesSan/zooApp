import type { IconSvgElement } from '@hugeicons/react-native'
import { Pressable, Text, View } from 'react-native'

import { FocusRing, useFocusRing } from '@/components/ui/FocusRing'
import { Icon } from '@/components/ui/Icon'
import colors from '@/theme/colors'

type RoundActionProps = {
	icon: IconSvgElement
	label: string
	onPress: () => void
	className?: string
}

// 56dp round outline button with its label underneath ("Ver en AR",
// "Selfie" in A-26/A-27).
export function RoundAction({
	icon,
	label,
	onPress,
	className = '',
}: RoundActionProps) {
	const { focused, focusProps } = useFocusRing()

	return (
		<View className={`items-center gap-1.5 ${className}`}>
			<View>
				<Pressable
					onPress={onPress}
					accessibilityRole='button'
					accessibilityLabel={label}
					{...focusProps}
					className={`h-14 w-14 items-center justify-center rounded-full bg-blanco active:bg-niebla ${focused ? 'border-2 border-bosque' : 'border-1.5 border-input-border'}`}
				>
					<Icon icon={icon} color={colors.bosque} />
				</Pressable>

				<FocusRing visible={focused} radiusClassName='rounded-full' />
			</View>

			<Text className='font-sans-bold text-[12px] text-tinta'>{label}</Text>
		</View>
	)
}
