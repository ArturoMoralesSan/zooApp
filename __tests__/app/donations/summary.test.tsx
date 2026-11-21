import { expect, jest, test } from '@jest/globals'
import { fireEvent, screen, waitFor } from '@testing-library/react-native'
import * as SecureStore from 'expo-secure-store'
import { delay, http, HttpResponse } from 'msw'

import DonationsSummaryScreen from '@/app/donations/summary'

import { renderWithProviders } from '../../../test-utils/render'
import { routerSpies, searchParams } from '../../../test-utils/router'
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

test('two quick taps on confirm send one donation', async () => {
	await SecureStore.setItemAsync('zooapp_token', 'token-de-prueba')
	let posts = 0
	server.use(
		http.post(`${API}/donations`, async () => {
			posts += 1
			await delay(50)

			return HttpResponse.json({ donation: { id: 4, amount: '100.00' } })
		}),
	)
	searchParams.mockReturnValue({ amount: '100' })
	await renderWithProviders(<DonationsSummaryScreen />)
	const confirm = await screen.findByText('Confirmar donación')

	// Both taps land before the screen re-renders as busy.
	await Promise.all([fireEvent.press(confirm), fireEvent.press(confirm)])

	await waitFor(() =>
		expect(routerSpies.replace).toHaveBeenCalledWith(
			expect.objectContaining({ pathname: '/donations/success' }),
		),
	)
	expect(posts).toBe(1)
})
