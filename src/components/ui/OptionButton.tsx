import { FocusRing, useFocusRing } from '@/components/ui/FocusRing'
import type { ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'

type OptionButtonProps = {
	selected: boolean
	onPress: () => void
	// Short option (amounts) or rich content (payment method row).
	label?: string
	children?: ReactNode
	// Dashed border for an open-ended choice such as "Otra".
	dashed?: boolean
	accessibilityLabel?: string
	className?: string
}

// Selectable option: 2px Borde de input, radius 12; selected is solid
// Esmeralda for short labels and an Esmeralda border on Hoja for rich rows.
export function OptionButton({
	selected,
	onPress,
	label,
	children,
	dashed = false,
	accessibilityLabel,
	className = '',
}: OptionButtonProps) {
	const { focused, focusProps } = useFocusRing()
	const rich = children !== undefined

	const background = selected
		? rich
			? 'bg-hoja'
			: 'bg-esmeralda'
		: 'bg-blanco'
	const border = focused
		? 'border-bosque'
		: selected
			? 'border-esmeralda'
			: `border-input-border ${dashed ? 'border-dashed' : ''}`

	return (
		<View className={className}>
			<Pressable
				onPress={onPress}
				accessibilityRole='radio'
				accessibilityState={{ checked: selected }}
				accessibilityLabel={accessibilityLabel ?? label}
				{...focusProps}
				className={`min-h-[52px] justify-center rounded-xl border-2 active:opacity-80 ${rich ? 'p-4' : 'items-center px-2'} ${background} ${border}`}
			>
				{rich ? (
					children
				) : (
					<Text
						numberOfLines={1}
						adjustsFontSizeToFit
						className={`text-center font-display text-[17px] ${selected ? 'text-blanco' : 'text-bosque'}`}
					>
						{label}
					</Text>
				)}
			</Pressable>

			<FocusRing visible={focused} />
		</View>
	)
}
