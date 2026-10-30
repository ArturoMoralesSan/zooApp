import { Image } from 'expo-image'
import { Text, View } from 'react-native'
import colors from '@/theme/colors'
import type { SelectableItem } from '@/types/map'

type SelectedItemThumbProps = {
	selectedItem: SelectableItem
	// 40 in the collapsed card, 48 in the route card.
	size: 40 | 48
}

// Species photo, POI icon or emoji in a radius-12 box, shared by the route
// cards.
export function SelectedItemThumb({
	selectedItem,
	size,
}: SelectedItemThumbProps) {
	return (
		<View
			className={`items-center justify-center overflow-hidden rounded-xl bg-hoja ${size === 48 ? 'h-12 w-12' : 'h-10 w-10'}`}
			style={
				selectedItem.type === 'marker' && {
					backgroundColor: selectedItem.color ?? colors.hoja,
				}
			}
		>
			{selectedItem.type === 'species' && selectedItem.thumbnail ? (
				<Image
					source={{ uri: selectedItem.thumbnail }}
					style={{ width: size, height: size }}
					contentFit='cover'
					cachePolicy='memory-disk'
				/>
			) : selectedItem.type === 'marker' && selectedItem.iconImage ? (
				<Image
					source={{ uri: selectedItem.iconImage }}
					style={{ width: size - 8, height: size - 8 }}
					contentFit='contain'
					cachePolicy='memory-disk'
				/>
			) : (
				<Text className='font-sans text-[18px]'>
					{selectedItem.type === 'species'
						? (selectedItem.icon ?? '🦁')
						: (selectedItem.icon ?? '📍')}
				</Text>
			)}
		</View>
	)
}
