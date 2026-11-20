import { expect, jest, test } from '@jest/globals'
import { renderHook, waitFor } from '@testing-library/react-native'

import {
	useArAvailability,
	type ArAvailability,
} from '@/hooks/useArAvailability'

import { camera, viroMock } from '../../test-utils/ar'

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

// One scenario: the phone's AR support is cached in the module.
test('an ARCore phone with the camera allowed shows AR, asked once per session', async () => {
	const states: ArAvailability[] = []
	const { result } = await renderHook(() => {
		const state = useArAvailability()

		states.push(state)

		return state
	})

	expect(states[0]).toBe('checking')
	await waitFor(() => expect(result.current).toBe('ar'))
	expect(camera.request).not.toHaveBeenCalled()

	// The duel already has the camera: AR without looking at it again.
	const duel = await renderHook(() => useArAvailability({ camera: false }))

	await waitFor(() => expect(duel.result.current).toBe('ar'))
	expect(viroMock.isARSupportedOnDevice).toHaveBeenCalledTimes(1)
})
