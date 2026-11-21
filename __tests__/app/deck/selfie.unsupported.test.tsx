import { expect, jest, test } from '@jest/globals'
import { screen } from '@testing-library/react-native'
import * as SecureStore from 'expo-secure-store'

import SelfieScreen from '@/app/deck/selfie/[id]'

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
jest.mock('@reactvision/react-viro', () => {
	const ar = jest.requireActual<typeof import('../../../test-utils/ar')>(
		'../../../test-utils/ar',
	)

	return { ...ar.viroMock, ViroARSceneNavigator: ar.ViroARSceneNavigatorStub }
})
jest.mock(
	'expo-camera',
	() =>
		jest.requireActual<typeof import('../../../test-utils/ar')>(
			'../../../test-utils/ar',
		).expoCameraMock,
)
// Native modules the photo service loads.
jest.mock('react-native-view-shot', () => ({ captureRef: jest.fn() }))
jest.mock('expo-media-library', () => ({}))
jest.mock('expo-sharing', () => ({}))

// One scenario: services/cards keeps the list in the module.
test('a phone without ARCore is told the selfie needs it, without a camera view', async () => {
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
	searchParams.mockReturnValue({ id: '5', mode: 'model', from: 'card' })

	await renderWithProviders(<SelfieScreen />)

	expect(
		await screen.findByText(
			'Tu teléfono no es compatible con la selfie en AR.',
		),
	).toBeTruthy()
	expect(screen.queryByLabelText('Tomar foto')).toBeNull()
})
