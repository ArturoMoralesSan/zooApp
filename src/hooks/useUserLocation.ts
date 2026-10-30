import * as Location from 'expo-location'
import { useEffect, useRef, useState } from 'react'

import type { Coordinate } from '@/types/map'

export function useUserLocation() {
	const locationSubscription = useRef<Location.LocationSubscription | null>(
		null,
	)

	const [userLocation, setUserLocation] = useState<Coordinate | null>(null)

	const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null)

	useEffect(() => {
		let mounted = true

		const startLocationTracking = async () => {
			try {
				const permission = await Location.requestForegroundPermissionsAsync()

				if (permission.status !== Location.PermissionStatus.GRANTED) {
					return
				}

				const current = await Location.getCurrentPositionAsync({
					accuracy: Location.Accuracy.High,
				})

				if (!mounted) {
					return
				}

				const longitude = current.coords.longitude

				const latitude = current.coords.latitude

				if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
					return
				}

				setUserLocation([longitude, latitude])

				setLocationAccuracy(current.coords.accuracy ?? null)

				locationSubscription.current = await Location.watchPositionAsync(
					{
						accuracy: Location.Accuracy.High,
						timeInterval: 3000,
						distanceInterval: 3,
					},
					(location) => {
						if (!mounted) {
							return
						}

						const longitude = location.coords.longitude

						const latitude = location.coords.latitude

						if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
							return
						}

						setUserLocation([longitude, latitude])

						setLocationAccuracy(location.coords.accuracy ?? null)
					},
				)
			} catch {
				return
			}
		}

		startLocationTracking()

		return () => {
			mounted = false
			locationSubscription.current?.remove()
			locationSubscription.current = null
		}
	}, [])

	return { userLocation, locationAccuracy }
}
