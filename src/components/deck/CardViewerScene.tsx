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
import { useMemo, useRef, useState } from 'react'

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
	// Sizes in world units, worked out from the free space on screen
	// (see CardViewerFrame): the card's height and the animal's largest side.
	cardHeight: number
	modelSize: number
	// Moves the subject up into the space between the overlays.
	offsetY: number
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

// Viro's default camera sits at the origin looking down -Z with a 90°
// field of view; the subject stands this far in front of it. There's no
// camera component on purpose: Fabric creates a ViroCamera before Viro's
// renderer is ready on the first launch, and that crashes natively.
export const SUBJECT_DISTANCE = 1.25
const ORIGIN: Vec3 = [0, 0, 0]
// The card's back GLB is a real-size card (5.72 × 10.16 cm), centered and
// upright, as a thin slab whose front face is at z = 0.
const CARD_WIDTH = 0.0572
const CARD_HEIGHT = 0.1016
const CARD_THICKNESS = 0.0005
// The front is the card image on a plane of the same size, just ahead of
// the slab. Front.glb isn't used: Viro doesn't apply `materials` to GLB
// meshes, and its plane faces into the slab, so Viro culls it. The image's
// transparent corners give the same rounded shape.
const CARD_FRONT_POSITION: Vec3 = [0, 0, 0.002]
// Back.glb has the same issue: its dark face points forward. Turned around
// and moved back by its thickness, it faces the rear behind the image.
const CARD_BACK_ROTATION: Vec3 = [0, 180, 0]

const noop = () => {}

const NO_SCENE_PROPS: CardViewerSceneProps = {
	mode: 'card',
	cardImageUrl: null,
	modelUrl: null,
	playing: false,
	rotation: [0, 0],
	cardHeight: 1,
	modelSize: 1,
	offsetY: 0,
	onModelReady: noop,
	onModelError: noop,
}

// Viewer for the 3D card (A-26) and the animal (A-27). Data comes in
// through viroAppProps; Viro types scenes as () => Element but always passes
// sceneNavigator.
export function CardViewerScene(props?: CardViewerSceneNavigatorProps) {
	const scene = props?.sceneNavigator.viroAppProps ?? NO_SCENE_PROPS
	const cardScale = scene.cardHeight / CARD_HEIGHT
	// Same object between renders: the scene re-renders on every drag frame,
	// and a new source would make Viro load the image again each time.
	const cardSource = useMemo(
		() => (scene.cardImageUrl ? { uri: scene.cardImageUrl } : null),
		[scene.cardImageUrl],
	)

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
				position={[0, scene.offsetY, -SUBJECT_DISTANCE]}
				rotation={[scene.rotation[0], scene.rotation[1], 0]}
			>
				{scene.mode === 'card' ? (
					<>
						{cardSource && (
							<ViroImage
								source={cardSource}
								width={CARD_WIDTH * cardScale}
								height={CARD_HEIGHT * cardScale}
								position={CARD_FRONT_POSITION}
							/>
						)}
						<Viro3DObject
							source={cardBack}
							type='GLB'
							scale={[cardScale, cardScale, cardScale]}
							rotation={CARD_BACK_ROTATION}
							position={[0, 0, -CARD_THICKNESS * cardScale]}
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

type Dimensions = { size: number; height: number }

// The animal GLB is real scale (1 unit = 1 m, origin at the bottom center),
// so it loads hidden at scale 1 and gets measured. Its largest side is then
// scaled to `modelSize` and it's centered on the point the drag turns
// around.
function AnimalModel({
	modelUrl,
	playing,
	modelSize,
	onModelReady,
	onModelError,
}: CardViewerSceneProps) {
	const ref = useRef<Viro3DObject>(null)
	const [dimensions, setDimensions] = useState<Dimensions | null>(null)
	// Stable across drag re-renders, so the GLB isn't reloaded (see cardSource).
	const source = useMemo(() => ({ uri: modelUrl as string }), [modelUrl])

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

			setDimensions(size > 0 ? { size, height } : { size: 1, height: 0 })
		} catch {
			// Unmeasurable: show it at real scale rather than not at all.
			setDimensions({ size: modelSize, height: 0 })
		}

		onModelReady()
	}

	// Derived on every render, so a new layout resizes it without measuring.
	const scale = dimensions ? modelSize / dimensions.size : 1
	// Origin at the bottom center: lowering it by half its height centers it.
	const position: Vec3 = dimensions
		? [0, -(dimensions.height / 2) * scale, 0]
		: ORIGIN

	return (
		<Viro3DObject
			ref={ref}
			source={source}
			type='GLB'
			visible={dimensions !== null}
			scale={[scale, scale, scale]}
			position={position}
			animation={{ name: 'idle', run: playing, loop: true }}
			onLoadEnd={() => void measure()}
			onError={onModelError}
		/>
	)
}
