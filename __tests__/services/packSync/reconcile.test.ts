import { expect, test } from '@jest/globals'
import { File, Paths } from 'expo-file-system'

import { emptyPackIndex, writePackIndex } from '@/services/packStore'
import { getPackStatus, syncPack } from '@/services/packSync'

import { __setNetState, CELLULAR } from '../../../jest/mocks/netinfo'
import {
	makePackedCard,
	seedPackUser,
	servePack,
} from '../../../test-utils/pack'
import { server } from '../../../test-utils/server'

// The zoo published a new version of a card's model: the old .bin is
// deleted and the card shows as an update, not as a first download.
test('a replaced file is dropped and its card shows an update', async () => {
	await seedPackUser(7)

	const old = new File(Paths.document, 'packs', '1-v1.bin')

	writePackIndex({
		...emptyPackIndex(),
		enabled: true,
		files: { '1-v1': { card_id: 1, kind: 'model', bytes: 10 } },
	})
	old.write('old encrypted model')

	// On mobile data, so the new version is only listed, not downloaded.
	__setNetState(CELLULAR)
	server.use(
		...servePack([await makePackedCard(1, { version: 'v2' })]).handlers,
	)

	await expect(syncPack()).resolves.toEqual({ kind: 'waiting' })

	expect(old.exists).toBe(false)
	expect(getPackStatus()).toMatchObject({
		doneCount: 0,
		pendingCount: 1,
		updateCount: 1,
	})
	expect(getPackStatus().files[0]).toMatchObject({
		id: '1-v2',
		state: 'update',
	})
})
