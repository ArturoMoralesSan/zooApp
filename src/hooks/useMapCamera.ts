import type { CameraRef, MapRef } from '@maplibre/maplibre-react-native'
import { useEffect, useRef, useState } from 'react'

import type { Coordinate } from '@/types/map'
import { boundsOf, DEFAULT_ZOOM, USER_ZOOM, ZOO_CENTER } from '@/utils/map'

// Camera of the zoo maps. It centers on the user once, on the first fix after
// the map loads; later fixes only move the user's dot. Following every fix
// threw the camera back to the user every few seconds while they explored.
// `bottomInset` is the height of a sheet over the map: targets are centered
// in the part of the map still visible above it. Maps that frame their own
// first view (fitTo) pass `centerOnUser: false`.
export function useMapCamera(
	userLocation: Coordinate | null,
	{ bottomInset = 0, centerOnUser = true } = {},
) {
	const mapRef = useRef<MapRef>(null)
	const cameraRef = useRef<CameraRef>(null)
	const [mapReady, setMapReady] = useState(false)
	const centeredOnUser = useRef(false)
	const padding = { bottom: bottomInset }

	useEffect(() => {
		if (!centerOnUser || !userLocation || !mapReady || centeredOnUser.current)
			return

		// Flagged when it runs: a cleared timer must leave it pending.
		const timer = setTimeout(() => {
			centeredOnUser.current = true
			cameraRef.current?.flyTo({
				center: userLocation,
				zoom: USER_ZOOM,
				padding: { bottom: bottomInset },
				duration: 500,
			})
		}, 300)

		return () => clearTimeout(timer)
	}, [centerOnUser, mapReady, userLocation, bottomInset])

	const flyTo = (coordinate: Coordinate, duration = 800) => {
		cameraRef.current?.flyTo({
			center: coordinate,
			zoom: 18,
			padding,
			duration,
		})
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

	// Frames every coordinate between the header (top) and the sheet.
	const fitTo = (coordinates: Coordinate[]) => {
		const bounds = boundsOf(coordinates)
		if (!bounds) return

		cameraRef.current?.fitBounds(bounds, {
			padding: { top: 120, right: 64, bottom: bottomInset + 48, left: 64 },
			// One point (or all in the same spot) would zoom in to the max.
			...(coordinates.length === 1 && { zoom: USER_ZOOM }),
			duration: 500,
		})
	}

	const locateUser = () => {
		cameraRef.current?.flyTo({
			center: userLocation ?? ZOO_CENTER,
			zoom: userLocation ? USER_ZOOM : DEFAULT_ZOOM,
			padding,
			duration: 500,
		})
	}

	return {
		mapRef,
		cameraRef,
		// Uncontrolled: props bound to the location re-centered the camera too.
		initialViewState: { center: ZOO_CENTER, zoom: DEFAULT_ZOOM },
		mapReady,
		onMapReady: () => setMapReady(true),
		flyTo,
		zoomBy,
		fitTo,
		locateUser,
	}
}
