import { expect, jest, test } from '@jest/globals'
import { renderHook, waitFor } from '@testing-library/react-native'

import { useArAvailability } from '@/hooks/useArAvailability'

import { arcoreState, viroMock } from '../../test-utils/ar'

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

// ARCore can answer TRANSIENT while it's still checking the phone: asked
// again up to 3 times, half a second apart, then treated as unsupported.
test('an ARCore check that stays transient falls back to the 360° view after 3 tries', async () => {
	viroMock.isARSupportedOnDevice.mockRejectedValue(arcoreState('TRANSIENT'))

	const { result } = await renderHook(() => useArAvailability())

	await waitFor(() => expect(result.current).toBe('unsupported'), {
		timeout: 3000,
	})
	expect(viroMock.isARSupportedOnDevice).toHaveBeenCalledTimes(3)
})
