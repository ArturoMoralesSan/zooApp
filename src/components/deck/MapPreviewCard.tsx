import { MapIcon } from '@hugeicons/core-free-icons'
import { Camera, Map as MapView } from '@maplibre/maplibre-react-native'
import { useIsFocused } from 'expo-router'
import { useMemo } from 'react'
import { Pressable, View } from 'react-native'

import { MapLayers } from '@/components/map/MapLayers'
import { Button } from '@/components/ui/Button'
import { DuelMarker } from '@/components/zoodeck/DuelMarker'
import { useMapFeatures } from '@/hooks/useMapFeatures'
import type { Zone } from '@/types/map'
import {
	boundsOf,
	geometryCoordinates,
	normalizeZoneGeometry,
} from '@/utils/map'
import { duelCardOf } from '@/utils/zoodeck'

type MapPreviewCardProps = {
	// ZooDeck map zones; the Hoja background shows until they arrive.
	zones?: Zone[]
	onOpenMap: () => void
	className?: string
}

const NO_ZONES: Zone[] = []
const NO_ROUTE = { type: 'FeatureCollection', features: [] }

// Keeps the zones and markers clear of the button at the bottom, plus half
// a compact marker (14) so the ones on the edge aren't cut.
const PADDING = { top: 22, right: 30, bottom: 70, left: 30 }

// A-16 map preview: the zones and the animals to challenge, framed and
// still. Gestures are off so the tab scrolls over it; a tap anywhere opens
// the interactive map, like its button.
export function MapPreviewCard({
	zones = NO_ZONES,
	onOpenMap,
	className = '',
}: MapPreviewCardProps) {
	const { zonesGeoJson, mapImages, pathsGeoJson, selectableItems } =
		useMapFeatures(zones)

	const species = useMemo(
		() => selectableItems.filter((item) => item.type === 'species'),
		[selectableItems],
	)

	const bounds = useMemo(
		() =>
			boundsOf([
				...zones.flatMap((zone) =>
					geometryCoordinates(normalizeZoneGeometry(zone.geometry)),
				),
				...species.map((item) => item.coordinate),
			]),
		[zones, species],
	)

	// A map kept alive under another screen stops the 360° view's head
	// tracking (GVR), so it's only mounted while the tab is in view.
	const focused = useIsFocused()

	return (
		<Pressable
			onPress={onOpenMap}
			// The button inside is the accessible control.
			accessible={false}
			className={`h-36 justify-end overflow-hidden rounded-2xl border-1.5 border-card-border bg-hoja p-3 ${className}`}
		>
			{bounds && focused && (
				<View
					className='absolute inset-0'
					pointerEvents='none'
					// Decorative: the button is the control, and MapLibre's own
					// description offers gestures that are off here.
					accessibilityElementsHidden
					importantForAccessibility='no-hide-descendants'
				>
					<MapView
						// A new frame when the data moves it; the camera is uncontrolled.
						key={bounds.join()}
						style={{ flex: 1 }}
						mapStyle={{ version: 8, sources: {}, layers: [] }}
						dragPan={false}
						touchZoom={false}
						doubleTapZoom={false}
						touchRotate={false}
						touchPitch={false}
						compass={false}
						logo={false}
						// OpenStreetMap's tiles must stay credited.
						attributionPosition={{ top: 8, right: 8 }}
					>
						<Camera initialViewState={{ bounds, padding: PADDING }} />

						<MapLayers
							mapImages={mapImages}
							zonesGeoJson={zonesGeoJson}
							pathsGeoJson={pathsGeoJson}
							routeGeoJson={NO_ROUTE}
						/>

						{species.map((item) => (
							<DuelMarker
								key={item.id}
								item={item}
								card={duelCardOf(item.species)}
								selected={false}
								onPress={onOpenMap}
								compact
							/>
						))}
					</MapView>
				</View>
			)}

			<Button
				title='Abrir mapa interactivo'
				icon={MapIcon}
				iconPosition='leading'
				size='sm'
				onPress={onOpenMap}
			/>
		</Pressable>
	)
}
