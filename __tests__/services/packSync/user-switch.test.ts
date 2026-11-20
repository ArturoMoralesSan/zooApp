import { expect, test } from '@jest/globals'
import { File, Paths } from 'expo-file-system'
import * as SecureStore from 'expo-secure-store'

import { getStoredCards } from '@/services/cards'
import { setPackUser } from '@/services/packSync'

import { makeOwnedCard } from '../../../test-utils/factories'
import { seedPackUser } from '../../../test-utils/pack'

// An expired session skips logout: the next account to sign in must not
// inherit the previous one's decrypted cards or card list.
test("signing in as another user deletes the previous user's copies and list", async () => {
	const previous = await seedPackUser(7)

	new File(previous, '1-model-v1.glb').write('decrypted model')
	new File(previous, 'cards.json').write(
		JSON.stringify({ etag: '"c1"', cards: [makeOwnedCard()] }),
	)

	// The app restarted offline: the previous list is still served.
	await expect(getStoredCards()).resolves.toEqual([makeOwnedCard()])

	await setPackUser(8)

	expect(previous.exists).toBe(false)
	await expect(SecureStore.getItemAsync('zooapp_pack_user')).resolves.toBe('8')
	// User 8 has no saved list yet: unknown, not the previous user's.
	await expect(getStoredCards()).resolves.toBeNull()
	expect(new File(Paths.document, 'cards', '8', 'cards.json').exists).toBe(
		false,
	)
})
