import { expect, test } from '@jest/globals'

import { emptyPackIndex, writePackIndex } from '@/services/packStore'
import { getPackStatus, syncPack } from '@/services/packSync'

import { __setNetState, CELLULAR } from '../../../jest/mocks/netinfo'
import {
	makePackedCard,
	seedPackUser,
	servePack,
} from '../../../test-utils/pack'
import { server } from '../../../test-utils/server'

// "Usar datos móviles para actualizar" is off by default: a background sync
// on mobile data checks the catalog but never downloads the files.
test('an automatic sync on mobile data waits for Wi-Fi', async () => {
	await seedPackUser(7)
	writePackIndex({ ...emptyPackIndex(), enabled: true })
	__setNetState(CELLULAR)

	const pack = servePack([await makePackedCard(1)])

	server.use(...pack.handlers)

	await expect(syncPack()).resolves.toEqual({ kind: 'waiting' })

	expect(pack.downloaded).toEqual([])
	expect(getPackStatus()).toMatchObject({
		activity: 'idle',
		hasManifest: true,
		pendingCount: 1,
	})
})
