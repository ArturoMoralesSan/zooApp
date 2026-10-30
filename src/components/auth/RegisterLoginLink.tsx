import { Pressable, Text, View } from 'react-native'

type RegisterLoginLinkProps = {
	onLogin: () => void
}

export function RegisterLoginLink({ onLogin }: RegisterLoginLinkProps) {
	return (
		<View className='mt-6 flex-row flex-wrap items-center justify-center'>
			<Text className='text-body text-tinta-2'>¿Ya tienes una cuenta? </Text>

			<Pressable
				onPress={onLogin}
				className='rounded-lg py-1'
				accessibilityRole='button'
			>
				<Text className='font-sans-bold text-[14px] leading-[1.5] text-esmeralda'>
					Inicia sesión
				</Text>
			</Pressable>
		</View>
	)
}
