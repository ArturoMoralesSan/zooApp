import { expect, jest, test } from '@jest/globals'
import { act, renderHook, waitFor } from '@testing-library/react-native'
import * as SecureStore from 'expo-secure-store'

import { useAnimalView } from '@/hooks/useAnimalView'

const KEY = 'zooapp_pref_animal_view'

test('is null while reading, then the saved view', async () => {
	await SecureStore.setItemAsync(KEY, '360')

	let release = () => {}
	jest.mocked(SecureStore.getItemAsync).mockImplementationOnce(
		() =>
			new Promise((resolve) => {
				release = () => resolve('360')
			}),
	)

	const { result } = await renderHook(() => useAnimalView())

	expect(result.current.view).toBeNull()

	await act(async () => release())
	expect(result.current.view).toBe('360')
})

test('setting it shows at once and is saved for next time', async () => {
	const { result } = await renderHook(() => useAnimalView())

	await waitFor(() => expect(result.current.view).toBe('ar'))

	await act(async () => result.current.setView('360'))
	expect(result.current.view).toBe('360')
	expect(await SecureStore.getItemAsync(KEY)).toBe('360')

	const next = await renderHook(() => useAnimalView())

	await waitFor(() => expect(next.result.current.view).toBe('360'))
})

test('a choice made while reading wins over the stored one', async () => {
	await SecureStore.setItemAsync(KEY, 'ar')

	let release = () => {}
	jest.mocked(SecureStore.getItemAsync).mockImplementationOnce(
		() =>
			new Promise((resolve) => {
				release = () => resolve('ar')
			}),
	)

	const { result } = await renderHook(() => useAnimalView())

	await act(async () => result.current.setView('360'))
	await act(async () => release())
	expect(result.current.view).toBe('360')
})

test("reload reads a view saved elsewhere (a viewer's switch)", async () => {
	const { result } = await renderHook(() => useAnimalView())

	await waitFor(() => expect(result.current.view).toBe('ar'))

	await SecureStore.setItemAsync(KEY, '360')
	await act(async () => result.current.reload())
	await waitFor(() => expect(result.current.view).toBe('360'))
})
