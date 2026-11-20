import { expect, jest, test } from '@jest/globals'
import { renderHook, waitFor } from '@testing-library/react-native'

import { useArAvailability } from '@/hooks/useArAvailability'

import { arcoreState, camera, viroMock } from '../../test-utils/ar'

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

test('a phone without ARCore shows the 360° view and never asks for the camera', async () => {
	viroMock.isARSupportedOnDevice.mockRejectedValue(arcoreState('UNSUPPORTED'))
	camera.permission = { granted: false, canAskAgain: true }

	const { result } = await renderHook(() => useArAvailability())

	await waitFor(() => expect(result.current).toBe('unsupported'))
	expect(viroMock.isARSupportedOnDevice).toHaveBeenCalledTimes(1)
	expect(camera.request).not.toHaveBeenCalled()
})
