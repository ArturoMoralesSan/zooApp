import { expect, jest, test } from '@jest/globals'
import { act, renderHook, waitFor } from '@testing-library/react-native'
import * as SecureStore from 'expo-secure-store'

import { useGraphicsQuality } from '@/hooks/useGraphicsQuality'
import { GRAPHICS_PRESETS } from '@/utils/settings'

test('is null while reading, then the saved level and mix', async () => {
	await SecureStore.setItemAsync('zooapp_pref_graphics', 'saver')

	let release = () => {}
	jest.mocked(SecureStore.getItemAsync).mockImplementationOnce(
		() =>
			new Promise((resolve) => {
				release = () => resolve('saver')
			}),
	)

	const { result } = await renderHook(() => useGraphicsQuality())

	expect(result.current.quality).toBeNull()
	expect(result.current.custom).toBeNull()

	await act(async () => release())
	expect(result.current.quality).toBe('saver')
	expect(result.current.custom).toEqual(GRAPHICS_PRESETS.high)
})

test('a level and a switch show at once and are saved for next time', async () => {
	const { result } = await renderHook(() => useGraphicsQuality())

	await waitFor(() => expect(result.current.quality).toBe('auto'))

	await act(async () => result.current.setQuality('high'))
	expect(result.current.quality).toBe('high')

	const mix = { ...GRAPHICS_PRESETS.high, view360Scenario: false }

	// Touching a switch makes it Personalizada.
	await act(async () => result.current.setCustom(mix))
	expect(result.current.quality).toBe('custom')
	expect(result.current.custom).toEqual(mix)

	const next = await renderHook(() => useGraphicsQuality())

	await waitFor(() => expect(next.result.current.quality).toBe('custom'))
	expect(next.result.current.custom).toEqual(mix)
})
