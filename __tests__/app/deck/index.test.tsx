import { expect, jest, test } from '@jest/globals'
import { fireEvent, screen } from '@testing-library/react-native'
import * as SecureStore from 'expo-secure-store'

import DeckScreen from '@/app/deck/index'

import { makeOwnedCard, makeUnownedCard } from '../../../test-utils/factories'
import { serveCards } from '../../../test-utils/pack'
import { renderWithProviders } from '../../../test-utils/render'
import { routerSpies } from '../../../test-utils/router'
import { server } from '../../../test-utils/server'

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

const UNDISCOVERED = 'Tarjeta sin descubrir'

// One scenario: services/cards keeps the list in the module.
test('the collection shows owned cards first, all cards on demand, and searches owned ones', async () => {
	await SecureStore.setItemAsync('zooapp_token', 'token-de-prueba')
	server.use(
		serveCards([
			makeOwnedCard({ id: 1, name: 'Lobo gris' }),
			makeOwnedCard({ id: 3, name: 'Jaguar', category_name: null }),
			makeUnownedCard({ id: 2 }),
		]),
	)

	await renderWithProviders(<DeckScreen />)

	// "Obtenidos" by default: only the cards the user won.
	expect(
		await screen.findByLabelText('Lobo gris, Rara · Mamíferos'),
	).toBeTruthy()
	expect(screen.getByLabelText('Jaguar, Rara')).toBeTruthy()
	expect(screen.queryByLabelText(UNDISCOVERED)).toBeNull()

	// "Todos" adds the undiscovered ones, which reveal nothing.
	await fireEvent.press(screen.getByRole('tab', { name: 'Todos · 3' }))
	expect(
		screen.getByRole('tab', { name: 'Todos · 3', selected: true }),
	).toBeTruthy()
	expect(screen.getByLabelText(UNDISCOVERED)).toBeTruthy()

	// A search only matches owned cards: undiscovered ones have no name.
	const search = screen.getByPlaceholderText('Buscar tarjeta')

	await fireEvent.changeText(search, 'lobo')
	expect(screen.getByLabelText('Lobo gris, Rara · Mamíferos')).toBeTruthy()
	expect(screen.queryByLabelText('Jaguar, Rara')).toBeNull()
	expect(screen.queryByLabelText(UNDISCOVERED)).toBeNull()

	await fireEvent.changeText(search, 'tigre')
	expect(screen.getByText('No encontramos tarjetas')).toBeTruthy()

	// An owned card opens its viewer.
	await fireEvent.changeText(search, '')
	await fireEvent.press(screen.getByLabelText('Lobo gris, Rara · Mamíferos'))
	expect(routerSpies.push).toHaveBeenCalledWith('/deck/1')
})
