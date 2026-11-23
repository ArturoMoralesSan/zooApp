import { ViroVRSceneNavigator } from '@reactvision/react-viro'
import { useNavigation } from 'expo-router'
import {
	type Ref,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react'
import {
	ActivityIndicator,
	Animated,
	Easing,
	PanResponder,
	View,
} from 'react-native'

import {
	Viewer360Scene,
	type Viewer360SceneProps,
} from '@/components/ar/Viewer360Scene'
import { YAW_PER_PX } from '@/components/deck/CardViewerFrame'
import colors from '@/theme/colors'
import type { GraphicsEffects } from '@/types/settings'

export type Viewer360Handle = {
	// Puts the animal back in front of wherever the phone points now.
	recenter: () => void
}

type Viewer360Props = {
	modelUrl: string | null
	// Read once per session: the savanna and the live shadow.
	graphics: GraphicsEffects
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
// When the scene reports head tracking that hasn't started, the view is
// created again: unmounted, released, then mounted after the usual handoff
// (see useViroHandoff: a Viro view created while another is still being
// released crashes natively). A couple of tries, never a loop.
const RESTART_DELAY_MS = 1000
const MAX_RESTARTS = 2
// The loading cover: Viro reports a model loaded a moment before it draws
// it, so the fade waits a little, and never waits for good (a phone kept
// lying flat never places the animal).
const COVER_SETTLE_MS = 300
const COVER_FADE_MS = 450
const COVER_MAX_MS = 20000

// Vista 360° (the fallback when AR isn't possible): a single view, not
// split for a headset, where the gyroscope drives the camera. Dragging
// turns the animal.
export function Viewer360({
	modelUrl,
	graphics,
	onModelLoaded,
	onModelError,
	ref,
}: Viewer360Props) {
	const navigation = useNavigation()
	const [drag, setDrag] = useState<Drag>({ yaw: 0, from: null })
	const [centerKey, setCenterKey] = useState(0)
	// Each restart mounts a new navigator (its key); none while restarting.
	const [session, setSession] = useState(0)
	const [restarting, setRestarting] = useState(false)
	const restarts = useRef(0)
	// Hides the half-loaded scene (plain disc, savanna popping in) until it's
	// ready; shown again for each restart.
	const [ready, setReady] = useState(false)
	const [covered, setCovered] = useState(true)
	const [coverOpacity] = useState(() => new Animated.Value(1))
	const markReady = useCallback(() => setReady(true), [])

	const restart = useCallback(() => {
		if (restarts.current >= MAX_RESTARTS) return

		restarts.current += 1
		setRestarting(true)
		setReady(false)
		setCovered(true)
		coverOpacity.setValue(1)
	}, [coverOpacity])

	useEffect(() => {
		if (!covered) return

		if (!ready) {
			const timeout = setTimeout(markReady, COVER_MAX_MS)

			return () => clearTimeout(timeout)
		}

		const fade = Animated.timing(coverOpacity, {
			toValue: 0,
			delay: COVER_SETTLE_MS,
			duration: COVER_FADE_MS,
			easing: Easing.out(Easing.quad),
			useNativeDriver: true,
		})

		fade.start(({ finished }) => {
			if (finished) setCovered(false)
		})

		return () => fade.stop()
	}, [ready, covered, coverOpacity, markReady])

	useEffect(() => {
		if (!restarting) return

		const timeout = setTimeout(() => {
			setSession((current) => current + 1)
			setRestarting(false)
		}, RESTART_DELAY_MS)

		return () => clearTimeout(timeout)
	}, [restarting])

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
			scenario: graphics.view360Scenario,
			liveShadow: graphics.view360LiveShadow,
			onModelLoaded: () => {
				lockPortrait()
				onModelLoaded()
			},
			onModelError: () => {
				markReady()
				onModelError()
			},
			onReady: markReady,
			onTrackingStuck: restart,
		}),
		[
			modelUrl,
			drag.yaw,
			centerKey,
			graphics,
			onModelLoaded,
			onModelError,
			lockPortrait,
			markReady,
			restart,
		],
	)

	return (
		<View style={{ flex: 1 }}>
			{!restarting && (
				<ViroVRSceneNavigator
					key={session}
					vrModeEnabled={false}
					initialScene={{ scene: Viewer360Scene }}
					viroAppProps={sceneProps}
					pbrEnabled
					hdrEnabled
					multisamplingEnabled
					bloomEnabled={false}
					// For the animal's live shadow. It costs every start about a
					// second looking at the ground before head tracking begins.
					shadowsEnabled={graphics.view360LiveShadow}
					debug={false}
					style={{ flex: 1 }}
				/>
			)}

			{covered && (
				<Animated.View
					pointerEvents='none'
					accessible
					accessibilityRole='progressbar'
					accessibilityLabel='Cargando la vista 360°'
					className='absolute inset-0 items-center justify-center bg-niebla'
					style={{ opacity: coverOpacity }}
				>
					<ActivityIndicator size='large' color={colors.esmeralda} />
				</Animated.View>
			)}

			{/* Viro's view has no touch handling outside AR: drags land here. */}
			<View className='absolute inset-0' {...panResponder.panHandlers} />
		</View>
	)
}
