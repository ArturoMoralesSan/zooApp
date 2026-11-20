import { describe, expect, jest, test } from '@jest/globals'
import { act, renderHook, screen } from '@testing-library/react-native'
import type { ReactNode } from 'react'
import { http, HttpResponse } from 'msw'

import ReviewScreen from '@/app/duel/review'
import { DuelProvider, useDuel } from '@/contexts/DuelContext'

import {
	makeDuelStart,
	makeSubmitResponse,
} from '../../../test-utils/factories'
import { API, server } from '../../../test-utils/server'

jest.mock(
	'expo-router',
	() =>
		jest.requireActual<typeof import('../../../test-utils/router')>(
			'../../../test-utils/router',
		).expoRouterMock,
)
jest.mock(
	'expo-location',
	() =>
		jest.requireActual<typeof import('../../../test-utils/location')>(
			'../../../test-utils/location',
		).expoLocationMock,
)
jest.mock(
	'react-native-safe-area-context',
	() =>
		jest.requireActual<{ default: object }>(
			'react-native-safe-area-context/jest/mock',
		).default,
)

const duel = makeDuelStart({
	questions: [
		{
			id: 1,
			question: '¿Qué come el lobo?',
			answers: [
				{ id: 11, answer: 'Carne' },
				{ id: 12, answer: 'Pasto' },
				{ id: 13, answer: 'Frutas' },
			],
		},
	],
})

// The review screen reads the duel session the play screen left behind: the
// hook drives that session and the screen renders inside the same provider.
async function renderReview() {
	const { result } = await renderHook(() => useDuel(), {
		wrapper: ({ children }: { children: ReactNode }) => (
			<DuelProvider>
				{children}
				<ReviewScreen />
			</DuelProvider>
		),
	})

	return result
}

describe('duel review', () => {
	test('marks the right answer and the wrong one the user chose', async () => {
		server.use(
			http.post(`${API}/duels/9/submit`, () =>
				HttpResponse.json(
					makeSubmitResponse({
						outcome: 'locked',
						review: [{ question_id: 1, correct_answer_id: 11 }],
					}),
				),
			),
		)

		const session = await renderReview()

		await act(async () => session.current.begin('QR-1', duel))
		await act(async () => session.current.choose(1, 12))
		await act(async () => {
			await session.current.submit()
		})

		expect(screen.getByText('¿Qué come el lobo?')).toBeTruthy()
		// The state is in the label, never only in the color.
		expect(screen.getByLabelText('Carne, correcta')).toBeTruthy()
		expect(screen.getByLabelText('Pasto, incorrecta')).toBeTruthy()
		expect(screen.getByLabelText('Frutas')).toBeTruthy()
	})

	test('without a reviewed attempt there is nothing to show', async () => {
		await renderReview()

		expect(screen.getByText('No hay respuestas para mostrar')).toBeTruthy()
	})
})
