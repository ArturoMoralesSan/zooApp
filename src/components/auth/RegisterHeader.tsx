import { Text, View } from 'react-native'

export function RegisterHeader() {
	return (
		<View className='items-center'>
			<Text className='text-h1 text-center'>Crea tu cuenta</Text>

			<Text className='text-subtitle mt-2 text-center'>
				Únete a ZooApp y comienza a descubrir el zoológico.
			</Text>
		</View>
	)
}
