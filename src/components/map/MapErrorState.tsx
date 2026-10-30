import { Card } from '@/components/ui/Card'
import { IconBox } from '@/components/ui/IconBox'
import { Alert02Icon } from '@hugeicons/core-free-icons'
import { Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

type MapErrorStateProps = {
	error: string
}

export function MapErrorState({ error }: MapErrorStateProps) {
	return (
		<SafeAreaView className='flex-1 items-center justify-center bg-screen px-6'>
			<Card className='w-full max-w-[360px] items-center py-8'>
				<IconBox icon={Alert02Icon} size='lg' tone='danger' className='mb-4' />

				<Text className='text-h2 mb-2 text-center text-tinta'>
					No fue posible cargar el mapa
				</Text>

				<Text className='text-body text-center text-tinta-2'>{error}</Text>
			</Card>
		</SafeAreaView>
	)
}
