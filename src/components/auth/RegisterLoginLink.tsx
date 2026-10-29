import { Pressable, Text, View } from 'react-native'

type RegisterLoginLinkProps = {
	onLogin: () => void
}

export function RegisterLoginLink({ onLogin }: RegisterLoginLinkProps) {
	return (
		<View className='mt-6 flex-row flex-wrap items-center justify-center'>
			<Text className='text-sm text-tinta-2'>¿Ya tienes una cuenta? </Text>

			<Pressable
				onPress={onLogin}
				className='rounded-lg py-1'
				accessibilityRole='button'
			>
				<Text className='text-sm font-bold text-esmeralda'>Inicia sesión</Text>
			</Pressable>
		</View>
	)
}
