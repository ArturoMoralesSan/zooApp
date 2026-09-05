import { Link, Stack } from 'expo-router'
import { View } from 'react-native'

export default function NotFoundScreen() {
	return (
		<>
			<Stack.Screen options={{ title: 'Página no encontrada.' }} />
			<View className='flex-1 items-center justify-center'>
				<View className='text-xl underline'>
					<Link href='/'>Regresar a página de inicio.</Link>
				</View>
			</View>
		</>
	)
}
