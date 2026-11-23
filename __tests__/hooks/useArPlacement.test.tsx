import { expect, jest, test } from '@jest/globals'
import { act, renderHook, waitFor } from '@testing-library/react-native'
import * as SecureStore from 'expo-secure-store'

import { useArPlacement } from '@/hooks/useArPlacement'

const KEY = 'zooapp_pref_ar_placement'

test('is null while reading, then the saved placement', async () => {
	await SecureStore.setItemAsync(KEY, 'plane')

	let release = () => {}
	jest.mocked(SecureStore.getItemAsync).mockImplementationOnce(
		() =>
			new Promise((resolve) => {
				release = () => resolve('plane')
			}),
	)

	const { result } = await renderHook(() => useArPlacement())

	expect(result.current.placement).toBeNull()

	await act(async () => release())
	expect(result.current.placement).toBe('plane')
})

test('setting it shows at once and is saved for next time', async () => {
	const { result } = await renderHook(() => useArPlacement())

	await waitFor(() => expect(result.current.placement).toBe('auto'))

	await act(async () => result.current.setPlacement('plane'))
	expect(result.current.placement).toBe('plane')
	expect(await SecureStore.getItemAsync(KEY)).toBe('plane')

	const next = await renderHook(() => useArPlacement())

	await waitFor(() => expect(next.result.current.placement).toBe('plane'))
})

test('a choice made while reading wins over the stored one', async () => {
	await SecureStore.setItemAsync(KEY, 'plane')

	let release = () => {}
	jest.mocked(SecureStore.getItemAsync).mockImplementationOnce(
		() =>
			new Promise((resolve) => {
				release = () => resolve('plane')
			}),
	)

	const { result } = await renderHook(() => useArPlacement())

	await act(async () => result.current.setPlacement('auto'))
	await act(async () => release())
	expect(result.current.placement).toBe('auto')
})
