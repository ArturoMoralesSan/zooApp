import { Pressable, Switch, Text, View } from 'react-native'

import { FocusRing, useFocusRing } from '@/components/ui/FocusRing'
import colors from '@/theme/colors'

type ToggleProps = {
	label: string
	description?: string
	value: boolean
	onValueChange: (value: boolean) => void
	disabled?: boolean
	className?: string
}

// Setting row: text and a switch; the whole row toggles it.
export function Toggle({
	label,
	description,
	value,
	onValueChange,
	disabled = false,
	className = '',
}: ToggleProps) {
	const { focused, focusProps } = useFocusRing()

	return (
		<Pressable
			{...focusProps}
			onPress={() => onValueChange(!value)}
			disabled={disabled}
			accessibilityRole='switch'
			accessibilityLabel={label}
			accessibilityHint={description}
			accessibilityState={{ checked: value, disabled }}
			className={`min-h-14 flex-row items-center gap-3 rounded-2xl border-1.5 bg-niebla px-4 py-3 active:bg-hoja ${focused ? 'border-bosque' : 'border-card-border'} ${className}`}
		>
			<View style={{ flex: 1, minWidth: 0 }}>
				<Text className='text-h3 text-tinta'>{label}</Text>

				{description && <Text className='text-meta mt-1'>{description}</Text>}
			</View>

			{/* The row handles the press, so the switch is only the indicator. */}
			<View
				pointerEvents='none'
				importantForAccessibility='no-hide-descendants'
			>
				<Switch
					value={value}
					disabled={disabled}
					trackColor={{ false: colors.cardBorder, true: colors.esmeralda }}
					thumbColor={colors.blanco}
				/>
			</View>

			<FocusRing visible={focused} radiusClassName='rounded-[19px]' />
		</Pressable>
	)
}
