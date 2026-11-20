import { describe, expect, jest, test } from '@jest/globals'
import { act, renderHook } from '@testing-library/react-native'
import * as Location from 'expo-location'
import { delay, http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'

import { DuelProvider, useDuel } from '@/contexts/DuelContext'
import { ApiError } from '@/services/api'

import { makeDuelStart, makeSubmitResponse } from '../../test-utils/factories'
import { permission } from '../../test-utils/location'
import { API, server } from '../../test-utils/server'

jest.mock(
	'expo-location',
	() =>
		jest.requireActual<typeof import('../../test-utils/location')>(
			'../../test-utils/location',
		).expoLocationMock,
)

function Providers({ children }: { children: ReactNode }) {
	return <DuelProvider>{children}</DuelProvider>
}

const renderDuel = () => renderHook(() => useDuel(), { wrapper: Providers })

const duel = makeDuelStart({
	questions: [
		{ id: 1, question: 'P1', answers: [{ id: 11, answer: 'A' }] },
		{ id: 2, question: 'P2', answers: [{ id: 22, answer: 'B' }] },
	],
})

describe('a duel session', () => {
	test('begin starts clean and choose records one answer per question', async () => {
		const { result } = await renderDuel()

		await act(async () => result.current.begin('QR-1', duel))
		await act(async () => result.current.choose(1, 11))
		await act(async () => result.current.choose(2, 22))
		await act(async () => result.current.choose(1, 12))

		expect(result.current).toMatchObject({
			code: 'QR-1',
			duel,
			answers: { 1: 12, 2: 22 },
			result: null,
			submitting: false,
		})
	})

	test("submit sends the answers with the visit's coordinates", async () => {
		const bodies: unknown[] = []

		// With the visit checks on, submitting asks for the permission.
		jest
			.mocked(Location.requestForegroundPermissionsAsync)
			.mockResolvedValueOnce(permission(true))
		server.use(
			http.post(`${API}/duels/9/submit`, async ({ request }) => {
				bodies.push(await request.json())

				return HttpResponse.json(makeSubmitResponse({ outcome: 'won' }), {
					status: 201,
				})
			}),
		)

		const { result } = await renderDuel()

		await act(async () => result.current.begin('QR-1', duel))
		await act(async () => result.current.choose(1, 11))
		await act(async () => {
			await result.current.submit()
		})

		// An unanswered question is sent without an answer.
		expect(bodies).toEqual([
			{
				answers: [{ question_id: 1, answer_id: 11 }, { question_id: 2 }],
				latitude: 24.07,
				longitude: -104.58,
				accuracy: 8,
			},
		])
		expect(result.current.result?.data.outcome).toBe('won')
	})

	// A double tap would submit twice and get a 409.
	test('a second submit while the first is sending is refused', async () => {
		let posts = 0

		server.use(
			http.post(`${API}/duels/9/submit`, async () => {
				posts++
				await delay(20)

				return HttpResponse.json(makeSubmitResponse(), { status: 201 })
			}),
		)

		const { result } = await renderDuel()

		await act(async () => result.current.begin('QR-1', duel))

		let second: unknown

		await act(async () => {
			const first = result.current.submit()

			second = await result.current.submit().catch((error: unknown) => error)
			await first
		})

		expect(posts).toBe(1)
		expect(second).toEqual(new Error('Ya estamos enviando tus respuestas.'))
		expect(result.current.submitting).toBe(false)
	})

	test('a failed submit keeps no result and can be sent again', async () => {
		server.use(
			http.post(`${API}/duels/9/submit`, () =>
				HttpResponse.json({ message: 'Error' }, { status: 500 }),
			),
		)

		const { result } = await renderDuel()

		await act(async () => result.current.begin('QR-1', duel))

		let error: unknown

		await act(async () => {
			error = await result.current.submit().catch((reason: unknown) => reason)
		})

		expect(error).toBeInstanceOf(ApiError)
		expect(result.current.result).toBeNull()
		expect(result.current.submitting).toBe(false)
	})
})

describe('retry', () => {
	test('starts a new attempt with the same code, answers cleared', async () => {
		const next = makeDuelStart({
			attempt_id: 10,
			attempts: { max: 3, left: 2, locked_until: null },
		})
		const codes: unknown[] = []

		server.use(
			http.post(`${API}/duels`, async ({ request }) => {
				codes.push(((await request.json()) as { code: string }).code)

				return HttpResponse.json({ data: next }, { status: 201 })
			}),
		)

		const { result } = await renderDuel()

		await act(async () => result.current.begin('QR-1', duel))
		await act(async () => result.current.choose(1, 11))
		await act(async () => {
			await expect(result.current.retry()).resolves.toMatchObject({
				kind: 'started',
			})
		})

		expect(codes).toEqual(['QR-1'])
		expect(result.current.duel).toEqual(next)
		expect(result.current.answers).toEqual({})
	})

	test('a refused attempt leaves the duel as it was', async () => {
		server.use(
			http.post(`${API}/duels`, () =>
				HttpResponse.json(
					{ message: 'Bloqueada', data: { attempts: duel.attempts } },
					{ status: 423 },
				),
			),
		)

		const { result } = await renderDuel()

		await act(async () => result.current.begin('QR-1', duel))
		await act(async () => result.current.choose(1, 11))
		await act(async () => {
			await expect(result.current.retry()).resolves.toMatchObject({
				kind: 'locked',
			})
		})

		expect(result.current.duel).toEqual(duel)
		expect(result.current.answers).toEqual({ 1: 11 })
	})
})

describe('without a duel', () => {
	test('retry and submit throw', async () => {
		const { result } = await renderDuel()

		await expect(result.current.retry()).rejects.toThrow(
			'No hay un duelo en curso.',
		)
		await expect(result.current.submit()).rejects.toThrow(
			'No hay un duelo en curso.',
		)
	})

	test('useDuel outside DuelProvider fails loudly', async () => {
		jest.spyOn(console, 'error').mockImplementation(() => undefined)

		await expect(renderHook(() => useDuel())).rejects.toThrow(
			'useDuel debe utilizarse dentro de DuelProvider.',
		)

		jest.mocked(console.error).mockRestore()
	})
})
