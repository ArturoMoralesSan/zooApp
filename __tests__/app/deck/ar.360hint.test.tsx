import { expect, jest, test } from '@jest/globals'
import { fireEvent, screen } from '@testing-library/react-native'
import * as SecureStore from 'expo-secure-store'

import CardArScreen from '@/app/deck/ar/[id]'

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
// The 360° view without its native view: the animal loads right away.
jest.mock('@/components/ar/Viewer360', () => {
	const { useEffect } = jest.requireActual<typeof import('react')>('react')

	return {
		// Loaded, and its loading cover already faded out.
		Viewer360: ({
			onModelLoaded,
			onCoverChange,
		}: {
			onModelLoaded: () => void
			onCoverChange?: (covered: boolean) => void
		}) => {
			useEffect(() => {
				onModelLoaded()
				onCoverChange?.(false)
			}, [onModelLoaded, onCoverChange])

			return null
		},
	}
})
// Native modules the photo service loads.
jest.mock('react-native-view-shot', () => ({ captureRef: jest.fn() }))
jest.mock('expo-media-library', () => ({}))
jest.mock('expo-sharing', () => ({}))

const HINT =
	/Vista 360°: mueve el teléfono para mirar alrededor y arrastra para girar a Mapache\./

// One scenario: services/cards and useArAvailability keep state in the module.
test('the 360° controls are explained the first time only, and a tap hides them', async () => {
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
	searchParams.mockReturnValue({ id: '5', mode: 'model' })

	const first = await renderWithProviders(<CardArScreen />)

	expect(await screen.findByText(HINT)).toBeTruthy()
	expect(await SecureStore.getItemAsync('zooapp_hint_deck_360_controls')).toBe(
		'1',
	)

	// A tap hides it right away.
	await fireEvent.press(screen.getByRole('button', { name: HINT }))
	expect(screen.queryByText(HINT)).toBeNull()
	await first.unmount()

	// Seen: the next time the view opens without it.
	await renderWithProviders(<CardArScreen />)

	expect(await screen.findByLabelText('Centrar vista')).toBeTruthy()
	expect(screen.queryByText(HINT)).toBeNull()
})
