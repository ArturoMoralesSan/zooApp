import { Badge } from '@/components/ui/Badge'
import { Text, View } from 'react-native'

type MapHeaderCardProps = {
	isUserInsideZoo: boolean
}

export function MapHeaderCard({ isUserInsideZoo }: MapHeaderCardProps) {
	return (
		<View className='absolute left-4 right-4 top-[60px] rounded-2xl border-1.5 border-card-border bg-blanco p-4'>
			<View className='flex-row items-center justify-between'>
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
