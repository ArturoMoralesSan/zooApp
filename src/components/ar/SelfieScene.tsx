import {
	ViroAmbientLight,
	ViroARScene,
	ViroDirectionalLight,
	ViroNode,
} from '@reactvision/react-viro'

import { AnimalModel } from '@/components/deck/CardViewerScene'

export type SelfieSceneProps = {
	modelUrl: string | null
	playing: boolean
	// Where the animal stands, in meters from where the session started,
	// and its largest side.
	position: [number, number]
	modelSize: number
	// Degrees around Y, from the rotate gesture.
	yaw: number
	onModelReady: () => void
	onModelError: () => void
}

type SelfieSceneNavigatorProps = {
	sceneNavigator: { viroAppProps: SelfieSceneProps }
}

// The animal stands this far in front of the phone.
export const SELFIE_SUBJECT_DISTANCE = 1.25

const noop = () => {}

const NO_SCENE_PROPS: SelfieSceneProps = {
	modelUrl: null,
	playing: true,
	position: [0, 0],
	modelSize: 1,
	yaw: 0,
	onModelReady: noop,
	onModelError: noop,
}

// Selfie (A-30): an AR session on the front camera (its navigator has
// frontCameraEnabled), with the card's animal next to the visitor. The
// front camera has no surface tracking, so the animal stands at a fixed
// spot in front of where the session started. Data comes in through
// viroAppProps; Viro types scenes as () => Element but always passes
// sceneNavigator.
export function SelfieScene(props?: SelfieSceneNavigatorProps) {
	const scene = props?.sceneNavigator.viroAppProps ?? NO_SCENE_PROPS

	return (
		<ViroARScene>
			{/* eslint-disable-next-line no-restricted-syntax -- AR light color */}
			<ViroAmbientLight color='#fff' intensity={300} />
			<ViroDirectionalLight
				// eslint-disable-next-line no-restricted-syntax -- AR light color
				color='#fff'
				direction={[0.3, -1, -0.6]}
				intensity={600}
			/>

			<ViroNode
				position={[
					scene.position[0],
					scene.position[1],
					-SELFIE_SUBJECT_DISTANCE,
				]}
				rotation={[0, scene.yaw, 0]}
			>
				{scene.modelUrl && (
					<AnimalModel
						key={scene.modelUrl}
						modelUrl={scene.modelUrl}
						playing={scene.playing}
						modelSize={scene.modelSize}
						onModelReady={scene.onModelReady}
						onModelError={scene.onModelError}
					/>
				)}
			</ViroNode>
		</ViroARScene>
	)
}
