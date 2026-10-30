import { Text, View } from 'react-native'

type MapHeaderCardProps = {
	isUserInsideZoo: boolean
}

export function MapHeaderCard({ isUserInsideZoo }: MapHeaderCardProps) {
	return (
		<View className='absolute left-3 right-3 top-[60px] rounded-[22px] border-1.5 border-card-border bg-niebla p-4'>
			<View className='flex-row items-center justify-between'>
				<View className='flex-1 pr-2.5'>
					<Text className='text-h2 text-tinta'>Mapa del zoológico</Text>

					<Text className='text-meta mt-[3px]'>
						Explora zonas, caminos y especies
					</Text>
				</View>

				<View className='flex-row items-center rounded-2xl bg-hoja px-2.5 py-[7px]'>
					<View
						className={`mr-[5px] h-2 w-2 rounded ${isUserInsideZoo ? 'bg-esmeralda' : 'bg-apagado'}`}
					/>

					<Text className='font-sans-bold text-[12px] text-tinta'>
						{isUserInsideZoo ? 'Dentro' : 'Fuera'}
					</Text>
				</View>
			</View>
		</View>
	)
}
