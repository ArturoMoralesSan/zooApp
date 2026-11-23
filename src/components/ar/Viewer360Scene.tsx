import {
	Viro360Image,
	Viro3DObject,
	ViroAmbientLight,
	ViroDirectionalLight,
	ViroMaterials,
	ViroNode,
	ViroPolygon,
	ViroQuad,
	ViroScene,
	ViroSkyBox,
} from '@reactvision/react-viro'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ImageSourcePropType } from 'react-native'

import contactShadow from '@/assets/images/view360/contact-shadow.png'
import savannaSky from '@/assets/images/view360/savanna-sky.jpg'
import savannaScenario from '@/assets/models/scenario/savanna.glb'
import colors from '@/theme/colors'
import type { BoundingBox } from '@/utils/arPlacement'
import {
	blobSize,
	type Dimensions,
	dimensionsOf,
	FALLBACK_DIMENSIONS,
	SHADOW_CAMERA_DISTANCE,
	SHADOW_MAP_SIZE,
	shadowBox,
	shadowCameraFrom,
} from '@/utils/shadow'
import { isUntrackedPose, rotateAroundY, type Vec3 } from '@/utils/view360'

export type Viewer360SceneProps = {
	// GLB at real scale (1 unit = 1 m, origin at the bottom center).
	modelUrl: string | null
	// Degrees around Y, from the drag gesture.
	yaw: number
	// Each new value moves the animal in front of where the phone points.
	centerKey: number
	// Equirectangular image around the user; the savanna's sky by default.
	background?: ImageSourcePropType
	// "Calidad gráfica": the savanna and its sky (off: the plain ground disc
	// under a plain sky, and savanna.glb is never loaded) and the live
	// shadow (its navigator needs shadowsEnabled too).
	scenario: boolean
	liveShadow: boolean
	onModelLoaded: () => void
	onModelError: () => void
	// Once the animal is placed and the scenario has loaded (or failed): what
	// a loading cover waits for. Called once per scene.
	onReady: () => void
	// Head tracking hasn't started (see TRACKING_STUCK_MS): the view needs
	// to be created again.
	onTrackingStuck: () => void
}

type Viewer360SceneNavigatorProps = {
	sceneNavigator: { viroAppProps: Viewer360SceneProps }
}

// The camera sits at the origin looking down -Z; the ground is this far
// below it, about where a standing visitor holds the phone.
const EYE_HEIGHT = 1.4
// The animal stands at least this far away, further if it's big, so it
// fits in view without the user stepping back.
const MIN_DISTANCE = 2.5
const MAX_DISTANCE = 6
const DISTANCE_PER_SIZE = 1.2
// Ground disc around the user, reaching past the animal.
const GROUND_MARGIN = 2.5
const GROUND_SEGMENTS = 48
// The contact shadow sits just above the ground so the two don't flicker
// against each other.
const SHADOW_LIFT = 0.005
const FLAT: Vec3 = [-90, 0, 0]
const NO_HOLES: [number, number][][] = []

// Every card model embeds an "idle" clip.
const IDLE_ANIMATION = { name: 'idle', run: true, loop: true }

// The savanna (built in Blender, outside the repo) is laid out around -Z,
// where the animal stands: a clear area 6 m wide from 1.5 to 8.5 m, plants
// and rocks around it. Its ground has the shadows of SUN_DIRECTION baked
// in, so the scenario, the sky and the sun all turn with the animal's
// heading and keep their places relative to it.
const SCENARIO_POSITION: Vec3 = [0, -EYE_HEIGHT, 0]
// Where the sunlight travels at heading 0: from behind the user, on the
// right, 32° above the horizon (the sky image's own sun).
const SUN_DIRECTION: Vec3 = [-0.543, -0.528, -0.653]
// Only the animal casts a live shadow (the scenario's are baked); its
// shadow camera follows utils/shadow.
const NO_SHADOW = 0

ViroMaterials.createMaterials({
	view360Ground: {
		diffuseColor: colors.cardBorder,
		lightingModel: 'Constant',
		cullMode: 'None',
	},
	view360Shadow: {
		diffuseTexture: contactShadow,
		lightingModel: 'Constant',
		blendMode: 'Alpha',
		writesToDepthBuffer: false,
	},
})

const noop = () => {}

const NO_SCENE_PROPS: Viewer360SceneProps = {
	modelUrl: null,
	yaw: 0,
	centerKey: 0,
	scenario: true,
	liveShadow: true,
	onModelLoaded: noop,
	onModelError: noop,
	onReady: noop,
	onTrackingStuck: noop,
}

function circle(radius: number): [number, number][] {
	return Array.from({ length: GROUND_SEGMENTS }, (_, index) => {
		const angle = (index / GROUND_SEGMENTS) * Math.PI * 2

		return [Math.cos(angle) * radius, Math.sin(angle) * radius]
	})
}

// Below this horizontal length the phone points almost straight up or down
// and its forward has no useful heading.
const MIN_HORIZONTAL = 0.35
// How often the scene checks where the phone points until the animal is
// placed.
const PLACE_POLL_MS = 250
// GVR's head tracking sometimes starts very late or never: the camera stays
// at its default pose, straight down at the ground (a solid colour). Still
// there this long after the animal loaded, the view is created again.
const TRACKING_STUCK_MS = 3000

const hasHeading = (forward: number[]) =>
	Math.hypot(forward[0], forward[2]) >= MIN_HORIZONTAL

// Degrees around Y that turn -Z (where the animal stands) toward where the
// phone points. Pointing down, the top of the phone shows the way the user
// faces; pointing up, its bottom does.
function headingOf(forward: number[], up: number[]) {
	const [fx, fy, fz] = forward
	const level = hasHeading(forward)
	const sign = fy < 0 ? 1 : -1
	const x = level ? fx : up[0] * sign
	const z = level ? fz : up[2] * sign

	return (Math.atan2(-x, -z) * 180) / Math.PI
}

// Vista 360°: the animal stands in front of the user in a neutral
// environment, and the gyroscope turns the camera (no AR, no camera feed).
// Data comes in through viroAppProps; Viro types scenes as () => Element but
// always passes sceneNavigator.
export function Viewer360Scene(props?: Viewer360SceneNavigatorProps) {
	const {
		modelUrl,
		yaw,
		centerKey,
		background = savannaSky,
		scenario: withScenario,
		liveShadow,
		onModelLoaded,
		onModelError,
		onReady,
		onTrackingStuck,
	} = props?.sceneNavigator.viroAppProps ?? NO_SCENE_PROPS
	const sceneRef = useRef<ViroScene>(null)
	const modelRef = useRef<Viro3DObject>(null)
	const [dimensions, setDimensions] = useState<Dimensions | null>(null)
	// GVR's own recenter isn't reliable without a headset (it can leave the
	// view facing away), so the animal turns to the camera instead.
	const [heading, setHeading] = useState(0)
	// Shown only once placed in front of the user (see below).
	const [placed, setPlaced] = useState(false)
	// Until the scenario shows (or if it can't load, or it's off) the plain
	// ground disc stands in for it; the animal never waits for it.
	const [scenario, setScenario] = useState<
		'loading' | 'loaded' | 'failed' | 'off'
	>(withScenario ? 'loading' : 'off')
	const scenarioLoaded = scenario === 'loaded'
	// Since when the camera has been at GVR's untracked pose.
	const untrackedSince = useRef<number | null>(null)
	const sunDirection = useMemo(
		() => rotateAroundY(SUN_DIRECTION, heading),
		[heading],
	)
	// Same object between renders: the scene re-renders on every drag frame,
	// and a new source would load the GLB again.
	const source = useMemo(() => ({ uri: modelUrl ?? '' }), [modelUrl])

	const distance = dimensions
		? Math.min(
				MAX_DISTANCE,
				Math.max(MIN_DISTANCE, dimensions.size * DISTANCE_PER_SIZE),
			)
		: MIN_DISTANCE
	const ground = useMemo(() => circle(distance + GROUND_MARGIN), [distance])
	const shadowSize = blobSize(dimensions?.footprint ?? 1)
	const sunShadow = useMemo(() => {
		const animal = rotateAroundY([0, -EYE_HEIGHT, -distance], heading)

		return {
			from: shadowCameraFrom(animal, sunDirection),
			box: shadowBox(dimensions?.size ?? 0),
		}
	}, [distance, heading, sunDirection, dimensions])

	const faceCamera = async () => {
		try {
			const camera = await sceneRef.current?.getCameraOrientationAsync()

			if (camera) setHeading(headingOf(camera.forward, camera.up))
		} catch {
			// Keeps the last heading.
		}
	}

	useEffect(() => {
		if (centerKey > 0) void faceCamera()
	}, [centerKey])

	// Placed where the phone points, but only once it points somewhere: head
	// tracking can take a while to start (it reads straight down until then),
	// and a phone lying flat has no direction yet. Raising it shows the animal.
	useEffect(() => {
		if (!dimensions || placed) return

		const interval = setInterval(async () => {
			try {
				const camera = await sceneRef.current?.getCameraOrientationAsync()

				if (!camera) return

				if (isUntrackedPose(camera.forward, camera.up)) {
					const since = (untrackedSince.current ??= Date.now())

					// Not while the scenario loads: releasing a Viro view
					// mid-load breaks the next one (see useViroExit).
					if (
						scenario !== 'loading' &&
						Date.now() - since >= TRACKING_STUCK_MS
					) {
						clearInterval(interval)
						onTrackingStuck()
					}

					return
				}

				untrackedSince.current = null

				if (!hasHeading(camera.forward)) return

				setHeading(headingOf(camera.forward, camera.up))
				setPlaced(true)
			} catch {
				// Tries again on the next tick.
			}
		}, PLACE_POLL_MS)

		return () => clearInterval(interval)
	}, [dimensions, placed, scenario, onTrackingStuck])

	useEffect(() => {
		if (placed && scenario !== 'loading') onReady()
	}, [placed, scenario, onReady])

	// Measured hidden first: its size decides how far away it stands.
	const measure = async () => {
		try {
			const result = (await modelRef.current?.getBoundingBoxAsync()) as
				{ boundingBox?: BoundingBox } | undefined
			const box = result?.boundingBox

			if (!box) throw new Error('Sin medidas')

			setDimensions(dimensionsOf(box))
		} catch {
			// Unmeasurable: the nearest distance and a 1 m shadow still work.
			setDimensions(FALLBACK_DIMENSIONS)
		}

		onModelLoaded()
	}

	return (
		<ViroScene ref={sceneRef}>
			{/* The sky image has the HDRI's rotation built in and lines up with
			    the scenario as it is (checked on a phone against a marked sky). */}
			{withScenario ? (
				<Viro360Image source={background} rotation={[0, heading, 0]} />
			) : (
				<ViroSkyBox color={colors.niebla} />
			)}

			{/* Colours measured from the noon sky; intensities set so the ground is as
			    bright on a phone as in the Blender render. */}
			{/* eslint-disable-next-line no-restricted-syntax -- AR light color, not a UI color */}
			<ViroAmbientLight color='#c5e3ff' intensity={362} />
			<ViroDirectionalLight
				// eslint-disable-next-line no-restricted-syntax -- AR light color, not a UI color
				color='#fff2cc'
				direction={sunDirection}
				intensity={728}
				castsShadow={liveShadow}
				shadowOpacity={0.55}
				shadowMapSize={SHADOW_MAP_SIZE}
				shadowOrthographicPosition={sunShadow.from}
				shadowOrthographicSize={sunShadow.box}
				shadowNearZ={1}
				shadowFarZ={SHADOW_CAMERA_DISTANCE * 2}
			/>

			{!(scenarioLoaded && placed) && (
				<ViroPolygon
					vertices={ground}
					holes={NO_HOLES}
					position={[0, -EYE_HEIGHT, 0]}
					rotation={FLAT}
					materials={['view360Ground']}
					shadowCastingBitMask={NO_SHADOW}
				/>
			)}

			<ViroNode rotation={[0, heading, 0]}>
				{withScenario && (
					<Viro3DObject
						source={savannaScenario}
						type='GLB'
						position={SCENARIO_POSITION}
						scale={[1, 1, 1]}
						visible={placed && scenarioLoaded}
						shadowCastingBitMask={NO_SHADOW}
						onLoadEnd={() => setScenario('loaded')}
						onError={() => setScenario('failed')}
					/>
				)}

				{modelUrl && (
					<ViroNode position={[0, -EYE_HEIGHT, -distance]}>
						<ViroQuad
							width={shadowSize}
							height={shadowSize}
							position={[0, SHADOW_LIFT, 0]}
							rotation={FLAT}
							materials={['view360Shadow']}
							visible={placed}
							shadowCastingBitMask={NO_SHADOW}
						/>

						{/* Its front (+Z) already faces the camera; the drag turns it. */}
						<Viro3DObject
							ref={modelRef}
							source={source}
							type='GLB'
							scale={[1, 1, 1]}
							rotation={[0, yaw, 0]}
							visible={placed}
							animation={IDLE_ANIMATION}
							onLoadEnd={() => void measure()}
							onError={onModelError}
						/>
					</ViroNode>
				)}
			</ViroNode>
		</ViroScene>
	)
}
