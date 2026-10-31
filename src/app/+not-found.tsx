import { Home01Icon, MapsSearchIcon } from '@hugeicons/core-free-icons'
import { router, Stack } from 'expo-router'
import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Button } from '@/components/ui/Button'
import { IconBox } from '@/components/ui/IconBox'

// A-44: "404" in Hoja, map-search tile, title, text and a way home.
export default function NotFoundScreen() {
	return (
		<>
			<Stack.Screen options={{ title: 'Página no encontrada' }} />
			<SafeAreaView className='flex-1 justify-center bg-screen px-5'>
				<View className='items-center'>
					<Text
						className='font-display-x text-[64px] leading-[72px] text-hoja'
						accessible={false}
					>
						404
					</Text>

					<IconBox icon={MapsSearchIcon} size='lg' className='mt-2' />

					<Text className='text-h2 mt-4 text-center text-bosque'>
						Página no encontrada
					</Text>

					<Text className='text-body mt-2 text-center text-tinta'>
						Parece que este camino no lleva a ningún recinto.
					</Text>
				</View>

				<Button
					title='Regresar a página de inicio'
					icon={Home01Icon}
					iconPosition='leading'
					onPress={() => router.replace('/')}
					className='mt-6'
				/>
			</SafeAreaView>
		</>
	)
}
