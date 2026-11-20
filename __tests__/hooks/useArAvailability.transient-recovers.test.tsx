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

test('a transient ARCore answer followed by support still shows AR', async () => {
	viroMock.isARSupportedOnDevice
		.mockRejectedValueOnce(arcoreState('TRANSIENT'))
		.mockResolvedValueOnce({ isARSupported: true })

	const { result } = await renderHook(() => useArAvailability())

	await waitFor(() => expect(result.current).toBe('ar'), { timeout: 3000 })
	expect(viroMock.isARSupportedOnDevice).toHaveBeenCalledTimes(2)
})
