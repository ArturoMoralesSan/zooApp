import { Viro3DSceneNavigator, type ViroScene } from '@reactvision/react-viro'
import { useMemo } from 'react'

import {
	CardViewerScene,
	type CardViewerSceneProps,
} from '@/components/deck/CardViewerScene'

type DebugQuizBackgroundProps = {
	modelUrl: string | null
	onModelReady: () => void
	onModelError: () => void
}

const noop = () => {}

// Debug duel only: a plain 3D view of the model in place of the AR camera,
// so the quiz runs with a Viro view mounted, as in a real duel.
export function DebugQuizBackground({
	modelUrl,
	onModelReady,
	onModelError,
}: DebugQuizBackgroundProps) {
	const sceneProps = useMemo<CardViewerSceneProps>(
		() => ({
			mode: 'model',
			cardImageUrl: null,
			modelUrl,
			playing: true,
			rotation: [0, -40],
			cardHeight: 1,
			modelSize: 0.8,
			offsetY: 0,
			onModelReady,
			onModelError,
			onCardImageSettled: noop,
		}),
		[modelUrl, onModelReady, onModelError],
	)

	return (
		<Viro3DSceneNavigator
			// Typed as the ViroScene class, but it renders any scene component.
			initialScene={{ scene: CardViewerScene as unknown as ViroScene }}
			viroAppProps={sceneProps}
			pbrEnabled
			hdrEnabled
			multisamplingEnabled
			bloomEnabled={false}
			shadowsEnabled={false}
			debug={false}
			onExitViro={noop}
			style={{ flex: 1 }}
		/>
	)
}
