import { expect, jest, test } from '@jest/globals'
import { fireEvent, screen, waitFor } from '@testing-library/react-native'
import { File, Paths } from 'expo-file-system'
import * as SecureStore from 'expo-secure-store'

import SelfieScreen from '@/app/deck/selfie/[id]'

import { makeOwnedCard } from '../../../test-utils/factories'
import { serveCards } from '../../../test-utils/pack'
import { renderWithProviders } from '../../../test-utils/render'
import { routerSpies, searchParams } from '../../../test-utils/router'
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

// Viro's handoff and AR release wait up to 1.5 s.
const VIRO_WAIT = { timeout: 4000 }

// One scenario: services/cards keeps the list in the module.
test('the selfie takes a photo to review, retakes it and goes back to the card', async () => {
	await SecureStore.setItemAsync('zooapp_token', 'token-de-prueba')
	server.use(
		serveCards([
			makeOwnedCard({
				id: 5,
				name: 'Mapache',
				category_name: 'Selva',
				model_url: 'https://example.test/mapache.glb',
			}),
		]),
	)
	searchParams.mockReturnValue({ id: '5', mode: 'model', from: 'card' })
	// Where Viro leaves the screenshot (see arScreenshot).
	Paths.cache.create()
	new File(Paths.cache, 'viro.jpg').write('jpeg')

	await renderWithProviders(<SelfieScreen />)

	expect(await screen.findByText('Selfie con Mapache')).toBeTruthy()
	// The AR view opens and the animal loads: the controls appear.
	await fireEvent.press(await screen.findByLabelText('Tomar foto', VIRO_WAIT))

	// The shot shows in the zoo frame (A-31).
	expect(await screen.findByText('¿Te gusta tu foto?')).toBeTruthy()
	expect(screen.getByText('Zoológico Sahuatoba · Selva')).toBeTruthy()

	await fireEvent.press(screen.getByText('Repetir'))
	await waitFor(() =>
		expect(screen.queryByText('¿Te gusta tu foto?')).toBeNull(),
	)

	// Back closes the AR session first, then returns to the card.
	await fireEvent.press(screen.getByLabelText('Regresar'))
	await waitFor(
		() =>
			expect(routerSpies.replace).toHaveBeenCalledWith('/deck/5?mode=model'),
		VIRO_WAIT,
	)
}, 15000)
