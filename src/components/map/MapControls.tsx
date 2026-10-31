import { IconButton } from '@/components/ui/IconButton'
import {
	Add01Icon,
	GpsSignal01Icon,
	MinusSignIcon,
} from '@hugeicons/core-free-icons'
import { View } from 'react-native'

type MapControlsProps = {
	onLocate: () => void
	onZoomIn: () => void
	onZoomOut: () => void
}

// A-13 map controls: locate, zoom in and zoom out stacked at the right
// edge, 40 × 40 and 8 apart.
export function MapControls({
	onLocate,
	onZoomIn,
	onZoomOut,
}: MapControlsProps) {
	return (
		<View className='absolute right-5 top-[38%] gap-2'>
			<IconButton
				icon={GpsSignal01Icon}
				variant='outline'
				onPress={onLocate}
				accessibilityLabel='Centrar en mi ubicación'
			/>
			<IconButton
				icon={Add01Icon}
				variant='outline'
				onPress={onZoomIn}
				accessibilityLabel='Acercar'
			/>
			<IconButton
				icon={MinusSignIcon}
				variant='outline'
				onPress={onZoomOut}
				accessibilityLabel='Alejar'
			/>
		</View>
	)
}
