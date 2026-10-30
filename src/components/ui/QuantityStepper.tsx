import { FocusRing, useFocusRing } from '@/components/ui/FocusRing'
import { Icon } from '@/components/ui/Icon'
import colors from '@/theme/colors'
import { Add01Icon, MinusSignIcon } from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react-native'
import { Pressable, Text, View } from 'react-native'

type QuantityStepperProps = {
	value: number
	onChange: (value: number) => void
	min?: number
	max?: number
	// Names what is being counted, for the buttons' labels ("boleto de Adulto").
	itemLabel: string
}

type StepButtonProps = {
	icon: IconSvgElement
	variant: 'outline' | 'solid'
	disabled: boolean
	onPress: () => void
	accessibilityLabel: string
}

function StepButton({
	icon,
	variant,
	disabled,
	onPress,
	accessibilityLabel,
}: StepButtonProps) {
	const { focused, focusProps } = useFocusRing()

	const look = disabled
		? 'border-1.5 border-card-border bg-niebla'
		: focused
			? `border-2 border-bosque ${variant === 'solid' ? 'bg-esmeralda' : 'bg-blanco'}`
			: variant === 'solid'
				? 'border-1.5 border-esmeralda bg-esmeralda active:bg-bosque'
				: 'border-1.5 border-input-border bg-blanco active:bg-hoja'

	const iconColor = disabled
		? colors.apagado
		: variant === 'solid'
			? colors.blanco
			: colors.bosque

	return (
		<View>
			<Pressable
				onPress={onPress}
				disabled={disabled}
				accessibilityRole='button'
				accessibilityLabel={accessibilityLabel}
				accessibilityState={{ disabled }}
				{...focusProps}
				className={`h-10 w-10 items-center justify-center rounded-xl ${look}`}
			>
				<Icon icon={icon} size={20} color={iconColor} strong />
			</Pressable>

			<FocusRing visible={focused} />
		</View>
	)
}

// 40 × 40 buttons, 8px apart, around the current value.
export function QuantityStepper({
	value,
	onChange,
	min = 0,
	max = Number.POSITIVE_INFINITY,
	itemLabel,
}: QuantityStepperProps) {
	return (
		<View className='shrink-0 flex-row items-center gap-2'>
			<StepButton
				icon={MinusSignIcon}
				variant='outline'
				disabled={value <= min}
				onPress={() => onChange(value - 1)}
				accessibilityLabel={`Restar ${itemLabel}`}
			/>

			<Text
				className='min-w-8 text-center font-display text-[20px] text-tinta'
				accessibilityLabel={`${value} ${itemLabel}`}
			>
				{value}
			</Text>

			<StepButton
				icon={Add01Icon}
				variant='solid'
				disabled={value >= max}
				onPress={() => onChange(value + 1)}
				accessibilityLabel={`Agregar ${itemLabel}`}
			/>
		</View>
	)
}
