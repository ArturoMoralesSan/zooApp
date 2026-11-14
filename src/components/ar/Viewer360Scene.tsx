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
} from '@reactvision/react-viro'
import { useMemo, useRef, useState } from 'react'
import type { ImageSourcePropType } from 'react-native'

import contactShadow from '@/assets/images/view360/contact-shadow.png'
import neutralSky from '@/assets/images/view360/sky.png'
import colors from '@/theme/colors'

export type Viewer360SceneProps = {
	// GLB at real scale (1 unit = 1 m, origin at the bottom center).
	modelUrl: string | null
	// Degrees around Y, from the drag gesture.
	yaw: number
	// Equirectangular image around the user. The neutral sky for now; a
	// habitat's own 360° photo can replace it later.
	background?: ImageSourcePropType
	onModelLoaded: () => void
	onModelError: () => void
}

type Viewer360SceneNavigatorProps = {
	sceneNavigator: { viroAppProps: Viewer360SceneProps }
}

type Vec3 = [number, number, number]

type BoundingBox = {
	minX: number
	maxX: number
	minY: number
	maxY: number
	minZ: number
	maxZ: number
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
// The shadow spreads a little past the animal's footprint, and sits just
// above the ground so the two don't flicker against each other.
const SHADOW_SPREAD = 1.4
const SHADOW_LIFT = 0.005
const FLAT: Vec3 = [-90, 0, 0]
const NO_HOLES: [number, number][][] = []

// Every card model embeds an "idle" clip.
const IDLE_ANIMATION = { name: 'idle', run: true, loop: true }

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
	onModelLoaded: noop,
	onModelError: noop,
}

function circle(radius: number): [number, number][] {
	return Array.from({ length: GROUND_SEGMENTS }, (_, index) => {
		const angle = (index / GROUND_SEGMENTS) * Math.PI * 2

		return [Math.cos(angle) * radius, Math.sin(angle) * radius]
	})
}

type Dimensions = { size: number; footprint: number }

// Vista 360°: the animal stands in front of the user in a neutral
// environment, and the gyroscope turns the camera (no AR, no camera feed).
// Data comes in through viroAppProps; Viro types scenes as () => Element but
// always passes sceneNavigator.
export function Viewer360Scene(props?: Viewer360SceneNavigatorProps) {
	const {
		modelUrl,
		yaw,
		background = neutralSky,
		onModelLoaded,
		onModelError,
	} = props?.sceneNavigator.viroAppProps ?? NO_SCENE_PROPS
	const modelRef = useRef<Viro3DObject>(null)
	const [dimensions, setDimensions] = useState<Dimensions | null>(null)
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
	const shadowSize = (dimensions?.footprint ?? 1) * SHADOW_SPREAD

	// Measured hidden first: its size decides how far away it stands.
	const measure = async () => {
		try {
			const result = (await modelRef.current?.getBoundingBoxAsync()) as
				{ boundingBox?: BoundingBox } | undefined
			const box = result?.boundingBox

			if (!box) throw new Error('Sin medidas')

			const width = box.maxX - box.minX
			const depth = box.maxZ - box.minZ
			const size = Math.max(width, box.maxY - box.minY, depth)

			setDimensions({ size, footprint: Math.max(width, depth) })
		} catch {
			// Unmeasurable: the nearest distance and a 1 m shadow still work.
			setDimensions({ size: 0, footprint: 1 })
		}

		onModelLoaded()
	}

	return (
		<ViroScene>
			<Viro360Image source={background} />

			{/* eslint-disable-next-line no-restricted-syntax -- AR light color, not a UI color */}
			<ViroAmbientLight color='#fff' intensity={300} />
			<ViroDirectionalLight
				// eslint-disable-next-line no-restricted-syntax -- AR light color, not a UI color
				color='#fff'
				direction={[0.3, -1, -0.6]}
				intensity={600}
			/>

			<ViroPolygon
				vertices={ground}
				holes={NO_HOLES}
				position={[0, -EYE_HEIGHT, 0]}
				rotation={FLAT}
				materials={['view360Ground']}
			/>

			{modelUrl && (
				<ViroNode position={[0, -EYE_HEIGHT, -distance]}>
					<ViroQuad
						width={shadowSize}
						height={shadowSize}
						position={[0, SHADOW_LIFT, 0]}
						rotation={FLAT}
						materials={['view360Shadow']}
						visible={dimensions !== null}
					/>

					{/* Its front (+Z) already faces the camera; the drag turns it. */}
					<Viro3DObject
						ref={modelRef}
						source={source}
						type='GLB'
						scale={[1, 1, 1]}
						rotation={[0, yaw, 0]}
						visible={dimensions !== null}
						animation={IDLE_ANIMATION}
						onLoadEnd={() => void measure()}
						onError={onModelError}
					/>
				</ViroNode>
			)}
		</ViroScene>
	)
}
