import { beforeAll, expect, jest, test } from '@jest/globals'
import { renderHook } from '@testing-library/react-native'

import { viroMock } from '../../test-utils/ar'

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

type ArModule = typeof import('@/hooks/useArAvailability')

let useArAvailability: ArModule['useArAvailability']

// The flag is read when zoodeckDebug loads, so it's set before loading.
beforeAll(() => {
	process.env.EXPO_PUBLIC_ZOODECK_FORCE_360 = '1'
	;({ useArAvailability } = jest.requireActual<ArModule>(
		'@/hooks/useArAvailability',
	))
})

// Dev only (EXPO_PUBLIC_ZOODECK_FORCE_360=1): the 360° view on any phone,
// to test the fallback.
test('the dev flag forces the 360° view without asking ARCore', async () => {
	const { result } = await renderHook(() => useArAvailability())

	expect(result.current).toBe('forced')
	expect(viroMock.isARSupportedOnDevice).not.toHaveBeenCalled()
})
