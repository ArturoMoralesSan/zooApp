import { Text, View } from 'react-native'

export function RegisterHeader() {
	return (
		<View className='items-center'>
			<Text className='text-center text-[26px] font-bold leading-8 text-bosque'>
				Crea tu cuenta
			</Text>

			<Text className='mt-2 text-center text-sm text-tinta-2'>
				Únete a ZooApp y comienza a descubrir el zoológico.
			</Text>
		</View>
	)
}
