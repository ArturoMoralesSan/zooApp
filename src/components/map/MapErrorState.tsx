import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { mapShadow } from '@/components/map/mapShadow'

type MapErrorStateProps = {
	error: string
}

export function MapErrorState({ error }: MapErrorStateProps) {
	return (
		<SafeAreaView className='flex-1 items-center justify-center bg-screen px-6'>
			<View
				className='w-full max-w-[360px] items-center rounded-3xl border border-error-border bg-error-bg px-6 py-7'
				style={mapShadow}
			>
				<View className='mb-3.5 h-[52px] w-[52px] items-center justify-center rounded-[18px] bg-error-border'>
					<Text className='text-[28px] font-extrabold text-error'>!</Text>
				</View>

				<Text className='mb-2 text-center text-[20px] font-extrabold text-tinta'>
					No fue posible cargar el mapa
				</Text>

				<Text className='text-center text-[14px] leading-[21px] text-tinta-2'>
					{error}
				</Text>
			</View>
		</SafeAreaView>
	)
}
