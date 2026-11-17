import * as Location from 'expo-location'
import { useCallback, useEffect, useRef, useState } from 'react'

import type { Coordinate } from '@/types/map'

export function useUserLocation() {
	const locationSubscription = useRef<Location.LocationSubscription | null>(
		null,
	)

	const [userLocation, setUserLocation] = useState<Coordinate | null>(null)

	const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null)

	// True until the first fix or until it fails (no permission, GPS off).
	const [locating, setLocating] = useState(true)

	// Bumped by retry() to ask for permission and start tracking again.
	const [attempt, setAttempt] = useState(0)

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
			} finally {
				if (mounted) setLocating(false)
			}
		}

		startLocationTracking()

		return () => {
			mounted = false
			locationSubscription.current?.remove()
			locationSubscription.current = null
		}
	}, [attempt])

	const retry = useCallback(() => {
		setLocating(true)
		setAttempt((current) => current + 1)
	}, [])

	return { userLocation, locationAccuracy, locating, retry }
}
