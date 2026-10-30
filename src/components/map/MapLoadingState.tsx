import { Card } from '@/components/ui/Card'
import { ActivityIndicator, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import colors from '@/theme/colors'

export function MapLoadingState() {
	return (
		<SafeAreaView className='flex-1 items-center justify-center bg-screen px-6'>
			<Card className='w-full max-w-[320px] items-center justify-center py-8'>
				<ActivityIndicator size='large' color={colors.esmeralda} />

				<Text className='text-body mt-3.5 text-tinta-2'>Cargando mapa...</Text>
			</Card>
		</SafeAreaView>
	)
}
