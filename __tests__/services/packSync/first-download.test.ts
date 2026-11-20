import { expect, test } from '@jest/globals'
import { Directory, File, Paths } from 'expo-file-system'

import { getPackStatus, syncPack } from '@/services/packSync'

import {
	makePackedCard,
	seedPackUser,
	servePack,
} from '../../../test-utils/pack'
import { server } from '../../../test-utils/server'

// "Descargar" at home on Wi-Fi: the whole catalog is downloaded (it's
// shared), but only the user's own cards are decrypted.
test('downloads every file, checks it and decrypts only the owned cards', async () => {
	const user = await seedPackUser(7)
	const owned = await makePackedCard(1, { plain: 'lobo' })
	const other = await makePackedCard(2, { owned: false })
	const pack = servePack([owned, other])

	server.use(...pack.handlers)

	await expect(syncPack({ userTriggered: true })).resolves.toEqual({
		kind: 'downloaded',
		count: 2,
		failed: 0,
	})

	expect(pack.downloaded.sort()).toEqual([owned.file.url, other.file.url])

	const packs = new Directory(Paths.document, 'packs')

	expect(
		packs
			.list()
			.map((item) => item.name)
			.sort(),
	).toEqual(['1-v1.bin', '2-v1.bin', 'index.json'])

	// Only card 1 is decrypted, under the user's folder.
	const copy = new File(user, '1-model-1-v1.glb')

	await expect(copy.text()).resolves.toBe('lobo')
	expect(
		user
			.list()
			.map((item) => item.name)
			.sort(),
	).toEqual(['1-model-1-v1.glb', 'cards.json', 'index.json'])

	expect(getPackStatus()).toMatchObject({
		activity: 'idle',
		enabled: true,
		totalCount: 2,
		doneCount: 2,
		pendingCount: 0,
		failedCount: 0,
		progress: 1,
	})
})
