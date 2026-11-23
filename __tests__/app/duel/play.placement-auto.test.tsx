import { expect, jest, test } from '@jest/globals'
import { act, renderHook, screen, waitFor } from '@testing-library/react-native'
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
test('auto placement: A-20 waits for the animal to land, and the 360° offer still comes', async () => {
	viroMock.isARSupportedOnDevice.mockResolvedValue({ isARSupported: true })
	await SecureStore.setItemAsync('zooapp_pref_ar_placement', 'auto')
	// For the 10 s before the 360° offer.
	jest.useFakeTimers()

	const { result } = await renderHook(() => useDuel(), {
		wrapper: ({ children }: { children: ReactNode }) => (
			<DuelProvider>
				{children}
				<Play />
			</DuelProvider>
		),
	})

	await act(async () => result.current.begin('QR-1', duel))

	await waitFor(() => expect(scene()?.placement).toBe('auto'))
	expect(screen.getByText('Cargando a Lobo gris…')).toBeTruthy()

	// Loaded but floating: no duel yet.
	await act(async () => scene()?.onModelLoaded())
	expect(
		screen.getByText('Mueve el teléfono despacio para encontrar el suelo.'),
	).toBeTruthy()
	expect(screen.queryByText('Empezar duelo')).toBeNull()

	// No floor for 10 s: "¿No encuentras una superficie?".
	await act(async () => {
		jest.advanceTimersByTime(10_000)
	})
	expect(screen.getByText('¿No encuentras una superficie?')).toBeTruthy()

	await act(async () => scene()?.onPlaneFound?.())
	expect(
		screen.getByText('Apunta al suelo donde quieras a Lobo gris.'),
	).toBeTruthy()

	await act(async () => scene()?.onPlaced())
	expect(screen.getByText('Empezar duelo')).toBeTruthy()
	jest.useRealTimers()
})
