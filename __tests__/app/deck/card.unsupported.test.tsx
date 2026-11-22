import { expect, jest, test } from '@jest/globals'
import { screen } from '@testing-library/react-native'
import * as SecureStore from 'expo-secure-store'

import CardScreen from '@/app/deck/[id]'

import { arcoreState, viroMock } from '../../../test-utils/ar'
import { makeOwnedCard } from '../../../test-utils/factories'
import { serveCards } from '../../../test-utils/pack'
import { renderWithProviders } from '../../../test-utils/render'
import { searchParams } from '../../../test-utils/router'
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
jest.mock(
	'@reactvision/react-viro',
	() =>
		jest.requireActual<typeof import('../../../test-utils/ar')>(
			'../../../test-utils/ar',
		).viroMock,
)
jest.mock(
	'expo-camera',
	() =>
		jest.requireActual<typeof import('../../../test-utils/ar')>(
			'../../../test-utils/ar',
		).expoCameraMock,
)
// The card's 3D view and carousel have nothing to do with the button (and
// the carousel's Reanimated doesn't load in Jest).
jest.mock('@/components/deck/CardViewerFrame', () => ({
	CardViewerFrame: () => null,
}))
jest.mock('@/components/deck/CardCarousel', () => ({
	CardCarousel: () => null,
}))

// One scenario: useArAvailability keeps ARCore's answer in the module.
test('without ARCore the card offers the 360° view, not AR', async () => {
	await SecureStore.setItemAsync('zooapp_token', 'token-de-prueba')
	viroMock.isARSupportedOnDevice.mockRejectedValue(arcoreState('UNSUPPORTED'))
	server.use(
		serveCards([
			makeOwnedCard({
				id: 5,
				name: 'Mapache',
				model_url: 'https://example.test/mapache.glb',
			}),
		]),
	)
	searchParams.mockReturnValue({ id: '5', mode: 'card' })

	await renderWithProviders(<CardScreen />)

	expect(await screen.findByText('Ver en 360°')).toBeTruthy()
	expect(screen.queryByText('Ver en AR')).toBeNull()
})
