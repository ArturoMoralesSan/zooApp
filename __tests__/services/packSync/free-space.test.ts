import { expect, test } from '@jest/globals'
import { Directory, File, Paths } from 'expo-file-system'

import { readPackIndex } from '@/services/packStore'
import { freePackSpace, getPackStatus, syncPack } from '@/services/packSync'

import {
	makePackedCard,
	seedPackUser,
	servePack,
} from '../../../test-utils/pack'
import { server } from '../../../test-utils/server'

// "Liberar espacio": the downloads and decrypted copies go, the catalog and
// the saved card list stay (the collection still works offline), and
// background downloads stop until the user asks again.
test('freeing space deletes files and copies but keeps the catalog and card list', async () => {
	const user = await seedPackUser(7)

	server.use(...servePack([await makePackedCard(1)]).handlers)
	await syncPack({ userTriggered: true })

	expect(new File(user, '1-model-1-v1.glb').exists).toBe(true)

	await freePackSpace()

	// Only the index is written back, to keep the catalog.
	expect(
		new Directory(Paths.document, 'packs').list().map((item) => item.name),
	).toEqual(['index.json'])
	expect(new File(user, '1-model-1-v1.glb').exists).toBe(false)
	expect(new File(user, 'cards.json').exists).toBe(true)

	await expect(readPackIndex()).resolves.toMatchObject({
		enabled: false,
		files: {},
		etag: '"manifest-1"',
	})
	expect(getPackStatus()).toMatchObject({
		enabled: false,
		hasManifest: true,
		doneCount: 0,
		pendingCount: 1,
	})
})
