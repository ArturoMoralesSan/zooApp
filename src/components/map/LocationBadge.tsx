import { Text, View } from 'react-native'
import { mapShadow } from '@/components/map/mapShadow'

type LocationBadgeProps = {
	locationAccuracy: number | null
}

export function LocationBadge({ locationAccuracy }: LocationBadgeProps) {
	return (
		<View
			className='absolute right-3.5 top-[150px] flex-row items-center rounded-2xl bg-niebla px-[11px] py-2'
			style={mapShadow}
		>
			{/* eslint-disable-next-line no-restricted-syntax -- user-location blue, standard map convention */}
			<View className='mr-[7px] h-[9px] w-[9px] rounded-[5px] bg-[#0977B8]' />

			<View>
				<Text className='text-[11px] font-bold text-tinta'>Tu ubicación</Text>

				{locationAccuracy !== null && (
					<Text className='mt-px text-[9px] text-tinta-2'>
						Precisión ±{Math.round(locationAccuracy)}m
					</Text>
				)}
			</View>
		</View>
	)
}
