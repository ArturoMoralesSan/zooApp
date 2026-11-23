import { describe, expect, jest, test } from '@jest/globals'
import * as Location from 'expo-location'

import { getDuelCoordinates } from '@/services/location'

import { permission, position } from '../../test-utils/location'

jest.mock(
	'expo-location',
	() =>
		jest.requireActual<typeof import('../../test-utils/location')>(
			'../../test-utils/location',
		).expoLocationMock,
)

const location = jest.mocked(Location)

describe('getDuelCoordinates', () => {
	test('without permission there are no coordinates', async () => {
		await expect(getDuelCoordinates(false)).resolves.toBeNull()
		expect(location.requestForegroundPermissionsAsync).not.toHaveBeenCalled()
		expect(location.getCurrentPositionAsync).not.toHaveBeenCalled()
	})

	test('asks for permission only when told to', async () => {
		location.requestForegroundPermissionsAsync.mockResolvedValueOnce(
			permission(true),
		)

		await expect(getDuelCoordinates(true)).resolves.toEqual({
			latitude: 24.07,
			longitude: -104.58,
			accuracy: 8,
		})
		expect(location.requestForegroundPermissionsAsync).toHaveBeenCalledTimes(1)
	})

	// Requesting opens Android's permission activity even when granted,
	// which pauses ARCore mid-duel and moves the placed animal (#51).
	test('an allowed permission is not requested again', async () => {
		location.getForegroundPermissionsAsync.mockResolvedValueOnce(
			permission(true),
		)

		await expect(getDuelCoordinates(true)).resolves.not.toBeNull()
		expect(location.requestForegroundPermissionsAsync).not.toHaveBeenCalled()
	})

	test('a permanently denied permission is not requested', async () => {
		location.getForegroundPermissionsAsync.mockResolvedValueOnce(
			permission(false, false),
		)

		await expect(getDuelCoordinates(true)).resolves.toBeNull()
		expect(location.requestForegroundPermissionsAsync).not.toHaveBeenCalled()
	})

	test('a recent last known fix avoids waiting for the GPS', async () => {
		location.getForegroundPermissionsAsync.mockResolvedValueOnce(
			permission(true),
		)
		location.getLastKnownPositionAsync.mockResolvedValueOnce(
			position(24.08, -104.59, 12),
		)

		await expect(getDuelCoordinates(false)).resolves.toEqual({
			latitude: 24.08,
			longitude: -104.59,
			accuracy: 12,
		})
		// Older than a minute may be from home, before the visit.
		expect(location.getLastKnownPositionAsync).toHaveBeenCalledWith({
			maxAge: 60_000,
		})
		expect(location.getCurrentPositionAsync).not.toHaveBeenCalled()
	})

	test('a retry skips the last known fix', async () => {
		location.getForegroundPermissionsAsync.mockResolvedValueOnce(
			permission(true),
		)

		await getDuelCoordinates(false, true)

		expect(location.getLastKnownPositionAsync).not.toHaveBeenCalled()
		expect(location.getCurrentPositionAsync).toHaveBeenCalledTimes(1)
	})

	// The server answers location_required if it needs one.
	test('a GPS failure gives no coordinates instead of an error', async () => {
		location.getForegroundPermissionsAsync.mockResolvedValueOnce(
			permission(true),
		)
		location.getCurrentPositionAsync.mockRejectedValueOnce(
			new Error('Location services are disabled'),
		)

		await expect(getDuelCoordinates(false)).resolves.toBeNull()
	})
})
