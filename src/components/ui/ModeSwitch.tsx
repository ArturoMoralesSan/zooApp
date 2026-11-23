import type { IconSvgElement } from '@hugeicons/react-native'
import { Pressable, Text, View } from 'react-native'

import { FocusRing, useFocusRing } from '@/components/ui/FocusRing'
import { Icon } from '@/components/ui/Icon'
import colors from '@/theme/colors'

export type ModeSwitchOption<K extends string> = {
	value: K
	icon: IconSvgElement
	// Read by screen readers; also shown when `showLabels` is set.
	label: string
}

type ModeSwitchProps<K extends string> = {
	options: ModeSwitchOption<K>[]
	value: K
	onChange: (value: K) => void
	// Icon and label in each option, instead of the icon alone.
	showLabels?: boolean
	disabled?: boolean
	className?: string
}

// "Selector de vista" (DS p.7): options in a white bordered pill, the chosen
// one solid Esmeralda. Solid white, so it also reads over the camera.
export function ModeSwitch<K extends string>({
	options,
	value,
	onChange,
	showLabels = false,
	disabled = false,
	className = '',
}: ModeSwitchProps<K>) {
	return (
		<View
			accessibilityRole='radiogroup'
			className={`flex-row gap-1 rounded-2xl border-1.5 border-card-border bg-blanco p-1 ${disabled ? 'opacity-60' : ''} ${className}`}
		>
			{options.map((option) => (
				<ModeOption
					key={option.value}
					{...option}
					showLabel={showLabels}
					selected={value === option.value}
					disabled={disabled}
					// Choosing the current option again does nothing.
					onPress={() => {
						if (option.value !== value) onChange(option.value)
					}}
				/>
			))}
		</View>
	)
}

type ModeOptionProps = {
	icon: IconSvgElement
	label: string
	showLabel: boolean
	selected: boolean
	disabled: boolean
	onPress: () => void
}

function ModeOption({
	icon,
	label,
	showLabel,
	selected,
	disabled,
	onPress,
}: ModeOptionProps) {
	const { focused, focusProps } = useFocusRing()

	return (
		<View>
			<Pressable
				onPress={onPress}
				disabled={disabled}
				accessibilityRole='radio'
				accessibilityState={{ checked: selected, disabled }}
				accessibilityLabel={label}
				{...focusProps}
				className={`h-12 flex-row items-center justify-center gap-2 rounded-xl active:opacity-80 ${showLabel ? 'px-4' : 'w-12'} ${selected ? 'bg-esmeralda' : 'bg-blanco'} ${focused ? 'border-2 border-bosque' : ''}`}
			>
				<Icon
					icon={icon}
					color={selected ? colors.blanco : colors.tinta2}
					strong={selected}
				/>
				{showLabel && (
					<Text
						className={`text-button ${selected ? 'text-blanco' : 'text-tinta-2'}`}
					>
						{label}
					</Text>
				)}
			</Pressable>

			<FocusRing visible={focused} radiusClassName='rounded-[15px]' />
		</View>
	)
}
