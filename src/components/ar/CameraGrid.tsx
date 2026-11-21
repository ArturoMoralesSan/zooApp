import { View } from 'react-native'

const THIRDS = ['33.333%', '66.667%'] as const

// Rule-of-thirds guide over the camera (A-30). It's a normal view, so it
// never ends up in the photo.
export function CameraGrid() {
	return (
		<View pointerEvents='none' className='absolute inset-0'>
			{THIRDS.map((at) => (
				<View
					key={`v${at}`}
					className='absolute bottom-0 top-0 w-px bg-blanco/[0.6]'
					style={{ left: at }}
				/>
			))}
			{THIRDS.map((at) => (
				<View
					key={`h${at}`}
					className='absolute left-0 right-0 h-px bg-blanco/[0.6]'
					style={{ top: at }}
				/>
			))}
		</View>
	)
}
