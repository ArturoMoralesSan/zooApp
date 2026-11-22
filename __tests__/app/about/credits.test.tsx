import { expect, jest, test } from '@jest/globals'
import { fireEvent, screen } from '@testing-library/react-native'
import * as SecureStore from 'expo-secure-store'

import CreditsScreen from '@/app/about/credits'

import { makeOwnedCard } from '../../../test-utils/factories'
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

test('names the cards won, hides the rest, and filters by asset', async () => {
	await SecureStore.setItemAsync('zooapp_token', 'token-de-prueba')
	// Won the hippo (card 2), not the jaguar (card 1).
	server.use(serveCards([makeOwnedCard({ id: 2, name: 'Hipopótamo' })]))

	await renderWithProviders(<CreditsScreen />)

	expect(await screen.findByText('Hipopótamo')).toBeTruthy()
	expect(screen.getByText('Tarjeta por descubrir')).toBeTruthy()
	expect(screen.queryByText('Jaguar')).toBeNull()
	// The hidden card's credits still show.
	expect(
		screen.getByText('Imagen generada con IA (Adobe Firefly)'),
	).toBeTruthy()

	await fireEvent.press(screen.getByText('Modelos 3D'))

	expect(
		screen.queryByText('Imagen generada con IA (Adobe Firefly)'),
	).toBeNull()
	expect(
		screen.getByText(
			'“Hippo low poly” de ana3d, vía Sketchfab, CC BY 4.0, con cambios: Escalado para RA',
		),
	).toBeTruthy()
})
