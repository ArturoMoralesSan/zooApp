import { ViroVRSceneNavigator } from '@reactvision/react-viro'
import { useNavigation } from 'expo-router'
import {
	type Ref,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useState,
} from 'react'
import { PanResponder, View } from 'react-native'

import {
	Viewer360Scene,
	type Viewer360SceneProps,
} from '@/components/ar/Viewer360Scene'
import { YAW_PER_PX } from '@/components/deck/CardViewerFrame'

export type Viewer360Handle = {
	// Puts the animal back in front of wherever the phone points now.
	recenter: () => void
}

type Viewer360Props = {
	modelUrl: string | null
	onModelLoaded: () => void
	onModelError: () => void
	ref?: Ref<Viewer360Handle>
}

type Drag = { yaw: number; from: number | null }

// GVR's single-view mode sets the activity to follow the sensor (the app
// would turn landscape with auto-rotate on). Once it has started, the
// screen's orientation is set again: it has to change for the native side
// to apply it, hence 'portrait' first.
const RELOCK_DELAY_MS = 500

// Vista 360° (the fallback when AR isn't possible): a single view, not
// split for a headset, where the gyroscope drives the camera. Dragging
// turns the animal.
export function Viewer360({
	modelUrl,
	onModelLoaded,
	onModelError,
	ref,
}: Viewer360Props) {
	const navigation = useNavigation()
	const [drag, setDrag] = useState<Drag>({ yaw: 0, from: null })
	const [centerKey, setCenterKey] = useState(0)

	const lockPortrait = useCallback(() => {
		navigation.setOptions({ orientation: 'portrait' })
		requestAnimationFrame(() =>
			navigation.setOptions({ orientation: 'portrait_up' }),
		)
	}, [navigation])

	useEffect(() => {
		const timeout = setTimeout(lockPortrait, RELOCK_DELAY_MS)

		return () => clearTimeout(timeout)
	}, [lockPortrait])

	useImperativeHandle(ref, () => ({
		recenter: () => setCenterKey((value) => value + 1),
	}))

	const panResponder = useMemo(
		() =>
			PanResponder.create({
				onStartShouldSetPanResponder: () => true,
				onMoveShouldSetPanResponder: () => true,
				// Keep the gesture: losing it midway would drop the rotation.
				onPanResponderTerminationRequest: () => false,
				onPanResponderGrant: () =>
					setDrag((previous) => ({ ...previous, from: previous.yaw })),
				onPanResponderMove: (_event, gesture) => {
					// Copied now: PanResponder reuses and resets this object, and
					// the updater may run after the release zeroes it.
					const { dx } = gesture

					setDrag((previous) => ({
						...previous,
						yaw: (previous.from ?? previous.yaw) + dx * YAW_PER_PX,
					}))
				},
				onPanResponderRelease: () =>
					setDrag((previous) => ({ ...previous, from: null })),
				onPanResponderTerminate: () =>
					setDrag((previous) => ({ ...previous, from: null })),
			}),
		[],
	)

	const sceneProps = useMemo<Viewer360SceneProps>(
		() => ({
			modelUrl,
			yaw: drag.yaw,
			centerKey,
			onModelLoaded: () => {
				lockPortrait()
				onModelLoaded()
			},
			onModelError,
		}),
		[modelUrl, drag.yaw, centerKey, onModelLoaded, onModelError, lockPortrait],
	)

	return (
		<View style={{ flex: 1 }}>
			<ViroVRSceneNavigator
				vrModeEnabled={false}
				initialScene={{ scene: Viewer360Scene }}
				viroAppProps={sceneProps}
				pbrEnabled
				hdrEnabled
				multisamplingEnabled
				bloomEnabled={false}
				shadowsEnabled={false}
				debug={false}
				style={{ flex: 1 }}
			/>

			{/* Viro's view has no touch handling outside AR: drags land here. */}
			<View className='absolute inset-0' {...panResponder.panHandlers} />
		</View>
	)
}
