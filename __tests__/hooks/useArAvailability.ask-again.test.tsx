import { expect, jest, test } from '@jest/globals'
import { renderHook, waitFor } from '@testing-library/react-native'

import { useArAvailability } from '@/hooks/useArAvailability'

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

// One scenario: useArAvailability keeps ARCore's answer in the module.
// Choosing the 360° view and then AR again asks for the camera again.
test('the camera is asked for again each time AR is chosen', async () => {
	camera.permission = { granted: false, canAskAgain: true }
	camera.request.mockImplementation(async () => camera.permission)

	const { result, rerender } = await renderHook(
		({ wantsAr }: { wantsAr: boolean }) =>
			useArAvailability({ camera: wantsAr }),
		{ initialProps: { wantsAr: true } },
	)

	await waitFor(() => expect(result.current).toBe('no-camera'))
	expect(camera.request).toHaveBeenCalledTimes(1)

	// The 360° view: no camera needed.
	await rerender({ wantsAr: false })
	expect(result.current).toBe('ar')
	expect(camera.request).toHaveBeenCalledTimes(1)

	// AR again: asked again, and this time allowed.
	camera.request.mockImplementation(async () => {
		camera.permission = { granted: true, canAskAgain: true }

		return camera.permission
	})
	await rerender({ wantsAr: true })
	await waitFor(() => expect(result.current).toBe('ar'))
	expect(camera.request).toHaveBeenCalledTimes(2)
})
