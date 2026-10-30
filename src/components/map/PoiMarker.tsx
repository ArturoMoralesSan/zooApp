import { Marker } from '@maplibre/maplibre-react-native'
import { Image } from 'expo-image'
import { Text, View } from 'react-native'
import colors from '@/theme/colors'
import type { SelectableItem } from '@/types/map'
import { markerShadow } from '@/components/map/markerShadow'

type PoiMarkerProps = {
	item: SelectableItem
	onPress: () => void
}

export function PoiMarker({ item, onPress }: PoiMarkerProps) {
	return (
		<Marker lngLat={item.coordinate} onPress={onPress}>
			<View
				className='h-[38px] w-[38px] items-center justify-center overflow-hidden rounded-[19px] border-[3px] border-blanco'
				style={[
					markerShadow,
					{ backgroundColor: item.color ?? colors.esmeralda },
				]}
			>
				{item.iconImage ? (
					<Image
						source={{
							uri: item.iconImage,
						}}
						style={{ width: 30, height: 30, borderRadius: 15 }}
						contentFit='contain'
						cachePolicy='memory-disk'
					/>
				) : (
					<Text className='font-sans text-[18px]'>{item.icon ?? '📍'}</Text>
				)}
			</View>
		</Marker>
	)
}
