import { Text, View } from 'react-native'
import { mapShadow } from '@/components/map/mapShadow'

type MapHeaderCardProps = {
	isUserInsideZoo: boolean
}

export function MapHeaderCard({ isUserInsideZoo }: MapHeaderCardProps) {
	return (
		<View
			className='absolute left-3 right-3 top-[60px] rounded-[22px] bg-niebla p-4'
			style={mapShadow}
		>
			<View className='flex-row items-center justify-between'>
				<View className='flex-1 pr-2.5'>
					<Text className='text-[19px] font-extrabold text-tinta'>
						Mapa del zoológico
					</Text>

					<Text className='mt-[3px] text-[12px] text-tinta-2'>
						Explora zonas, caminos y especies
					</Text>
				</View>

				<View className='flex-row items-center rounded-2xl bg-hoja px-2.5 py-[7px]'>
					<View
						className={`mr-[5px] h-2 w-2 rounded ${isUserInsideZoo ? 'bg-esmeralda' : 'bg-apagado'}`}
					/>

					<Text className='text-[11px] font-bold text-tinta'>
						{isUserInsideZoo ? 'Dentro' : 'Fuera'}
					</Text>
				</View>
			</View>
		</View>
	)
}
