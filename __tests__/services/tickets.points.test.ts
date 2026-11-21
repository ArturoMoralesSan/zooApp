import { describe, expect, test } from '@jest/globals'
import { http, HttpResponse } from 'msw'

import { createOrder } from '@/services/tickets'

import { makePointsAward } from '../../test-utils/factories'
import { API, server } from '../../test-utils/server'

const order = {
	id: 1,
	folio: 'ZOO-20261120-64707',
	total: '240.00',
	tickets: [],
}

describe('createOrder points', () => {
	test('keeps the points the server gave for the order', async () => {
		const points = makePointsAward({ awarded: 20, level_up: true })

		server.use(
			http.post(`${API}/tickets/orders`, () =>
				HttpResponse.json(
					{
						message: 'Compra realizada correctamente.',
						data: { ...order, points },
					},
					{ status: 201 },
				),
			),
		)

		expect((await createOrder({ items: [] })).points).toEqual(points)
	})

	// Servers older than purchase points: the order works without them.
	test('works without points', async () => {
		server.use(
			http.post(`${API}/tickets/orders`, () =>
				HttpResponse.json({ data: order }, { status: 201 }),
			),
		)

		const result = await createOrder({ items: [] })

		expect(result.folio).toBe(order.folio)
		expect(result.points).toBeUndefined()
	})
})
