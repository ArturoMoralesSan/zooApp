import { expect, jest, test } from '@jest/globals'
import * as SecureStore from 'expo-secure-store'

import { getArPlacement, setArPlacement } from '@/services/preferences'

const KEY = 'zooapp_pref_ar_placement'

test('placement is automatic until the user picks another one', async () => {
	expect(await getArPlacement()).toBe('auto')

	await setArPlacement('plane')
	expect(await SecureStore.getItemAsync(KEY)).toBe('plane')
	expect(await getArPlacement()).toBe('plane')

	await setArPlacement('auto')
	expect(await getArPlacement()).toBe('auto')
})

test('an unknown or unreadable value falls back to automatic', async () => {
	await SecureStore.setItemAsync(KEY, 'sideways')
	expect(await getArPlacement()).toBe('auto')

	jest
		.mocked(SecureStore.getItemAsync)
		.mockRejectedValueOnce(new Error('keystore'))
	expect(await getArPlacement()).toBe('auto')
})

test('a failed save is not an error', async () => {
	jest
		.mocked(SecureStore.setItemAsync)
		.mockRejectedValueOnce(new Error('keystore'))

	await expect(setArPlacement('plane')).resolves.toBeUndefined()
})
