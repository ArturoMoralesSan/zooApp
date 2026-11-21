import { describe, expect, test } from '@jest/globals'
import { http, HttpResponse } from 'msw'

import { createDonation } from '@/services/donations'

import { makePointsAward } from '../../test-utils/factories'
import { API, server } from '../../test-utils/server'

const donation = { id: 4, amount: '100.00', status: 'completed' }

describe('createDonation points', () => {
	test('returns the donation and the points it gave', async () => {
		const points = makePointsAward({ awarded: 5, total: 315 })

		server.use(
			http.post(`${API}/donations`, () =>
				HttpResponse.json(
					{ success: true, data: { donation, points } },
					{ status: 201 },
				),
			),
		)

		expect(await createDonation({ amount: 100 })).toEqual({
			donation,
			points,
		})
	})

	// Servers older than donation points.
	test('points are null when the server sends none', async () => {
		server.use(
			http.post(`${API}/donations`, () =>
				HttpResponse.json(
					{ success: true, data: { donation } },
					{ status: 201 },
				),
			),
		)

		expect((await createDonation({ amount: 100 })).points).toBeNull()
	})
})
