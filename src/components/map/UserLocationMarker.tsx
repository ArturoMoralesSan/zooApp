import { Marker } from '@maplibre/maplibre-react-native'
import { View } from 'react-native'
import type { Coordinate } from '@/types/map'
import { mapShadow } from '@/components/map/mapShadow'

type UserLocationMarkerProps = {
	userLocation: Coordinate
}

export function UserLocationMarker({ userLocation }: UserLocationMarkerProps) {
	return (
		<Marker lngLat={userLocation}>
			{/* eslint-disable-next-line no-restricted-syntax -- user-location blue, standard map convention */}
			<View className='h-[46px] w-[46px] items-center justify-center rounded-[23px] border border-[rgba(8,121,141,0.4)] bg-[rgba(8,118,161,0.2)]'>
				<View
					// eslint-disable-next-line no-restricted-syntax -- user-location blue, standard map convention
					className='h-[17px] w-[17px] rounded-[9px] border-[3px] border-blanco bg-[#0977B8]'
					style={mapShadow}
				/>
			</View>
		</Marker>
	)
}
