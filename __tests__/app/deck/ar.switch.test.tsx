import { expect, jest, test } from '@jest/globals'
import { fireEvent, screen, waitFor } from '@testing-library/react-native'
import * as SecureStore from 'expo-secure-store'

import CardArScreen from '@/app/deck/ar/[id]'

import { arSceneProps, camera, viroMock } from '../../../test-utils/ar'
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

const VIEW_KEY = 'zooapp_pref_animal_view'
// Closing a view takes its release time (useViroExit) before the next one.
const SWITCH = { timeout: 4000 }

// One scenario: services/cards and useArAvailability keep state in the module.
test('opens in the saved 360° view and the switch goes to AR and back', async () => {
	await SecureStore.setItemAsync('zooapp_token', 'token-de-prueba')
	await SecureStore.setItemAsync(VIEW_KEY, '360')
	viroMock.isARSupportedOnDevice.mockResolvedValue({ isARSupported: true })
	camera.permission = { granted: false, canAskAgain: true }
	camera.request.mockImplementation(async () => {
		camera.permission = { granted: true, canAskAgain: true }

		return camera.permission
	})
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

	// The 360° view, without asking for the camera.
	expect(await screen.findByLabelText('Centrar vista')).toBeTruthy()
	expect(camera.request).not.toHaveBeenCalled()
	expect(arSceneProps).not.toHaveBeenCalled()
	expect(
		screen.getByRole('radio', { name: '360°' }).props.accessibilityState,
	).toMatchObject({ checked: true })

	// AR: the camera is asked for now, and the choice is saved.
	await fireEvent.press(screen.getByRole('radio', { name: 'AR' }))
	expect(await screen.findByText('Abriendo la cámara…')).toBeTruthy()
	await waitFor(() => expect(arSceneProps).toHaveBeenCalled(), SWITCH)
	expect(camera.request).toHaveBeenCalledTimes(1)
	expect(screen.queryByLabelText('Centrar vista')).toBeNull()
	expect(await SecureStore.getItemAsync(VIEW_KEY)).toBe('ar')

	// And back to the 360° view.
	await fireEvent.press(screen.getByRole('radio', { name: '360°' }))
	expect(await screen.findByLabelText('Centrar vista', {}, SWITCH)).toBeTruthy()
	expect(await SecureStore.getItemAsync(VIEW_KEY)).toBe('360')
})
