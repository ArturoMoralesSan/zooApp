import type { IconSvgElement } from '@hugeicons/react-native'
import { Pressable, Text, View } from 'react-native'

import { FocusRing, useFocusRing } from '@/components/ui/FocusRing'
import { Icon } from '@/components/ui/Icon'
import colors from '@/theme/colors'

type RoundActionProps = {
	icon: IconSvgElement
	label: string
	onPress: () => void
	// Looks disabled (Button's disabled colours) but still takes the press,
	// so the screen can say why it isn't available.
	unavailable?: boolean
	// Read by screen readers after the label, e.g. why it's unavailable.
	accessibilityHint?: string
	className?: string
}

// 56dp round outline button with its label underneath ("Ver en AR",
// "Selfie" in A-26/A-27).
export function RoundAction({
	icon,
	label,
	onPress,
	unavailable = false,
	accessibilityHint,
	className = '',
}: RoundActionProps) {
	const { focused, focusProps } = useFocusRing()

	const look = focused
		? 'border-2 border-bosque'
		: unavailable
			? 'border-1.5 border-apagado'
			: 'border-1.5 border-input-border'

	return (
		<View className={`items-center gap-1.5 ${className}`}>
			<View>
				<Pressable
					onPress={onPress}
					accessibilityRole='button'
					accessibilityLabel={label}
					accessibilityHint={accessibilityHint}
					{...focusProps}
					className={`h-14 w-14 items-center justify-center rounded-full ${unavailable ? 'bg-niebla' : 'bg-blanco active:bg-niebla'} ${look}`}
				>
					<Icon
						icon={icon}
						color={unavailable ? colors.apagado : colors.bosque}
					/>
				</Pressable>

				<FocusRing visible={focused} radiusClassName='rounded-full' />
			</View>

			<Text
				className={`font-sans-bold text-[12px] ${unavailable ? 'text-apagado' : 'text-tinta'}`}
			>
				{label}
			</Text>
		</View>
	)
}
