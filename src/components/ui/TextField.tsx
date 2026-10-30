import { FocusRing } from '@/components/ui/FocusRing'
import { Icon } from '@/components/ui/Icon'
import colors from '@/theme/colors'
import type { IconSvgElement } from '@hugeicons/react-native'
import { type ReactNode, useState } from 'react'
import {
	Pressable,
	Text,
	TextInput,
	type TextInputProps,
	View,
} from 'react-native'

export type TextFieldProps = Omit<
	TextInputProps,
	'onFocus' | 'onBlur' | 'placeholderTextColor' | 'className' | 'onPress'
> & {
	// Omit to render only the input box (e.g. SearchField).
	label?: string
	icon?: IconSvgElement
	error?: string
	invalid?: boolean
	// Turns the field into a button that opens a picker (dates, options):
	// the value is shown read-only and the whole box is pressable.
	onPress?: () => void
	// Spacing around the field group; fields are 20px apart by default.
	className?: string
	renderTrailing?: (state: { focused: boolean }) => ReactNode
}

// 52px input with a 1.5px Borde de input border, a 14/600 label 8px above
// and the error text below. Focus switches to a 2px Bosque border plus the
// Lima ring.
export function TextField({
	label,
	icon,
	error,
	invalid = Boolean(error),
	onPress,
	className = 'mt-5',
	renderTrailing,
	...inputProps
}: TextFieldProps) {
	const [focused, setFocused] = useState(false)

	const borderClassName = focused
		? `border-2 ${invalid ? 'border-error' : 'border-bosque'}`
		: `border-1.5 ${invalid ? 'border-error' : 'border-input-border'}`

	const box = (
		<View
			className={`h-[52px] flex-row items-center rounded-xl bg-blanco ${borderClassName}`}
		>
			{icon && (
				<View className='pl-3.5'>
					<Icon
						icon={icon}
						size={20}
						color={invalid ? colors.error : colors.tinta2}
					/>
				</View>
			)}

			<TextInput
				{...inputProps}
				editable={onPress ? false : inputProps.editable}
				pointerEvents={onPress ? 'none' : 'auto'}
				onFocus={() => setFocused(true)}
				onBlur={() => setFocused(false)}
				placeholderTextColor={colors.apagado}
				className={`h-full flex-1 py-0 font-sans text-[16px] text-tinta ${icon ? 'pl-2.5' : 'pl-4'} ${renderTrailing ? 'pr-1' : 'pr-4'}`}
			/>

			{renderTrailing?.({ focused })}
		</View>
	)

	return (
		<View className={className}>
			{label && (
				<Text className='mb-2 font-sans-semibold text-[14px] text-tinta'>
					{label}
				</Text>
			)}

			<View>
				{onPress ? (
					<Pressable
						onPress={onPress}
						onFocus={() => setFocused(true)}
						onBlur={() => setFocused(false)}
						accessibilityRole='button'
						accessibilityLabel={label}
						accessibilityHint={inputProps.value || inputProps.placeholder}
					>
						{box}
					</Pressable>
				) : (
					box
				)}

				<FocusRing visible={focused} />
			</View>

			{error && <Text className='text-meta mt-1.5 text-error'>{error}</Text>}
		</View>
	)
}
