import { expect, jest, test } from '@jest/globals'
import { fireEvent, screen, waitFor } from '@testing-library/react-native'
import * as SecureStore from 'expo-secure-store'
import { delay, http, HttpResponse } from 'msw'

import TicketSummaryScreen from '@/app/tickets/summary'

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

test('two quick taps on buy send one order', async () => {
	await SecureStore.setItemAsync('zooapp_token', 'token-de-prueba')
	let posts = 0
	server.use(
		http.get(`${API}/tickets/types`, () =>
			HttpResponse.json([{ id: 1, name: 'Adulto', price: 80 }]),
		),
		http.post(`${API}/tickets/orders`, async () => {
			posts += 1
			await delay(50)

			return HttpResponse.json({ data: { id: 9, folio: 'A-9' } })
		}),
	)
	searchParams.mockReturnValue({
		items: JSON.stringify([{ ticket_type_id: 1, quantity: 2 }]),
	})
	await renderWithProviders(<TicketSummaryScreen />)
	const buy = await screen.findByText('Aceptar y comprar')

	// Both taps land before the screen re-renders as busy.
	await Promise.all([fireEvent.press(buy), fireEvent.press(buy)])

	await waitFor(() =>
		expect(routerSpies.replace).toHaveBeenCalledWith(
			expect.objectContaining({ pathname: '/tickets/success' }),
		),
	)
	expect(posts).toBe(1)
})
