import { expect, jest, test } from '@jest/globals'
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native'
import * as SecureStore from 'expo-secure-store'

import CardArScreen from '@/app/deck/ar/[id]'
import type { ModelPlacementSceneProps } from '@/components/ar/ModelPlacementScene'

import { arSceneProps, viroMock } from '../../../test-utils/ar'
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

const scene = () =>
	arSceneProps.mock.lastCall?.[0] as ModelPlacementSceneProps | undefined

// One scenario: services/cards and useArAvailability keep state in the module.
test('chosen automatic, AR places it: load, search, land', async () => {
	await SecureStore.setItemAsync('zooapp_token', 'token-de-prueba')
	await SecureStore.setItemAsync('zooapp_pref_ar_placement', 'auto')
	viroMock.isARSupportedOnDevice.mockResolvedValue({ isARSupported: true })
	server.use(
		serveCards([
			makeOwnedCard({
				id: 5,
				name: 'Mapache',
				model_url: 'https://example.test/mapache.glb',
			}),
		]),
	)
	searchParams.mockReturnValue({ id: '5', mode: 'model' })

	await renderWithProviders(<CardArScreen />)

	// The model loads before anything is placed.
	await waitFor(() => expect(scene()?.placement).toBe('auto'))
	expect(screen.getByText('Cargando a Mapache…')).toBeTruthy()

	await act(async () => scene()?.onModelLoaded())
	expect(
		screen.getByText('Mueve el teléfono despacio para encontrar el suelo.'),
	).toBeTruthy()

	await act(async () => scene()?.onPlaneFound?.())
	expect(
		screen.getByText('Apunta al suelo donde quieras a Mapache.'),
	).toBeTruthy()
	expect(screen.getByText('Superficie detectada')).toBeTruthy()

	await act(async () => scene()?.onPlaced())
	expect(
		screen.getByText('Toca reiniciar para colocar a Mapache en otro lugar.'),
	).toBeTruthy()

	// "Colocar de nuevo": the loaded animal floats again, no reload.
	await fireEvent.press(screen.getByLabelText('Colocar de nuevo'))
	expect(scene()?.resetKey).toBe(1)
	expect(
		screen.getByText('Apunta al suelo donde quieras a Mapache.'),
	).toBeTruthy()
})
