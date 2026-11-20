import { expect, test } from '@jest/globals'

import { readPackIndex } from '@/services/packStore'
import { syncPack } from '@/services/packSync'

import { __setNetState, CELLULAR } from '../../../jest/mocks/netinfo'
import {
	makePackedCard,
	seedPackUser,
	servePack,
} from '../../../test-utils/pack'
import { server } from '../../../test-utils/server'

// The user tapped "Descargar con datos" after the screen asked: the sync
// downloads on mobile data and background downloads stay enabled.
test('a sync the user asked for downloads on mobile data and enables the pack', async () => {
	await seedPackUser(7)
	__setNetState(CELLULAR)

	const card = await makePackedCard(1)
	const pack = servePack([card])

	server.use(...pack.handlers)

	await expect(syncPack({ userTriggered: true })).resolves.toEqual({
		kind: 'downloaded',
		count: 1,
		failed: 0,
	})
	expect(pack.downloaded).toEqual([card.file.url])
	await expect(readPackIndex()).resolves.toMatchObject({ enabled: true })
})
