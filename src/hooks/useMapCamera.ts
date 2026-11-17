import type { CameraRef, MapRef } from '@maplibre/maplibre-react-native'
import { useEffect, useRef, useState } from 'react'

import type { Coordinate } from '@/types/map'
import { DEFAULT_ZOOM, USER_ZOOM, ZOO_CENTER } from '@/utils/map'

// Camera of the zoo maps. It centers on the user once, on the first fix after
// the map loads; later fixes only move the user's dot. Following every fix
// threw the camera back to the user every few seconds while they explored.
export function useMapCamera(userLocation: Coordinate | null) {
	const mapRef = useRef<MapRef>(null)
	const cameraRef = useRef<CameraRef>(null)
	const [mapReady, setMapReady] = useState(false)
	const centeredOnUser = useRef(false)

	useEffect(() => {
		if (!userLocation || !mapReady || centeredOnUser.current) return

		centeredOnUser.current = true

		const timer = setTimeout(() => {
			cameraRef.current?.flyTo({
				center: userLocation,
				zoom: USER_ZOOM,
				duration: 500,
			})
		}, 300)

		return () => clearTimeout(timer)
	}, [mapReady, userLocation])

	const flyTo = (coordinate: Coordinate, duration = 800) => {
		cameraRef.current?.flyTo({ center: coordinate, zoom: 18, duration })
	}

	const zoomBy = async (delta: number) => {
		try {
			const zoom = await mapRef.current?.getZoom()
			if (typeof zoom !== 'number') return

			cameraRef.current?.zoomTo(zoom + delta, { duration: 250 })
		} catch {
			return
		}
	}

	const locateUser = () => {
		cameraRef.current?.flyTo({
			center: userLocation ?? ZOO_CENTER,
			zoom: userLocation ? USER_ZOOM : DEFAULT_ZOOM,
			duration: 500,
		})
	}

	return {
		mapRef,
		cameraRef,
		// Uncontrolled: props bound to the location re-centered the camera too.
		initialViewState: { center: ZOO_CENTER, zoom: DEFAULT_ZOOM },
		onMapReady: () => setMapReady(true),
		flyTo,
		zoomBy,
		locateUser,
	}
}
