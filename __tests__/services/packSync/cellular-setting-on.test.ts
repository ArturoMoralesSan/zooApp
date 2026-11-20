import { expect, test } from '@jest/globals'

import { setCellularUpdates } from '@/services/pack'
import { emptyPackIndex, writePackIndex } from '@/services/packStore'
import { syncPack } from '@/services/packSync'

import { __setNetState, CELLULAR } from '../../../jest/mocks/netinfo'
import {
	makePackedCard,
	seedPackUser,
	servePack,
} from '../../../test-utils/pack'
import { server } from '../../../test-utils/server'

test('with "Usar datos móviles" on, an automatic sync downloads on mobile data', async () => {
	await seedPackUser(7)
	writePackIndex({ ...emptyPackIndex(), enabled: true })
	await setCellularUpdates(true)
	__setNetState(CELLULAR)

	const card = await makePackedCard(1)
	const pack = servePack([card])

	server.use(...pack.handlers)

	await expect(syncPack()).resolves.toEqual({
		kind: 'downloaded',
		count: 1,
		failed: 0,
	})
	expect(pack.downloaded).toEqual([card.file.url])
})
