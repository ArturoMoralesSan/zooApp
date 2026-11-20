import { expect, test } from '@jest/globals'

import { getPackStatus, syncPack } from '@/services/packSync'

import { __setAvailableDiskSpace } from '../../../jest/mocks/file-system'
import {
	makePackedCard,
	seedPackUser,
	servePack,
} from '../../../test-utils/pack'
import { server } from '../../../test-utils/server'

// Each file needs room for itself and its decrypted copy, plus 20 MB.
test('without room for the files and their copies nothing is downloaded', async () => {
	await seedPackUser(7)

	const card = await makePackedCard(1)
	const pack = servePack([card])

	server.use(...pack.handlers)
	__setAvailableDiskSpace(card.file.bytes * 2 + 20 * 1024 * 1024)

	await expect(syncPack({ userTriggered: true })).resolves.toEqual({
		kind: 'noSpace',
	})

	expect(pack.downloaded).toEqual([])
	expect(getPackStatus().activity).toBe('noSpace')
	expect(getPackStatus().files[0].state).toBe('noSpace')
})
