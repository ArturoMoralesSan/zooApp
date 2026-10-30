import { Marker } from '@maplibre/maplibre-react-native'
import { Image } from 'expo-image'
import { Text, View } from 'react-native'
import colors from '@/theme/colors'
import type { SelectableItem } from '@/types/map'
import { mapShadow } from '@/components/map/mapShadow'

type SpeciesMarkerProps = {
	item: SelectableItem
	onPress: () => void
}

export function SpeciesMarker({ item, onPress }: SpeciesMarkerProps) {
	return (
		<Marker lngLat={item.coordinate} onPress={onPress}>
			<View
				className='h-[42px] w-[42px] items-center justify-center overflow-hidden rounded-[21px] border-[3px] border-blanco'
				style={[mapShadow, { backgroundColor: item.color ?? colors.bosque }]}
			>
				{item.thumbnail ? (
					<Image
						source={{
							uri: item.thumbnail,
						}}
						style={{ width: 36, height: 36, borderRadius: 18 }}
						contentFit='cover'
						cachePolicy='memory-disk'
					/>
				) : (
					<Text className='font-sans text-[18px]'>{item.icon ?? '🦁'}</Text>
				)}
			</View>
		</Marker>
	)
}
