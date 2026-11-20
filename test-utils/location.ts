import { jest } from '@jest/globals'
import type { LocationObject, LocationPermissionResponse } from 'expo-location'

// expo-location for the duel's visit checks. Mock it per file, lazily, so
// the functions below are the ones the code under test calls:
//
//   jest.mock('expo-location', () =>
//     jest.requireActual<typeof import('<path>/test-utils/location')>(
//       '<path>/test-utils/location',
//     ).expoLocationMock,
//   )
// Starts without permission: no location unless a test grants it.
export const expoLocationMock = {
	getForegroundPermissionsAsync: jest.fn(async () => permission(false)),
	requestForegroundPermissionsAsync: jest.fn(async () => permission(false)),
	getLastKnownPositionAsync: jest.fn(
		async (): Promise<LocationObject | null> => null,
	),
	getCurrentPositionAsync: jest.fn(async () => position(24.07, -104.58)),
	Accuracy: { High: 4 },
	PermissionStatus: { GRANTED: 'granted', DENIED: 'denied' },
}

export function permission(granted: boolean): LocationPermissionResponse {
	return {
		granted,
		canAskAgain: true,
		expires: 'never',
		status: (granted
			? 'granted'
			: 'denied') as LocationPermissionResponse['status'],
	}
}

export function position(
	latitude: number,
	longitude: number,
	accuracy = 8,
): LocationObject {
	return {
		timestamp: Date.now(),
		coords: {
			latitude,
			longitude,
			accuracy,
			altitude: null,
			altitudeAccuracy: null,
			heading: null,
			speed: null,
		},
	}
}
