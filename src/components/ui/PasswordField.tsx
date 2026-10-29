import colors from '@/theme/colors'
import { ViewIcon, ViewOffSlashIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { useState } from 'react'
import { Pressable } from 'react-native'

import { TextField, type TextFieldProps } from '@/components/ui/TextField'

type PasswordFieldProps = Omit<
	TextFieldProps,
	'secureTextEntry' | 'renderTrailing'
> & {
	showLabel?: string
	hideLabel?: string
}

export function PasswordField({
	showLabel = 'Mostrar contraseña',
	hideLabel = 'Ocultar contraseña',
	...fieldProps
}: PasswordFieldProps) {
	const [showPassword, setShowPassword] = useState(false)

	const { highlightOnFocus = true, iconColor = colors.tinta2 } = fieldProps

	return (
		<TextField
			{...fieldProps}
			secureTextEntry={!showPassword}
			renderTrailing={({ focused }) => (
				<Pressable
					onPress={() => setShowPassword((value) => !value)}
					className='mr-2 items-center justify-center rounded-xl p-2'
					hitSlop={8}
					accessibilityRole='button'
					accessibilityLabel={showPassword ? hideLabel : showLabel}
				>
					<HugeiconsIcon
						icon={showPassword ? ViewOffSlashIcon : ViewIcon}
						size={21}
						strokeWidth={1.8}
						color={highlightOnFocus && focused ? colors.esmeralda : iconColor}
					/>
				</Pressable>
			)}
		/>
	)
}
