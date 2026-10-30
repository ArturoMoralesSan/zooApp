import { Marker } from '@maplibre/maplibre-react-native'
import { Image } from 'expo-image'
import { Text, View } from 'react-native'
import colors from '@/theme/colors'
import type { SelectableItem } from '@/types/map'
import { markerShadow } from '@/components/map/markerShadow'

type DestinationMarkerProps = {
	selectedItem: SelectableItem
}

export function DestinationMarker({ selectedItem }: DestinationMarkerProps) {
	return (
		<Marker lngLat={selectedItem.coordinate}>
			<View
				className={
					selectedItem.type === 'species'
						? 'h-12 w-12 items-center justify-center overflow-hidden rounded-3xl border-4 border-blanco bg-esmeralda'
						: 'h-[46px] w-[46px] items-center justify-center overflow-hidden rounded-[23px] border-4 border-blanco'
				}
				style={[
					markerShadow,
					selectedItem.type === 'marker' && {
						backgroundColor: selectedItem.color ?? colors.bosque,
					},
				]}
			>
				{selectedItem.type === 'species' && selectedItem.thumbnail ? (
					<Image
						source={{
							uri: selectedItem.thumbnail,
						}}
						style={{ width: 40, height: 40, borderRadius: 20 }}
						contentFit='cover'
						cachePolicy='memory-disk'
					/>
				) : selectedItem.type === 'marker' && selectedItem.iconImage ? (
					<Image
						source={{
							uri: selectedItem.iconImage,
						}}
						style={{ width: 36, height: 36, borderRadius: 18 }}
						contentFit='contain'
						cachePolicy='memory-disk'
					/>
				) : (
					<Text className='font-sans text-[20px]'>
						{selectedItem.type === 'species'
							? (selectedItem.icon ?? '🦁')
							: (selectedItem.icon ?? '📍')}
					</Text>
				)}
			</View>
		</Marker>
	)
}
