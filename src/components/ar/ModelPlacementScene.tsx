import {
	Viro3DObject,
	ViroAmbientLight,
	ViroARPlaneSelector,
	ViroARScene,
	ViroNode,
} from '@reactvision/react-viro'
import { useEffect, useMemo, useRef, useState } from 'react'

export type ModelPlacementSceneProps = {
	// GLB already at real scale (1 unit = 1 m, origin at the bottom center).
	modelUrl: string | null
	// Changing it clears the placement so the user can pick a plane again.
	resetKey?: number
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

const NO_SCENE_PROPS: ModelPlacementSceneProps = {
	modelUrl: null,
	onPlaced: noop,
	onModelLoaded: noop,
	onModelError: noop,
}

// Yaw (degrees around Y) that turns the model's front (+Z, the glTF
// convention) toward the camera.
function yawToward(from: Vec3, to: number[]) {
	return (Math.atan2(to[0] - from[0], to[2] - from[2]) * 180) / Math.PI
}

// Places a card's animal at life size on a horizontal plane, where the user
// taps (duel A-20, AR view A-28/A-29). The plane selector only picks the
// spot: the model is pinned to that world point, not to the plane, whose
// center ARCore keeps moving as it refines it (the model drifted with it).
// `resetKey` re-shows the planes to place it again. Data and callbacks come
// in through viroAppProps; Viro types scenes as () => Element but always
// passes sceneNavigator.
export function ModelPlacementScene(props?: ModelPlacementSceneNavigatorProps) {
	const {
		modelUrl,
		resetKey = 0,
		onPlaneFound = noop,
		onPlaced,
		onModelLoaded,
		onModelError,
	} = props?.sceneNavigator.viroAppProps ?? NO_SCENE_PROPS
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
