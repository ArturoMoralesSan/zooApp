import { expect, jest, test } from '@jest/globals'
import { fireEvent, screen } from '@testing-library/react-native'
import * as SecureStore from 'expo-secure-store'
import { http, HttpResponse } from 'msw'

import DeckScreen from '@/app/deck/index'

import { makeOwnedCard } from '../../../test-utils/factories'
import { serveCards } from '../../../test-utils/pack'
import { renderWithProviders } from '../../../test-utils/render'
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
jest.mock('react-native-keyboard-controller', () =>
	jest.requireActual('react-native-keyboard-controller/jest'),
)

// No saved list and the server fails: an error with a way to retry.
test('a failed first load shows the error, and retrying loads the collection', async () => {
	await SecureStore.setItemAsync('zooapp_token', 'token-de-prueba')
	server.use(
		http.get(`${API}/cards`, () =>
			HttpResponse.json({ message: 'Error' }, { status: 500 }),
		),
	)

	await renderWithProviders(<DeckScreen />)

	expect(await screen.findByText('No pudimos cargar tus tarjetas')).toBeTruthy()

	server.use(serveCards([makeOwnedCard()]))
	await fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }))

	expect(
		await screen.findByLabelText('Lobo gris, Rara · Mamíferos'),
	).toBeTruthy()
})
