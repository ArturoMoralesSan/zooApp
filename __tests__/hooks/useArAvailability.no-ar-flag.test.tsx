import { beforeAll, expect, jest, test } from '@jest/globals'
import { renderHook, waitFor } from '@testing-library/react-native'

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
	process.env.EXPO_PUBLIC_ZOODECK_NOAR_SUPPORT = '1'
	;({ useArAvailability } = jest.requireActual<ArModule>(
		'@/hooks/useArAvailability',
	))
})

// Dev only (EXPO_PUBLIC_ZOODECK_NOAR_SUPPORT=1): an ARCore phone behaves as
// one without it, to test that path anywhere.
test('the dev flag answers unsupported without asking ARCore', async () => {
	const { result } = await renderHook(() => useArAvailability())

	await waitFor(() => expect(result.current).toBe('unsupported'))
	expect(viroMock.isARSupportedOnDevice).not.toHaveBeenCalled()
})
