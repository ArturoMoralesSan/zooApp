import { expect, jest, test } from '@jest/globals'
import { renderHook, waitFor } from '@testing-library/react-native'

import {
	useArAvailability,
	type ArAvailability,
} from '@/hooks/useArAvailability'

import { camera } from '../../test-utils/ar'

jest.mock(
	'@reactvision/react-viro',
	() =>
		jest.requireActual<typeof import('../../test-utils/ar')>(
			'../../test-utils/ar',
		).viroMock,
)
jest.mock(
	'expo-camera',
	() =>
		jest.requireActual<typeof import('../../test-utils/ar')>(
			'../../test-utils/ar',
		).expoCameraMock,
)

// On an AR phone the camera is asked for once; while the dialog is open the
// screen waits for the answer instead of reading an earlier "no".
test('a camera denied in the dialog shows the 360° view', async () => {
	camera.permission = { granted: false, canAskAgain: true }
	camera.request.mockImplementation(async () => {
		camera.permission = { granted: false, canAskAgain: false }

		return camera.permission
	})

	const states: ArAvailability[] = []
	const { result } = await renderHook(() => {
		const state = useArAvailability()

		states.push(state)

		return state
	})

	await waitFor(() => expect(result.current).toBe('no-camera'))
	expect(camera.request).toHaveBeenCalledTimes(1)
	// Never 'no-camera' before the user answered.
	expect(states.slice(0, states.indexOf('no-camera'))).toEqual(
		expect.arrayContaining(['checking']),
	)
	expect(states.filter((state) => state === 'ar')).toEqual([])
})
