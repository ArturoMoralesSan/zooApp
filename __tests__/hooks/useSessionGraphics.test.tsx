import { expect, jest, test } from '@jest/globals'
import { act, renderHook, waitFor } from '@testing-library/react-native'
import * as SecureStore from 'expo-secure-store'

import { useSessionGraphics } from '@/hooks/useSessionGraphics'
import { setGraphicsQuality } from '@/services/preferences'
import { GRAPHICS_PRESETS } from '@/utils/settings'

// A phone that reports 3.4 GB (sold as 4): 'auto' is Alta.
jest.mock('expo-device', () => ({
	totalMemory: 3.4 * 1024 ** 3,
	deviceYearClass: 2023,
}))

test('resolves the level once and keeps it for the session', async () => {
	expect(await SecureStore.getItemAsync('zooapp_pref_graphics')).toBeNull()

	const { result, rerender } = await renderHook(() => useSessionGraphics())

	await waitFor(() => expect(result.current).toEqual(GRAPHICS_PRESETS.high))

	// A change saved now applies to the next session, not this one.
	await act(async () => setGraphicsQuality('saver'))
	await rerender({})
	expect(result.current).toEqual(GRAPHICS_PRESETS.high)

	const next = await renderHook(() => useSessionGraphics())

	await waitFor(() =>
		expect(next.result.current).toEqual(GRAPHICS_PRESETS.saver),
	)
})
