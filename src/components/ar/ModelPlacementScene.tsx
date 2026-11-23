import {
	Viro3DObject,
	ViroAmbientLight,
	ViroARPlaneSelector,
	ViroARScene,
	type ViroCameraARHitTest,
	ViroMaterials,
	ViroNode,
	ViroPolygon,
} from '@reactvision/react-viro'
import { useEffect, useMemo, useRef, useState } from 'react'

import colors from '@/theme/colors'
import type { ArPlacement } from '@/types/settings'
import {
	type BoundingBox,
	createSteadyTimer,
	fitDistance,
	distance,
	bridges,
	floatPosition,
	floorHeight,
	floorHitAt,
	floorPoint,
	movedEnough,
	nextFloorY,
	smooth,
	STEADY_MS,
	steadyTolerance,
	yawToward,
} from '@/utils/arPlacement'

export type ModelPlacementSceneProps = {
	// GLB already at real scale (1 unit = 1 m, origin at the bottom center).
	modelUrl: string | null
	// 'plane' (default): the user taps a detected plane; 'auto'
	// (experimental): the animal floats ahead and lands on the floor at the
	// screen centre.
	placement: ArPlacement
	// Changing it clears the placement so the user can place it again.
	resetKey?: number
	// The view is about to close (useViroExit's `closing`): stop per-frame
	// events, or Viro's GL thread can deadlock with the view's removal.
	closing?: boolean
	// First plane detected ("Superficie detectada").
	onPlaneFound?: () => void
	onPlaced: () => void
	onModelLoaded: () => void
	onModelError: () => void
}

type ModelPlacementSceneNavigatorProps = {
	sceneNavigator: { viroAppProps: ModelPlacementSceneProps }
}

type Vec3 = [number, number, number]

// Where the model stands: the tapped point in world space, turned to face
// the camera at that moment.
type Placement = { position: Vec3; yaw: number }

const noop = () => {}

// Every card model embeds an "idle" clip; it loops from the moment the
// animal is placed.
const IDLE_ANIMATION = { name: 'idle', run: true, loop: true }
const NO_ANIMATION = { name: 'idle', run: false, loop: true }

const NO_SCENE_PROPS: ModelPlacementSceneProps = {
	modelUrl: null,
	placement: 'plane',
	onPlaced: noop,
	onModelLoaded: noop,
	onModelError: noop,
}

// Places a card's animal at life size on a horizontal plane (duel A-20, AR
// view A-28/A-29), the way the user chose in Ajustes. Data and callbacks
// come in through viroAppProps; Viro types scenes as () => Element but
// always passes sceneNavigator.
export function ModelPlacementScene(props?: ModelPlacementSceneNavigatorProps) {
	const sceneProps = props?.sceneNavigator.viroAppProps ?? NO_SCENE_PROPS

	return sceneProps.placement === 'plane' ? (
		<PlanePlacement {...sceneProps} />
	) : (
		<AutoPlacement {...sceneProps} />
	)
}

// 'plane': the user taps where the animal goes. The plane selector only
// picks the spot: the model is pinned to that world point, not to the
// plane, whose center ARCore keeps moving as it refines it (the model
// drifted with it). `resetKey` re-shows the planes to place it again.
function PlanePlacement({
	modelUrl,
	resetKey = 0,
	onPlaneFound = noop,
	onPlaced,
	onModelLoaded,
	onModelError,
}: ModelPlacementSceneProps) {
	const sceneRef = useRef<ViroARScene>(null)
	const selectorRef = useRef<ViroARPlaneSelector>(null)
	// The plane the user picked. ARCore drops and re-creates anchors when the
	// app is paused (Gemini, a system dialog); forwarding that removal would
	// clear the selection and show the planes again.
	const selectedAnchorRef = useRef<string | null>(null)
	// Same object between renders, so Viro doesn't load the GLB again.
	const source = useMemo(() => ({ uri: modelUrl ?? '' }), [modelUrl])
	const [placement, setPlacement] = useState<Placement | null>(null)
	const [placedFor, setPlacedFor] = useState(resetKey)

	// A new reset key clears the selection: the planes show again and the
	// model is removed until the next tap.
	if (placedFor !== resetKey) {
		setPlacedFor(resetKey)
		setPlacement(null)
	}

	useEffect(() => {
		selectedAnchorRef.current = null
		selectorRef.current?.reset()
	}, [resetKey])

	const place = async (anchorId: string, position: Vec3) => {
		selectedAnchorRef.current = anchorId

		let yaw = 0

		try {
			const camera = await sceneRef.current?.getCameraOrientationAsync()

			if (camera) yaw = yawToward(position, camera.position)
		} catch {
			// Facing the default direction is fine.
		}

		setPlacement({ position, yaw })
		onPlaced()
	}

	return (
		<ViroARScene
			ref={sceneRef}
			anchorDetectionTypes={['PlanesHorizontal']}
			onAnchorFound={(anchor) => {
				if (anchor.type === 'plane') onPlaneFound()
				selectorRef.current?.handleAnchorFound(anchor)
			}}
			onAnchorUpdated={(a) => selectorRef.current?.handleAnchorUpdated(a)}
			onAnchorRemoved={(a) => {
				if (a && a.anchorId !== selectedAnchorRef.current) {
					selectorRef.current?.handleAnchorRemoved(a)
				}
			}}
		>
			{/* eslint-disable-next-line no-restricted-syntax -- AR light color, not a UI color */}
			<ViroAmbientLight color='#fff' intensity={250} />

			{modelUrl && (
				<ViroARPlaneSelector
					ref={selectorRef}
					minHeight={0}
					minWidth={0}
					alignment='HorizontalUpward'
					onPlaneSelected={(plane, tapPosition) => {
						void place(plane.anchorId, tapPosition ?? (plane.position as Vec3))
					}}
				/>
			)}

			{/* Mounted only once placed, so loading starts at the tap. */}
			{modelUrl && placement && (
				<ViroNode
					position={placement.position}
					rotation={[0, placement.yaw, 0]}
				>
					<Viro3DObject
						source={source}
						type='GLB'
						scale={[1, 1, 1]}
						animation={IDLE_ANIMATION}
						onLoadEnd={onModelLoaded}
						onError={onModelError}
					/>
				</ViroNode>
			)}
		</ViroARScene>
	)
}

ViroMaterials.createMaterials({
	placementRing: {
		diffuseColor: colors.lima,
		lightingModel: 'Constant',
		cullMode: 'None',
	},
})

const FLAT: Vec3 = [-90, 0, 0]
// Where the model waits, hidden, until it's loaded and measured.
const START_POSITION: Vec3 = [0, -1, -2.5]
const START_ROTATION: Vec3 = [0, 0, 0]
// How fast (ms to cover half the way) the animal glides onto the floor.
const FLOOR_HALF_LIFE = 50
// Below this the animal's turn toward the camera isn't rewritten.
const MIN_YAW_STEP = 1
// Used when the model can't be measured.
const FALLBACK_SIZE = { distance: 2.5, height: 1, radius: 0.6 }

// Unit ring, flat on the floor: a 64-sided circle with a hole. Its node is
// scaled to the animal's footprint.
const RING_SEGMENTS = 64
const RING_HOLE = 0.86
const circle = (radius: number): [number, number][] =>
	Array.from({ length: RING_SEGMENTS }, (_, i) => {
		const angle = (i / RING_SEGMENTS) * Math.PI * 2

		return [Math.cos(angle) * radius, Math.sin(angle) * radius]
	})
const RING_VERTICES = circle(1)
const RING_HOLES = [circle(RING_HOLE)]
// Just above the floor, so it doesn't flicker into it.
const RING_LIFT = 0.002

// Everything that changes per frame. Hit tests arrive up to 30 times a
// second: they write the nodes with setNativeProps (checked on the device
// under Fabric) and never re-render the scene.
type Live = {
	placed: boolean
	failed: boolean
	// How far the animal floats, its height and footprint, once measured.
	size: { distance: number; height: number; radius: number } | null
	// Where the model is shown (smoothed) and what was last written.
	shown: Vec3 | null
	written: Vec3 | null
	writtenYaw: number
	ringShown: boolean
	// Height of the floor, learned from the plane hits; null until found.
	floorY: number | null
	// Last point the hit test found on that floor.
	lastFloorHit: Vec3 | null
	lastEventAt: number
	// Where the view's centre meets the floor (the ring), if it does.
	hit: Vec3 | null
	camera: number[]
	timer: ReturnType<typeof createSteadyTimer>
	timeout: ReturnType<typeof setTimeout> | null
}

const createLive = (): Live => ({
	placed: false,
	failed: false,
	size: null,
	shown: null,
	written: null,
	writtenYaw: 0,
	ringShown: false,
	floorY: null,
	lastFloorHit: null,
	lastEventAt: 0,
	hit: null,
	camera: [0, 0, 0],
	timer: createSteadyTimer(),
	timeout: null,
})

// 'auto' (experimental, Model Viewer style): the GLB loads as AR opens and the animal
// floats ahead, a little below eye level, far enough to fit on screen. The
// hit test at the screen centre finds upward planes: the lowest is the
// floor. A ring marks the floor hit, or between hits (they blink at the
// edge of the mapped plane) where the view's centre meets the floor near
// the last one, and the animal stands on it. Once it holds still for
// STEADY_MS the animal lands, faces the camera and stays pinned to that
// world point.
// `resetKey` sends it back to floating. One model node stays mounted the
// whole time: moving it under another parent would reload the GLB.
function AutoPlacement({
	modelUrl,
	resetKey = 0,
	closing = false,
	onPlaneFound = noop,
	onPlaced,
	onModelLoaded,
	onModelError,
}: ModelPlacementSceneProps) {
	const nodeRef = useRef<ViroNode>(null)
	const ringRef = useRef<ViroNode>(null)
	const modelRef = useRef<Viro3DObject>(null)
	const live = useRef(createLive())
	// Same object between renders, so Viro doesn't load the GLB again.
	const source = useMemo(() => ({ uri: modelUrl ?? '' }), [modelUrl])
	// Hidden until measured; idle animation once placed.
	const [visible, setVisible] = useState(false)
	const [placed, setPlaced] = useState(false)
	// A model that failed to load is mounted again (a new key) on reset.
	const [failed, setFailed] = useState(false)
	const [attempt, setAttempt] = useState(0)
	const [placedFor, setPlacedFor] = useState(resetKey)

	if (placedFor !== resetKey) {
		setPlacedFor(resetKey)
		setPlaced(false)

		if (failed) {
			setFailed(false)
			setAttempt((value) => value + 1)
		}
	}

	// A new reset key: float again from where the animal stands.
	useEffect(() => {
		const state = live.current

		state.placed = false
		state.failed = false
		state.timer.reset()
		if (state.timeout) clearTimeout(state.timeout)
		state.timeout = null
	}, [resetKey])

	useEffect(() => {
		const state = live.current

		return () => {
			if (state.timeout) clearTimeout(state.timeout)
		}
	}, [])

	const showRing = (shown: boolean, position?: Vec3) => {
		const state = live.current

		if (position) {
			ringRef.current?.setNativeProps({
				position: [position[0], position[1] + RING_LIFT, position[2]],
				visible: shown,
			})
		} else if (state.ringShown !== shown) {
			ringRef.current?.setNativeProps({ visible: shown })
		}
		state.ringShown = shown
	}

	const moveModel = (position: Vec3, yaw: number) => {
		const state = live.current

		if (
			!movedEnough(state.written, position) &&
			Math.abs(yaw - state.writtenYaw) < MIN_YAW_STEP
		)
			return

		nodeRef.current?.setNativeProps({ position, rotation: [0, yaw, 0] })
		state.written = position
		state.writtenYaw = yaw
	}

	const land = () => {
		const state = live.current

		if (state.placed || state.failed || !state.size || !state.hit) return

		state.placed = true
		if (state.timeout) clearTimeout(state.timeout)
		state.timeout = null
		state.shown = state.hit
		showRing(false)
		moveModel(state.hit, yawToward(state.hit, state.camera))
		setPlaced(true)
		onPlaced()
	}

	// Viro stops sending hit tests while the phone holds still, so the
	// steady wait ends on a timer.
	const waitForSteady = (left: number) => {
		const state = live.current

		if (state.timeout) clearTimeout(state.timeout)
		state.timeout = setTimeout(() => {
			state.timeout = null
			if (state.timer.isSteady(Date.now())) land()
		}, left)
	}

	const onHitTest = ({
		hitTestResults,
		cameraOrientation,
	}: ViroCameraARHitTest) => {
		const state = live.current

		if (state.placed || state.failed) return

		const now = Date.now()
		const elapsed = state.lastEventAt ? now - state.lastEventAt : 0
		const camera = cameraOrientation.position

		state.lastEventAt = now
		state.camera = camera

		const foundBefore = state.floorY !== null

		state.floorY = nextFloorY(
			state.floorY,
			floorHeight(hitTestResults, camera[1]),
		)
		if (!foundBefore && state.floorY !== null) onPlaneFound()

		// The real hit when there is one; between hits, where the view meets
		// the floor, close to the last one.
		const real =
			state.floorY === null
				? null
				: floorHitAt(hitTestResults, camera[1], state.floorY)
		const ray =
			real || state.floorY === null
				? null
				: floorPoint(cameraOrientation, state.floorY)
		const point = real ?? (ray && bridges(ray, state.lastFloorHit) ? ray : null)

		if (real) state.lastFloorHit = real

		if (point) {
			state.hit = point
			showRing(true, point)

			const away = distance(point, [camera[0], camera[1], camera[2]])
			const left = state.timer.update(point, now, steadyTolerance(away))

			if (left === 0) land()
			else if (left === STEADY_MS) waitForSteady(left)
			if (state.placed) return
		} else if (state.hit) {
			// Looking above the floor: float again.
			state.hit = null
			state.timer.reset()
			if (state.timeout) clearTimeout(state.timeout)
			state.timeout = null
			showRing(false)
		}

		if (!state.size) return

		// Floating follows the camera exactly: its pose is already smooth, and
		// smoothing left the animal trailing when the events stopped. It
		// glides from floating onto the floor.
		const shown =
			point && state.shown
				? smooth(state.shown, point, elapsed, FLOOR_HALF_LIFE)
				: (point ??
					floatPosition(
						cameraOrientation,
						state.size.distance,
						state.size.height,
					))

		state.shown = shown
		moveModel(shown, yawToward(shown, camera))
	}

	// Measured before it ever turns (rotation 0): X is its width, Z its depth.
	const measure = async () => {
		const state = live.current
		let size = FALLBACK_SIZE

		try {
			const result = (await modelRef.current?.getBoundingBoxAsync()) as
				{ boundingBox?: BoundingBox } | undefined
			const box = result?.boundingBox

			if (box) {
				size = {
					distance: fitDistance(box),
					height: box.maxY - box.minY,
					radius: Math.max(box.maxX - box.minX, box.maxZ - box.minZ) / 2,
				}
			}
		} catch {
			// Fallback size: it may not fit the screen exactly.
		}

		state.size = size
		ringRef.current?.setNativeProps({
			scale: [size.radius, size.radius, size.radius],
		})
		setVisible(true)
		onModelLoaded()
		// The floor may have settled while the model was loading.
		if (state.timer.isSteady(Date.now())) land()
	}

	return (
		<ViroARScene
			anchorDetectionTypes={['PlanesHorizontal']}
			// Hit tests only while there's something to place: once placed or
			// closing, Viro stops emitting them.
			onCameraARHitTest={placed || closing ? undefined : onHitTest}
		>
			{/* eslint-disable-next-line no-restricted-syntax -- AR light color, not a UI color */}
			<ViroAmbientLight color='#fff' intensity={250} />

			<ViroNode ref={ringRef} visible={false}>
				<ViroPolygon
					vertices={RING_VERTICES}
					holes={RING_HOLES}
					rotation={FLAT}
					materials={['placementRing']}
				/>
			</ViroNode>

			{modelUrl && (
				<ViroNode
					ref={nodeRef}
					position={START_POSITION}
					rotation={START_ROTATION}
					visible={visible}
				>
					<Viro3DObject
						key={attempt}
						ref={modelRef}
						source={source}
						type='GLB'
						scale={[1, 1, 1]}
						animation={placed ? IDLE_ANIMATION : NO_ANIMATION}
						onLoadEnd={() => void measure()}
						onError={() => {
							live.current.failed = true
							setFailed(true)
							showRing(false)
							onModelError()
						}}
					/>
				</ViroNode>
			)}
		</ViroARScene>
	)
}
