import hipoModel from '@/assets/models/hipo_test.glb'
import {
	Viro3DObject,
	ViroAmbientLight,
	ViroARPlaneSelector,
	ViroARScene,
	ViroARSceneNavigator,
} from '@reactvision/react-viro'
import { useRef, useState } from 'react'

function ArSceme() {
	const [placed, setPlaced] = useState<boolean>(false)
	const selectorRef = useRef<ViroARPlaneSelector>(null)
	const [anchorPosition, setAnchorPosition] =
		useState<[number, number, number]>()

	return (
		<ViroARScene
			anchorDetectionTypes={['PlanesHorizontal']}
			onAnchorFound={(a) => selectorRef.current?.handleAnchorFound(a)}
			onAnchorUpdated={(a) => selectorRef.current?.handleAnchorUpdated(a)}
			onAnchorRemoved={(a) => a && selectorRef.current?.handleAnchorRemoved(a)}
		>
			<ViroAmbientLight color='#fff' intensity={250} />

			{!placed && (
				<ViroARPlaneSelector
					minHeight={0}
					minWidth={0}
					ref={selectorRef}
					alignment='Horizontal'
					onPlaneSelected={(anchor, tapPosition) => {
						setAnchorPosition(tapPosition)
						setPlaced(true)
					}}
				/>
			)}

			{placed && (
				<Viro3DObject
					scale={[0.3, 0.3, 0.3]}
					rotation={[0, 0, 0]}
					position={anchorPosition}
					source={hipoModel}
					type='GLB'
					onLoadStart={() => console.log('Load start')}
					onLoadEnd={() => console.log('Load end')}
					onError={(error) =>
						console.warn('Model load error:', error.nativeEvent.error)
					}
				/>
			)}
		</ViroARScene>
	)
}

export default function ArScreen() {
	return <ViroARSceneNavigator initialScene={{ scene: ArSceme }} />
}
