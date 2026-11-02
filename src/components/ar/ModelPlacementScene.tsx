import {
	Viro3DObject,
	ViroAmbientLight,
	ViroARPlaneSelector,
	ViroARScene,
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

// Places a card's animal at life size on a horizontal plane, where the user
// taps (duel A-20, AR view A-28/A-29). The model is a child of the plane
// selector, so it stays locked to that surface; `resetKey` re-shows the
// planes to place it again. Data and callbacks come in through viroAppProps;
// Viro types scenes as () => Element but always passes sceneNavigator.
export function ModelPlacementScene(props?: ModelPlacementSceneNavigatorProps) {
	const {
		modelUrl,
		resetKey = 0,
		onPlaneFound = noop,
		onPlaced,
		onModelLoaded,
		onModelError,
	} = props?.sceneNavigator.viroAppProps ?? NO_SCENE_PROPS
	const selectorRef = useRef<ViroARPlaneSelector>(null)
	// Same object between renders, so Viro doesn't load the GLB again.
	const source = useMemo(() => ({ uri: modelUrl ?? '' }), [modelUrl])
	const [placed, setPlaced] = useState(false)
	const [placedFor, setPlacedFor] = useState(resetKey)

	// A new reset key clears the selection: the planes show again and the
	// model is removed until the next tap.
	if (placedFor !== resetKey) {
		setPlacedFor(resetKey)
		setPlaced(false)
	}

	useEffect(() => {
		selectorRef.current?.reset()
	}, [resetKey])

	return (
		<ViroARScene
			anchorDetectionTypes={['PlanesHorizontal']}
			onAnchorFound={(anchor) => {
				if (anchor.type === 'plane') onPlaneFound()
				selectorRef.current?.handleAnchorFound(anchor)
			}}
			onAnchorUpdated={(a) => selectorRef.current?.handleAnchorUpdated(a)}
			onAnchorRemoved={(a) => a && selectorRef.current?.handleAnchorRemoved(a)}
		>
			{/* eslint-disable-next-line no-restricted-syntax -- AR light color, not a UI color */}
			<ViroAmbientLight color='#fff' intensity={250} />

			{modelUrl && (
				<ViroARPlaneSelector
					ref={selectorRef}
					minHeight={0}
					minWidth={0}
					alignment='HorizontalUpward'
					onPlaneSelected={() => {
						setPlaced(true)
						onPlaced()
					}}
				>
					{/* Mounted only once placed, so loading starts at the tap. */}
					{placed && (
						<Viro3DObject
							source={source}
							type='GLB'
							scale={[1, 1, 1]}
							animation={IDLE_ANIMATION}
							onLoadEnd={onModelLoaded}
							onError={onModelError}
						/>
					)}
				</ViroARPlaneSelector>
			)}
		</ViroARScene>
	)
}
