import { beforeAll, expect, jest, test } from '@jest/globals'
import { act, renderHook } from '@testing-library/react-native'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'

import { server } from '../../test-utils/server'

jest.mock(
	'expo-location',
	() =>
		jest.requireActual<typeof import('../../test-utils/location')>(
			'../../test-utils/location',
		).expoLocationMock,
)

type DuelModule = typeof import('@/contexts/DuelContext')
type DebugModule = typeof import('@/utils/zoodeckDebug')

let DuelProvider: DuelModule['DuelProvider']
let useDuel: DuelModule['useDuel']
let debug: DebugModule

// The flag is read when zoodeckDebug loads, so it's set before loading.
beforeAll(() => {
	process.env.EXPO_PUBLIC_ZOODECK_QUIZ_DEBUG = '1'
	;({ DuelProvider, useDuel } = jest.requireActual<DuelModule>(
		'@/contexts/DuelContext',
	))
	debug = jest.requireActual<DebugModule>('@/utils/zoodeckDebug')
})

// EXPO_PUBLIC_ZOODECK_QUIZ_DEBUG=1: the fake duel is graded on the phone and
// never reaches the API.
test('the debug duel is graded locally and retried without the server', async () => {
	let requests = 0

	server.use(
		http.all('*', () => {
			requests++

			return HttpResponse.json({})
		}),
	)

	const { result } = await renderHook(() => useDuel(), {
		wrapper: ({ children }: { children: ReactNode }) => (
			<DuelProvider>{children}</DuelProvider>
		),
	})

	expect(debug.ZOODECK_QUIZ_DEBUG).toBe(true)

	await act(async () =>
		result.current.begin(debug.DEBUG_DUEL_CODE, debug.createDebugDuel()),
	)
	await act(async () => result.current.choose(1, 10))
	await act(async () => {
		await result.current.submit()
	})

	expect(result.current.result?.data).toMatchObject({
		outcome: 'retry',
		attempts: { left: 2 },
	})

	// Retry continues with the attempts that are left.
	await act(async () => {
		await expect(result.current.retry()).resolves.toMatchObject({
			kind: 'started',
		})
	})

	expect(result.current.duel?.attempts.left).toBe(2)
	expect(result.current.answers).toEqual({})
	expect(requests).toBe(0)
})
