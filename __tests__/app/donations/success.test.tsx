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

import DonationSuccessScreen from '@/app/donations/success'

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

const donation = JSON.stringify({ id: 4, amount: '100.00' })

describe('donation success', () => {
	beforeEach(() => {
		jest
			.spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
			.mockResolvedValue(true)
		server.use(
			http.get(`${API}/profile`, () =>
				HttpResponse.json({ success: true, user: makeUser() }),
			),
		)
	})

	afterEach(() => {
		jest.restoreAllMocks()
	})

	test('shows the points the donation gave', async () => {
		searchParams.mockReturnValue({
			donation,
			points: JSON.stringify(makePointsAward({ awarded: 5 })),
		})

		await renderWithProviders(<DonationSuccessScreen />)

		expect(await screen.findByText('+5')).toBeTruthy()
	})

	// Under the server's minimum: a plain thank-you, no talk of points.
	test('a donation that gave no points just thanks', async () => {
		searchParams.mockReturnValue({
			donation,
			points: JSON.stringify(makePointsAward({ awarded: 0 })),
		})

		await renderWithProviders(<DonationSuccessScreen />)

		expect(await screen.findByText('¡Donación realizada!')).toBeTruthy()
		expect(screen.queryByText('Puntos ganados')).toBeNull()
		expect(screen.queryByText('+0')).toBeNull()
	})

	test('an unreadable points param is ignored', async () => {
		searchParams.mockReturnValue({ donation, points: '{not json' })

		await renderWithProviders(<DonationSuccessScreen />)

		expect(await screen.findByText('¡Donación realizada!')).toBeTruthy()
		expect(screen.queryByText('Puntos ganados')).toBeNull()
	})
})
