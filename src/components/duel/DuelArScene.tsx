import {
	Viro3DObject,
	ViroAmbientLight,
	ViroARPlaneSelector,
	ViroARScene,
} from '@reactvision/react-viro'
import { useRef, useState } from 'react'

export type DuelSceneProps = {
	// GLB already at real scale (1 unit = 1 m, origin at the bottom center).
	modelUrl: string | null
	onPlaced: () => void
	onModelLoaded: () => void
	onModelError: () => void
}

type DuelArSceneProps = {
	sceneNavigator: { viroAppProps: DuelSceneProps }
}

const noop = () => {}

// Every card model embeds an "idle" clip; it loops from the moment the
// animal is placed.
const IDLE_ANIMATION = { name: 'idle', run: true, loop: true }

const NO_SCENE_PROPS: DuelSceneProps = {
	modelUrl: null,
	onPlaced: noop,
	onModelLoaded: noop,
	onModelError: noop,
}

// Place the duel's animal on a horizontal plane, then show it. Based on the
// placement in (tabs)/ar.tsx; data and callbacks come in through viroAppProps.
// Viro types scenes as () => Element but always passes sceneNavigator.
export function DuelArScene(props?: DuelArSceneProps) {
	const { modelUrl, onPlaced, onModelLoaded, onModelError } =
		props?.sceneNavigator.viroAppProps ?? NO_SCENE_PROPS
	const selectorRef = useRef<ViroARPlaneSelector>(null)
	const [position, setPosition] = useState<[number, number, number]>()

	return (
		<ViroARScene
			anchorDetectionTypes={['PlanesHorizontal']}
			onAnchorFound={(a) => selectorRef.current?.handleAnchorFound(a)}
			onAnchorUpdated={(a) => selectorRef.current?.handleAnchorUpdated(a)}
			onAnchorRemoved={(a) => a && selectorRef.current?.handleAnchorRemoved(a)}
		>
			{/* eslint-disable-next-line no-restricted-syntax -- AR light color, not a UI color */}
			<ViroAmbientLight color='#fff' intensity={250} />

			{modelUrl && !position && (
				<ViroARPlaneSelector
					minHeight={0}
					minWidth={0}
					ref={selectorRef}
					alignment='Horizontal'
					onPlaneSelected={(_anchor, tapPosition) => {
						if (!tapPosition) return

						setPosition(tapPosition)
						onPlaced()
					}}
				/>
			)}

			{modelUrl && position && (
				<Viro3DObject
					source={{ uri: modelUrl }}
					type='GLB'
					scale={[1, 1, 1]}
					position={position}
					animation={IDLE_ANIMATION}
					onLoadEnd={onModelLoaded}
					onError={onModelError}
				/>
			)}
		</ViroARScene>
	)
}
