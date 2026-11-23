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
test('AR waits for the saved placement and starts in plane mode', async () => {
	await SecureStore.setItemAsync('zooapp_token', 'token-de-prueba')
	await SecureStore.setItemAsync('zooapp_pref_ar_placement', 'plane')
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

	// The preference stays unread until released.
	let release = () => {}
	const read = jest.mocked(SecureStore.getItemAsync)
	const actual = read.getMockImplementation()

	read.mockImplementation(async (key: string) => {
		if (key === 'zooapp_pref_ar_placement') {
			await new Promise<void>((resolve) => {
				release = resolve
			})
		}

		return actual ? actual(key) : null
	})

	await renderWithProviders(<CardArScreen />)

	expect(await screen.findByText('Cargando a Mapache…')).toBeTruthy()
	// Everything else is ready: only the placement holds the camera back.
	await act(async () => {
		await new Promise((resolve) => setTimeout(resolve, 300))
	})
	expect(arSceneProps).not.toHaveBeenCalled()

	await act(async () => release())

	await waitFor(() => expect(scene()?.placement).toBe('plane'))
	// Today's flow: tap a plane, then the model loads.
	expect(
		screen.getByText(
			'Toca la parte del plano donde quieras colocar a Mapache.',
		),
	).toBeTruthy()
	await act(async () => scene()?.onPlaced())
	expect(screen.getByText('Cargando a Mapache…')).toBeTruthy()

	read.mockImplementation(actual ?? (async () => null))
})
