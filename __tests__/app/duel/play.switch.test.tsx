import { expect, jest, test } from '@jest/globals'
import {
	act,
	fireEvent,
	renderHook,
	screen,
	waitFor,
} from '@testing-library/react-native'
import * as SecureStore from 'expo-secure-store'
import type { ReactNode } from 'react'

import DuelPlayScreen from '@/app/duel/play'
import type { ModelPlacementSceneProps } from '@/components/ar/ModelPlacementScene'
import { DuelProvider, useDuel } from '@/contexts/DuelContext'

import { arSceneProps, viroMock } from '../../../test-utils/ar'
import { makeDuelStart } from '../../../test-utils/factories'

jest.mock(
	'expo-router',
	() =>
		jest.requireActual<typeof import('../../../test-utils/router')>(
			'../../../test-utils/router',
		).expoRouterMock,
)
jest.mock(
	'expo-location',
	() =>
		jest.requireActual<typeof import('../../../test-utils/location')>(
			'../../../test-utils/location',
		).expoLocationMock,
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
		Viewer360: ({ onModelLoaded }: { onModelLoaded: () => void }) => {
			useEffect(() => onModelLoaded(), [onModelLoaded])

			return null
		},
	}
})

const PLACE = 'Toca el plano donde quieras colocar a Lobo gris.'
// Closing a view takes its release time (useViroExit) before the next one.
const SWITCH = { timeout: 4000 }

const scene = () =>
	arSceneProps.mock.lastCall?.[0] as ModelPlacementSceneProps | undefined

// Like the app, the screen opens once the scan has started the duel.
function Play() {
	return useDuel().duel ? <DuelPlayScreen /> : null
}

const base = makeDuelStart()
const duel = makeDuelStart({
	card: { ...base.card, model_url: 'https://example.test/lobo.glb' },
})

// One scenario: useArAvailability keeps ARCore's answer in the module.
test('before the quiz the switch moves the duel to 360° and back to AR', async () => {
	viroMock.isARSupportedOnDevice.mockResolvedValue({ isARSupported: true })

	const { result } = await renderHook(() => useDuel(), {
		wrapper: ({ children }: { children: ReactNode }) => (
			<DuelProvider>
				{children}
				<Play />
			</DuelProvider>
		),
	})

	await act(async () => result.current.begin('QR-1', duel))

	// AR by default: place the animal, then A-20.
	await waitFor(() => expect(scene()?.placement).toBe('plane'))
	await act(async () => scene()?.onPlaced())
	await act(async () => scene()?.onModelLoaded())
	expect(screen.getByText('Empezar duelo')).toBeTruthy()

	// 360°: nothing to place, A-20 stays, and the choice is saved.
	const calls = arSceneProps.mock.calls.length

	await fireEvent.press(screen.getByRole('radio', { name: '360°' }))
	await waitFor(
		() =>
			expect(
				screen.getByRole('radio', { name: '360°' }).props.accessibilityState,
			).toMatchObject({ checked: true, disabled: false }),
		SWITCH,
	)
	expect(screen.getByText('Empezar duelo')).toBeTruthy()
	expect(await SecureStore.getItemAsync('zooapp_pref_animal_view')).toBe('360')

	// AR again: a new session, and the animal is placed again first.
	await fireEvent.press(screen.getByRole('radio', { name: 'AR' }))
	expect(await screen.findByText(PLACE, {}, SWITCH)).toBeTruthy()
	expect(arSceneProps.mock.calls.length).toBeGreaterThan(calls)
	expect(screen.queryByText('Empezar duelo')).toBeNull()

	await act(async () => scene()?.onPlaced())
	await act(async () => scene()?.onModelLoaded())
	expect(screen.getByText('Empezar duelo')).toBeTruthy()

	// Once the quiz starts, the duel keeps its view.
	await fireEvent.press(screen.getByText('Empezar duelo'))
	expect(screen.queryByRole('radio', { name: 'AR' })).toBeNull()
	expect(screen.queryByRole('radio', { name: '360°' })).toBeNull()
})
