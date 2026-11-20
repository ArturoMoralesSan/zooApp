import { expect, test } from '@jest/globals'
import * as SecureStore from 'expo-secure-store'

import { getLastUserId, setLastUserId } from '@/services/packStore'

// One scenario: getLastUserId caches in the module for the app's lifetime.
test('the last signed-in user is read once, then kept in memory', async () => {
	await SecureStore.setItemAsync('zooapp_pack_user', '7')

	await expect(getLastUserId()).resolves.toBe(7)

	// Not read again: an offline restart relies on the first read.
	await SecureStore.setItemAsync('zooapp_pack_user', '8')
	await expect(getLastUserId()).resolves.toBe(7)

	await setLastUserId(9)
	await expect(getLastUserId()).resolves.toBe(9)
	await expect(SecureStore.getItemAsync('zooapp_pack_user')).resolves.toBe('9')

	// Logout: no user, and nothing left in storage.
	await setLastUserId(null)
	await expect(getLastUserId()).resolves.toBeNull()
	await expect(SecureStore.getItemAsync('zooapp_pack_user')).resolves.toBeNull()
})
