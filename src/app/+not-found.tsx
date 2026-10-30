import { router, Stack } from 'expo-router'
import { View } from 'react-native'

import { TextLink } from '@/components/ui/TextLink'

export default function NotFoundScreen() {
	return (
		<>
			<Stack.Screen options={{ title: 'Página no encontrada.' }} />
			<View className='flex-1 items-center justify-center'>
				<TextLink
					label='Regresar a página de inicio.'
					onPress={() => router.replace('/')}
					className='self-center'
				/>
			</View>
		</>
	)
}
