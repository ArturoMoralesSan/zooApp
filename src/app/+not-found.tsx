import { Link, Stack } from 'expo-router'
import { Text, View } from 'react-native'

export default function NotFoundScreen() {
	return (
		<>
			<Stack.Screen options={{ title: 'Página no encontrada.' }} />
			<View className='flex-1 items-center justify-center'>
				<View>
					<Link href='/' asChild>
						<Text className='text-button text-esmeralda underline'>
							Regresar a página de inicio.
						</Text>
					</Link>
				</View>
			</View>
		</>
	)
}
