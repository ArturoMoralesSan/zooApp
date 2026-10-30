import { FocusRing, useFocusRing } from '@/components/ui/FocusRing'
import { Pressable, Text, View } from 'react-native'

type TextLinkProps = {
	label: string
	onPress: () => void
	className?: string
}

// Underlined Esmeralda link with a 40px touch target.
export function TextLink({
	label,
	onPress,
	className = 'self-start',
}: TextLinkProps) {
	const { focused, focusProps } = useFocusRing()

	return (
		<View className={className}>
			<Pressable
				onPress={onPress}
				accessibilityRole='link'
				{...focusProps}
				className={`h-10 justify-center rounded-lg px-1 active:opacity-70 ${focused ? 'border-2 border-bosque' : ''}`}
			>
				<Text className='font-sans-bold text-[14px] text-esmeralda underline'>
					{label}
				</Text>
			</Pressable>

			<FocusRing visible={focused} radiusClassName='rounded-[11px]' />
		</View>
	)
}
