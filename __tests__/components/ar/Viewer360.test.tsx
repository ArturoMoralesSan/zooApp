import { expect, jest, test } from '@jest/globals'
import { act, render } from '@testing-library/react-native'
import {
	PanResponder,
	type PanResponderCallbacks,
	type PanResponderGestureState,
} from 'react-native'

import { Viewer360 } from '@/components/ar/Viewer360'
import { YAW_PER_PX } from '@/components/deck/CardViewerFrame'
import { GRAPHICS_PRESETS } from '@/utils/settings'

// The view relocks the screen's orientation through the navigation.
jest.mock('expo-router', () => ({
	useNavigation: () => ({ setOptions: () => {} }),
}))

type SceneProps = {
	yaw: number
	scenario: boolean
	liveShadow: boolean
	onTrackingStuck: () => void
}

// The yaw each render hands the scene.
const mockSceneYaws: number[] = []
// The navigator's mounts, whether one is mounted, and its latest props.
const mockNavigator = {
	mounts: 0,
	mounted: false,
	props: null as SceneProps | null,
	shadowsEnabled: undefined as boolean | undefined,
}

jest.mock('@reactvision/react-viro', () => {
	const { useEffect } = jest.requireActual<typeof import('react')>('react')

	return {
		// Viewer360Scene registers its materials on import.
		ViroMaterials: { createMaterials: () => {} },
		ViroVRSceneNavigator: ({
			viroAppProps,
			shadowsEnabled,
		}: {
			viroAppProps: SceneProps
			shadowsEnabled?: boolean
		}) => {
			mockSceneYaws.push(viroAppProps.yaw)
			mockNavigator.props = viroAppProps
			mockNavigator.shadowsEnabled = shadowsEnabled

			useEffect(() => {
				mockNavigator.mounts += 1
				mockNavigator.mounted = true

				return () => {
					mockNavigator.mounted = false
				}
			}, [])

			return null
		},
	}
})

test('a drag keeps its turn when the release resets the gesture', async () => {
	const create = jest.spyOn(PanResponder, 'create')
	await render(
		<Viewer360
			modelUrl='https://example.test/mapache.glb'
			graphics={GRAPHICS_PRESETS.high}
			onModelLoaded={jest.fn()}
			onModelError={jest.fn()}
		/>,
	)
	const handlers = create.mock.calls[0][0] as PanResponderCallbacks
	const event = {} as Parameters<
		NonNullable<PanResponderCallbacks['onPanResponderMove']>
	>[0]
	// PanResponder passes the same object to every callback and zeroes it
	// right after the release, often before React runs the queued updates.
	const gesture = { dx: 0, dy: 0 } as PanResponderGestureState

	await act(async () => {
		handlers.onPanResponderGrant?.(event, gesture)
		gesture.dx = 120
		handlers.onPanResponderMove?.(event, gesture)
		handlers.onPanResponderRelease?.(event, gesture)
		gesture.dx = 0
	})

	expect(mockSceneYaws.at(-1)).toBe(120 * YAW_PER_PX)
})

test('stuck head tracking creates the view again, at most twice', async () => {
	jest.useFakeTimers()
	mockNavigator.mounts = 0
	await render(
		<Viewer360
			modelUrl='https://example.test/mapache.glb'
			graphics={GRAPHICS_PRESETS.high}
			onModelLoaded={jest.fn()}
			onModelError={jest.fn()}
		/>,
	)
	expect(mockNavigator.mounts).toBe(1)

	for (const mounts of [2, 3]) {
		await act(async () => mockNavigator.props?.onTrackingStuck())
		// Released first: a new Viro view can't start while one closes.
		expect(mockNavigator.mounted).toBe(false)

		await act(async () => jest.advanceTimersByTime(1000))
		expect(mockNavigator.mounted).toBe(true)
		expect(mockNavigator.mounts).toBe(mounts)
	}

	// A third report leaves the view as it is: no restart loop.
	await act(async () => mockNavigator.props?.onTrackingStuck())
	await act(async () => jest.advanceTimersByTime(1000))
	expect(mockNavigator.mounted).toBe(true)
	expect(mockNavigator.mounts).toBe(3)

	jest.useRealTimers()
})

test('the graphics level reaches the scene and the navigator', async () => {
	const { rerender } = await render(
		<Viewer360
			modelUrl='https://example.test/mapache.glb'
			graphics={GRAPHICS_PRESETS.high}
			onModelLoaded={jest.fn()}
			onModelError={jest.fn()}
		/>,
	)

	expect(mockNavigator.props).toMatchObject({
		scenario: true,
		liveShadow: true,
	})
	expect(mockNavigator.shadowsEnabled).toBe(true)

	// Ahorro: no savanna, no live shadow, no shadow pass.
	await rerender(
		<Viewer360
			modelUrl='https://example.test/mapache.glb'
			graphics={GRAPHICS_PRESETS.saver}
			onModelLoaded={jest.fn()}
			onModelError={jest.fn()}
		/>,
	)

	expect(mockNavigator.props).toMatchObject({
		scenario: false,
		liveShadow: false,
	})
	expect(mockNavigator.shadowsEnabled).toBe(false)
})
