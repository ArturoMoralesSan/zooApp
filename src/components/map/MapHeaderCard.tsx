import { Badge } from '@/components/ui/Badge'
import BackButton from '@/components/ui/BackButton'
import { Text, View } from 'react-native'

type MapHeaderCardProps = {
	isUserInsideZoo: boolean
	onBack: () => void
}

// Back button and title card floating over the top of the map.
export function MapHeaderCard({ isUserInsideZoo, onBack }: MapHeaderCardProps) {
	return (
		<View className='absolute left-4 right-4 top-4 flex-row items-start gap-2'>
			<BackButton variant='outline' position='relative' onPress={onBack} />

			<View className='flex-1 flex-row items-center justify-between rounded-2xl border-1.5 border-card-border bg-blanco p-4'>
				<View className='flex-1 pr-2.5'>
					<Text className='text-h2 text-tinta'>Mapa del zoológico</Text>

					<Text className='text-meta mt-1'>
						Explora zonas, caminos y especies
					</Text>
				</View>

				<Badge
					label={isUserInsideZoo ? 'Dentro' : 'Fuera'}
					tone={isUserInsideZoo ? 'success' : 'neutral'}
					dot
				/>
			</View>
		</View>
	)
}
