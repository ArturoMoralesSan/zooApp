import cardBack from '@/assets/models/card/Back.glb'
import {
	Viro3DObject,
	ViroAmbientLight,
	ViroDirectionalLight,
	ViroImage,
	ViroNode,
	ViroScene,
	ViroSkyBox,
} from '@reactvision/react-viro'
import { useRef, useState } from 'react'

import colors from '@/theme/colors'

export type ViewerMode = 'card' | 'model'

export type CardViewerSceneProps = {
	mode: ViewerMode
	// Full card image (frame, name and stats already drawn in).
	cardImageUrl: string | null
	modelUrl: string | null
	playing: boolean
	// Degrees around the X (pitch) and Y (yaw) axes, from the drag gesture.
	rotation: [number, number]
	onModelReady: () => void
	onModelError: () => void
}

type CardViewerSceneNavigatorProps = {
	sceneNavigator: { viroAppProps: CardViewerSceneProps }
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

// Both the card and the animal fit a box of this size (world units), so
// each one fills the viewer the same way.
const FIT_SIZE = 1.4
// Viro's default camera sits at the origin looking down -Z, with a wide
// field of view: at this distance FIT_SIZE fills about two thirds of the
// viewer's height. There's no camera component on purpose: Fabric creates
// a ViroCamera before Viro's renderer is ready on the first launch, and
// that crashes natively.
const SUBJECT_POSITION: Vec3 = [0, 0, -1.25]
const ORIGIN: Vec3 = [0, 0, 0]
// The card's back GLB is a real-size card (5.72 × 10.16 cm), centered and
// upright, as a thin slab whose front face is at z = 0.
const CARD_WIDTH = 0.0572
const CARD_HEIGHT = 0.1016
const CARD_SCALE = FIT_SIZE / CARD_HEIGHT
const CARD_SCALE_VEC: Vec3 = [CARD_SCALE, CARD_SCALE, CARD_SCALE]
// The front is the card image on a plane of the same size, just ahead of
// the slab. Front.glb isn't used: Viro doesn't apply `materials` to GLB
// meshes, and its plane faces into the slab, so Viro culls it. The image's
// transparent corners give the same rounded shape.
const CARD_FRONT_POSITION: Vec3 = [0, 0, 0.002]
// Back.glb has the same issue: its dark face points forward. Turned around
// and moved back by its thickness (0.5 mm), it faces the rear behind the
// image.
const CARD_BACK_ROTATION: Vec3 = [0, 180, 0]
const CARD_BACK_POSITION: Vec3 = [0, 0, -0.0005 * CARD_SCALE]

const noop = () => {}

const NO_SCENE_PROPS: CardViewerSceneProps = {
	mode: 'card',
	cardImageUrl: null,
	modelUrl: null,
	playing: false,
	rotation: [0, 0],
	onModelReady: noop,
	onModelError: noop,
}

// Orbit viewer for the 3D card (A-26) and the animal (A-27). Data comes in
// through viroAppProps; Viro types scenes as () => Element but always passes
// sceneNavigator.
export function CardViewerScene(props?: CardViewerSceneNavigatorProps) {
	const scene = props?.sceneNavigator.viroAppProps ?? NO_SCENE_PROPS

	return (
		<ViroScene>
			<ViroSkyBox color={colors.niebla} />
			{/* eslint-disable-next-line no-restricted-syntax -- 3D light color, not a UI color */}
			<ViroAmbientLight color='#fff' intensity={300} />
			<ViroDirectionalLight
				// eslint-disable-next-line no-restricted-syntax -- 3D light color, not a UI color
				color='#fff'
				direction={[0.3, -1, -0.6]}
				intensity={600}
			/>

			{/* The drag turns the object (see CardViewerFrame): Viro's orbit
			    camera has no touch handling in a non-AR scene. */}
			<ViroNode
				position={SUBJECT_POSITION}
				rotation={[scene.rotation[0], scene.rotation[1], 0]}
			>
				{scene.mode === 'card' ? (
					<>
						{scene.cardImageUrl && (
							<ViroImage
								source={{ uri: scene.cardImageUrl }}
								width={CARD_WIDTH * CARD_SCALE}
								height={CARD_HEIGHT * CARD_SCALE}
								position={CARD_FRONT_POSITION}
							/>
						)}
						<Viro3DObject
							source={cardBack}
							type='GLB'
							scale={CARD_SCALE_VEC}
							rotation={CARD_BACK_ROTATION}
							position={CARD_BACK_POSITION}
						/>
					</>
				) : (
					scene.modelUrl && (
						// Keyed by URL: another card loads and measures from scratch.
						<AnimalModel key={scene.modelUrl} {...scene} />
					)
				)}
			</ViroNode>
		</ViroScene>
	)
}

type Fit = { scale: Vec3; position: Vec3 }

// The animal GLB is real scale (1 unit = 1 m, origin at the bottom center),
// so it loads hidden at scale 1, gets measured, then is scaled to FIT_SIZE
// and centered on the point the drag turns around.
function AnimalModel({
	modelUrl,
	playing,
	onModelReady,
	onModelError,
}: CardViewerSceneProps) {
	const ref = useRef<Viro3DObject>(null)
	const [fit, setFit] = useState<Fit | null>(null)

	const measure = async () => {
		try {
			const result = (await ref.current?.getBoundingBoxAsync()) as
				{ boundingBox?: BoundingBox } | undefined
			const box = result?.boundingBox

			if (!box) throw new Error('Sin medidas')

			// The box is in world space (moved and turned with the parent
			// nodes), so only its extents are used, never its position.
			const height = box.maxY - box.minY
			const size = Math.max(box.maxX - box.minX, height, box.maxZ - box.minZ)
			const scale = size > 0 ? FIT_SIZE / size : 1

			// Origin at the bottom center: lowering it by half its height
			// centers it on the point the drag turns around.
			setFit({
				scale: [scale, scale, scale],
				position: [0, -(height / 2) * scale, 0],
			})
		} catch {
			// Unmeasurable: show it at real scale rather than not at all.
			setFit({ scale: [1, 1, 1], position: ORIGIN })
		}

		onModelReady()
	}

	return (
		<Viro3DObject
			ref={ref}
			source={{ uri: modelUrl as string }}
			type='GLB'
			visible={fit !== null}
			scale={fit?.scale ?? [1, 1, 1]}
			position={fit?.position ?? ORIGIN}
			animation={{ name: 'idle', run: playing, loop: true }}
			onLoadEnd={() => void measure()}
			onError={onModelError}
		/>
	)
}
