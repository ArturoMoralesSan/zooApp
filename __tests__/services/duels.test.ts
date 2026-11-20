import { describe, expect, test } from '@jest/globals'
import { http, HttpResponse } from 'msw'

import { ApiError, NetworkError } from '@/services/api'
import { startDuel, submitDuel, type DuelStartResult } from '@/services/duels'

import { makeDuelStart, makeSubmitResponse } from '../../test-utils/factories'
import { API, server } from '../../test-utils/server'

function answerDuel(status: number, body: object) {
	server.use(
		http.post(`${API}/duels`, () => HttpResponse.json(body, { status })),
	)
}

describe('startDuel', () => {
	const duel = makeDuelStart()
	const card = { id: 1 }
	const attempts = { max: 3, left: 0, locked_until: '2026-11-19T20:00:00Z' }

	// The expected refusals are results to show, not errors.
	type Expected = { kind: DuelStartResult['kind'] } & Record<string, unknown>

	test.each<[string, number, object, Expected]>([
		['started', 201, { data: duel }, { kind: 'started', duel }],
		[
			'already owned',
			409,
			{ message: 'Ya la tienes', data: { card } },
			{ kind: 'owned', message: 'Ya la tienes', card },
		],
		[
			'locked',
			423,
			{ message: 'Bloqueada', data: { attempts } },
			{ kind: 'locked', message: 'Bloqueada', attempts },
		],
		[
			'unknown QR',
			404,
			{ message: 'QR desconocido' },
			{ kind: 'unavailable', message: 'QR desconocido' },
		],
		[
			'expired QR',
			410,
			{ message: 'QR vencido' },
			{ kind: 'unavailable', message: 'QR vencido' },
		],
		[
			'card without questions',
			422,
			{ message: 'Sin preguntas' },
			{ kind: 'unavailable', message: 'Sin preguntas' },
		],
		// location_required is a 422 too: the visit reason wins.
		[
			'no location',
			422,
			{ message: 'Activa tu ubicación', data: { reason: 'location_required' } },
			{ kind: 'visit', reason: 'location_required' },
		],
		[
			'outside the zoo',
			403,
			{ message: 'Fuera del zoo', data: { reason: 'outside_zoo' } },
			{ kind: 'visit', reason: 'outside_zoo' },
		],
		[
			'no ticket for today',
			403,
			{ message: 'Sin boleto', data: { reason: 'no_ticket' } },
			{ kind: 'visit', reason: 'no_ticket', message: 'Sin boleto' },
		],
	])('%s (%i)', async (_, status, body, expected) => {
		answerDuel(status, body)

		await expect(startDuel('QR-1')).resolves.toMatchObject(expected)
	})

	test.each<[string, number, object]>([
		['409 without the card', 409, { message: 'Conflicto' }],
		['423 without attempts', 423, { message: 'Bloqueada' }],
		['403 for another reason', 403, { data: { reason: 'banned' } }],
		['server error', 500, { message: 'Error' }],
	])('%s is thrown', async (_, status, body) => {
		answerDuel(status, body)

		await expect(startDuel('QR-1')).rejects.toMatchObject({ status })
		await expect(startDuel('QR-1')).rejects.toBeInstanceOf(ApiError)
	})

	test('a lost connection is thrown as NetworkError', async () => {
		server.use(http.post(`${API}/duels`, () => HttpResponse.error()))

		await expect(startDuel('QR-1')).rejects.toBeInstanceOf(NetworkError)
	})

	test('sends the code with the coordinates, or the code alone', async () => {
		const bodies: unknown[] = []

		server.use(
			http.post(`${API}/duels`, async ({ request }) => {
				bodies.push(await request.json())

				return HttpResponse.json({ data: duel }, { status: 201 })
			}),
		)

		await startDuel('QR-1', {
			latitude: 24.07,
			longitude: -104.58,
			accuracy: 9,
		})
		await startDuel('QR-1', null)

		expect(bodies).toEqual([
			{ code: 'QR-1', latitude: 24.07, longitude: -104.58, accuracy: 9 },
			{ code: 'QR-1' },
		])
	})
})

describe('submitDuel', () => {
	test("posts the attempt's answers and returns the graded result", async () => {
		const response = makeSubmitResponse({ outcome: 'won' })
		let body: unknown

		server.use(
			http.post(`${API}/duels/9/submit`, async ({ request }) => {
				body = await request.json()

				return HttpResponse.json(response, { status: 201 })
			}),
		)

		await expect(
			submitDuel(9, [{ question_id: 1, answer_id: 11 }], {
				latitude: 24.07,
				longitude: -104.58,
			}),
		).resolves.toEqual(response)
		expect(body).toEqual({
			answers: [{ question_id: 1, answer_id: 11 }],
			latitude: 24.07,
			longitude: -104.58,
		})
	})

	test('an attempt already graded (409) is thrown', async () => {
		server.use(
			http.post(`${API}/duels/9/submit`, () =>
				HttpResponse.json({ message: 'Ya enviado' }, { status: 409 }),
			),
		)

		await expect(submitDuel(9, [])).rejects.toMatchObject({
			status: 409,
			message: 'Ya enviado',
		})
	})
})
