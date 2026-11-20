import { expect, test } from '@jest/globals'
import { http, HttpResponse } from 'msw'

import { syncPack } from '@/services/packSync'

import { __setNetState, OFFLINE } from '../../../jest/mocks/netinfo'
import { seedPackUser } from '../../../test-utils/pack'
import { server } from '../../../test-utils/server'

test('offline, a sync stops before any request', async () => {
	await seedPackUser(7)
	__setNetState(OFFLINE)

	let requests = 0

	server.use(
		http.all('*', () => {
			requests++

			return HttpResponse.json({})
		}),
	)

	await expect(syncPack({ userTriggered: true })).resolves.toEqual({
		kind: 'offline',
	})
	expect(requests).toBe(0)
})
