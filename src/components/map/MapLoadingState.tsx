import { ActivityIndicator, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import colors from '@/theme/colors'
import { mapShadow } from '@/components/map/mapShadow'

export function MapLoadingState() {
	return (
		<SafeAreaView className='flex-1 items-center justify-center bg-screen px-6'>
			<View
				className='w-full max-w-[320px] items-center justify-center rounded-3xl bg-niebla px-6 py-[30px]'
				style={mapShadow}
			>
				<ActivityIndicator size='large' color={colors.esmeralda} />

				<Text className='text-body mt-3.5 text-tinta-2'>Cargando mapa...</Text>
			</View>
		</SafeAreaView>
	)
}
