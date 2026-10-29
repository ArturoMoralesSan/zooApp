import colors from '@/theme/colors'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react-native'
import { type ReactNode, useState } from 'react'
import { Text, TextInput, type TextInputProps, View } from 'react-native'

export type TextFieldProps = Omit<
	TextInputProps,
	'onFocus' | 'onBlur' | 'placeholderTextColor' | 'className'
> & {
	label: string
	icon: IconSvgElement
	error?: string
	invalid?: boolean
	highlightOnFocus?: boolean
	iconColor?: string
	iconErrorColor?: string
	labelClassName?: string
	renderTrailing?: (state: { focused: boolean }) => ReactNode
}

export function TextField({
	label,
	icon,
	error,
	invalid = Boolean(error),
	highlightOnFocus = true,
	iconColor = colors.tinta2,
	iconErrorColor,
	labelClassName = 'mb-2 mt-4 text-xs font-semibold text-tinta',
	renderTrailing,
	...inputProps
}: TextFieldProps) {
	const [focused, setFocused] = useState(false)

	const highlighted = highlightOnFocus && focused

	return (
		<>
			<Text className={labelClassName}>{label}</Text>

			<View
				className={`flex-row items-center rounded-xl bg-blanco ${focused ? 'border-2' : 'border'} ${invalid ? 'border-error' : highlighted ? 'border-esmeralda' : 'border-input-border'}`}
			>
				<View className='pl-3.5'>
					<HugeiconsIcon
						icon={icon}
						size={20}
						strokeWidth={1.8}
						color={
							invalid && iconErrorColor
								? iconErrorColor
								: highlighted
									? colors.esmeralda
									: iconColor
						}
					/>
				</View>

				<TextInput
					{...inputProps}
					onFocus={() => setFocused(true)}
					onBlur={() => setFocused(false)}
					placeholderTextColor={colors.apagado}
					className='min-h-12 flex-1 px-2.5 py-2.5 text-sm text-tinta'
				/>

				{renderTrailing?.({ focused })}
			</View>

			{error && <Text className='mt-1 text-xs text-error'>{error}</Text>}
		</>
	)
}
