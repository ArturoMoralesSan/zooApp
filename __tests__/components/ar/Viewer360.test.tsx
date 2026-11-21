import { expect, jest, test } from '@jest/globals'
import { act, render } from '@testing-library/react-native'
import {
	PanResponder,
	type PanResponderCallbacks,
	type PanResponderGestureState,
} from 'react-native'

import { Viewer360 } from '@/components/ar/Viewer360'
import { YAW_PER_PX } from '@/components/deck/CardViewerFrame'

// The view relocks the screen's orientation through the navigation.
jest.mock('expo-router', () => ({
	useNavigation: () => ({ setOptions: () => {} }),
}))

type SceneProps = { yaw: number }

// The yaw each render hands the scene.
const mockSceneYaws: number[] = []

jest.mock('@reactvision/react-viro', () => ({
	// Viewer360Scene registers its materials on import.
	ViroMaterials: { createMaterials: () => {} },
	ViroVRSceneNavigator: ({ viroAppProps }: { viroAppProps: SceneProps }) => {
		mockSceneYaws.push(viroAppProps.yaw)

		return null
	},
}))

test('a drag keeps its turn when the release resets the gesture', async () => {
	const create = jest.spyOn(PanResponder, 'create')
	await render(
		<Viewer360
			modelUrl='https://example.test/mapache.glb'
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
