import { MapIcon } from '@hugeicons/core-free-icons'
import { View } from 'react-native'

import { Button } from '@/components/ui/Button'

type MapPreviewCardProps = {
	onOpenMap: () => void
	className?: string
}

// A-16 map preview with its "Abrir mapa interactivo" button. For now a
// solid Hoja area stands in for the map.
export function MapPreviewCard({
	onOpenMap,
	className = '',
}: MapPreviewCardProps) {
	return (
		<View
			className={`h-36 justify-end overflow-hidden rounded-2xl border-1.5 border-card-border bg-hoja p-3 ${className}`}
		>
			<Button
				title='Abrir mapa interactivo'
				icon={MapIcon}
				iconPosition='leading'
				size='sm'
				onPress={onOpenMap}
			/>
		</View>
	)
}
