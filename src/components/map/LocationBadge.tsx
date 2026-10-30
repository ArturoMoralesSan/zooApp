import { Text, View } from 'react-native'

type LocationBadgeProps = {
	locationAccuracy: number | null
}

export function LocationBadge({ locationAccuracy }: LocationBadgeProps) {
	return (
		<View className='absolute right-3.5 top-[150px] flex-row items-center rounded-2xl border-1.5 border-card-border bg-niebla px-[11px] py-2'>
			{/* eslint-disable-next-line no-restricted-syntax -- user-location blue, standard map convention */}
			<View className='mr-[7px] h-[9px] w-[9px] rounded-[5px] bg-[#0977B8]' />

			<View>
				<Text className='font-sans-bold text-[12px] text-tinta'>
					Tu ubicación
				</Text>

				{locationAccuracy !== null && (
					<Text className='text-meta mt-px'>
						Precisión ±{Math.round(locationAccuracy)}m
					</Text>
				)}
			</View>
		</View>
	)
}
