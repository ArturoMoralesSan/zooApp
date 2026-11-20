import {
	afterEach,
	beforeEach,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals'
import { screen } from '@testing-library/react-native'
import { http, HttpResponse } from 'msw'
import { AccessibilityInfo } from 'react-native'

import TicketSuccessScreen from '@/app/tickets/success'

import { makePointsAward, makeUser } from '../../../test-utils/factories'
import { renderWithProviders } from '../../../test-utils/render'
import { searchParams } from '../../../test-utils/router'
import { API, server } from '../../../test-utils/server'

jest.mock(
	'expo-router',
	() =>
		jest.requireActual<typeof import('../../../test-utils/router')>(
			'../../../test-utils/router',
		).expoRouterMock,
)
jest.mock(
	'react-native-safe-area-context',
	() =>
		jest.requireActual<{ default: object }>(
			'react-native-safe-area-context/jest/mock',
		).default,
)
jest.mock('react-native-qrcode-svg', () => () => null)

const order = {
	id: 12,
	total: '240.00',
	tickets: [{ id: 1, ticket_type_id: 1, qr_token: 'qr-1' }],
}

describe('ticket purchase success', () => {
	beforeEach(() => {
		jest
			.spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
			.mockResolvedValue(true)
		server.use(
			http.get(`${API}/tickets/types`, () => HttpResponse.json([])),
			http.get(`${API}/profile`, () =>
				HttpResponse.json({ success: true, user: makeUser() }),
			),
		)
	})

	afterEach(() => {
		jest.restoreAllMocks()
	})

	test('shows the points the order gave', async () => {
		searchParams.mockReturnValue({
			order: JSON.stringify({
				...order,
				points: makePointsAward({ awarded: 10 }),
			}),
		})

		await renderWithProviders(<TicketSuccessScreen />)

		expect(await screen.findByText('+10')).toBeTruthy()
		expect(screen.getByText('¡Compra realizada!')).toBeTruthy()
	})

	test('without points it is the same confirmation as before', async () => {
		searchParams.mockReturnValue({ order: JSON.stringify(order) })

		await renderWithProviders(<TicketSuccessScreen />)

		expect(await screen.findByText('¡Compra realizada!')).toBeTruthy()
		expect(screen.queryByText('Puntos ganados')).toBeNull()
	})
})
