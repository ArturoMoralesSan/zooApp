import { HelpCircleIcon, SquareLock02Icon } from '@hugeicons/core-free-icons'
import { Marker } from '@maplibre/maplibre-react-native'
import { Image } from 'expo-image'
import { View } from 'react-native'

import { markerShadow } from '@/components/map/markerShadow'
import { Icon } from '@/components/ui/Icon'
import colors from '@/theme/colors'
import type { SelectableItem, ZooDeckCard } from '@/types/map'

type DuelMarkerProps = {
	item: SelectableItem
	card: ZooDeckCard | null
	selected: boolean
	onPress: () => void
}

// A-17 marker: a "?" for a card still to win, a lock while it's locked, the
// animal's photo once it's in the collection. The selected one gets a Lima
// ring, so the state never depends on color alone.
export function DuelMarker({ item, card, selected, onPress }: DuelMarkerProps) {
	const owned = card?.status === 'owned'
	const locked = card?.status === 'locked'
	const ring = selected ? 'border-lima' : 'border-blanco'

	return (
		<Marker lngLat={item.coordinate} onPress={onPress}>
			<View
				accessibilityRole='button'
				accessibilityLabel={item.name}
				className={`h-11 w-11 items-center justify-center overflow-hidden rounded-full border-[3px] ${ring} ${locked ? 'bg-niebla' : 'bg-bosque'}`}
				style={markerShadow}
			>
				{owned && item.thumbnail ? (
					<Image
						source={{ uri: item.thumbnail }}
						style={{ width: 38, height: 38 }}
						contentFit='cover'
						cachePolicy='memory-disk'
					/>
				) : (
					<Icon
						icon={locked ? SquareLock02Icon : HelpCircleIcon}
						size={22}
						color={locked ? colors.apagado : colors.lima}
						strong
					/>
				)}
			</View>
		</Marker>
	)
}
