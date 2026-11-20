import { expect, jest, test } from '@jest/globals'
import { screen } from '@testing-library/react-native'
import * as SecureStore from 'expo-secure-store'

import DeckScreen from '@/app/deck/index'

import { makeUnownedCard } from '../../../test-utils/factories'
import { serveCards } from '../../../test-utils/pack'
import { renderWithProviders } from '../../../test-utils/render'
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

test('without owned cards, the collection says how to win the first one', async () => {
	await SecureStore.setItemAsync('zooapp_token', 'token-de-prueba')
	server.use(serveCards([makeUnownedCard()]))

	await renderWithProviders(<DeckScreen />)

	expect(await screen.findByText('Aún no tienes tarjetas')).toBeTruthy()
	expect(screen.getByRole('tab', { name: 'Obtenidos · 0' })).toBeTruthy()
})
