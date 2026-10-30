import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import { TextField, type TextFieldProps } from '@/components/ui/TextField'

type PasswordFieldProps = Omit<
	TextFieldProps,
	'secureTextEntry' | 'renderTrailing' | 'onPress'
> & {
	showLabel?: string
	hideLabel?: string
}

// TextField with a "Ver / Ocultar" text toggle: text, not just an eye icon,
// so the action never depends on recognising a glyph.
export function PasswordField({
	showLabel = 'Mostrar contraseña',
	hideLabel = 'Ocultar contraseña',
	...fieldProps
}: PasswordFieldProps) {
	const [showPassword, setShowPassword] = useState(false)

	return (
		<TextField
			{...fieldProps}
			secureTextEntry={!showPassword}
			renderTrailing={() => (
				<Pressable
					onPress={() => setShowPassword((value) => !value)}
					className='mr-1.5 h-10 justify-center'
					accessibilityRole='button'
					accessibilityLabel={showPassword ? hideLabel : showLabel}
				>
					<View className='h-8 justify-center rounded-lg bg-hoja px-3 active:bg-card-border'>
						<Text className='font-sans-bold text-[14px] text-bosque'>
							{showPassword ? 'Ocultar' : 'Ver'}
						</Text>
					</View>
				</Pressable>
			)}
		/>
	)
}
