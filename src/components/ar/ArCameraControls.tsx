import type { IconSvgElement } from '@hugeicons/react-native'
import { Pressable, View } from 'react-native'

import { RoundCameraButton } from '@/components/ar/RoundCameraButton'
import { FocusRing, useFocusRing } from '@/components/ui/FocusRing'

export type CameraAction = {
	icon: IconSvgElement
	label: string
	onPress: () => void
	tone: 'white' | 'lima'
}

type ArCameraControlsProps = {
	left: CameraAction
	right: CameraAction
	onShutter: () => void
}

// Controls over the camera (DS p.7): a round button on each side of the
// 76dp shutter. A-29: reset · shutter · selfie; A-30: grid · shutter · AR.
export function ArCameraControls({
	left,
	right,
	onShutter,
}: ArCameraControlsProps) {
	return (
		<View className='flex-row items-center justify-center gap-8'>
			<RoundCameraButton {...left} />
			<Shutter onPress={onShutter} />
			<RoundCameraButton {...right} />
		</View>
	)
}

type ShutterProps = {
	onPress: () => void
}

// 76dp: white ring around a white disc.
function Shutter({ onPress }: ShutterProps) {
	const { focused, focusProps } = useFocusRing()

	return (
		<View>
			<Pressable
				onPress={onPress}
				accessibilityRole='button'
				accessibilityLabel='Tomar foto'
				{...focusProps}
				className={`h-[76px] w-[76px] items-center justify-center rounded-full border-4 active:opacity-80 ${focused ? 'border-bosque' : 'border-blanco'}`}
			>
				<View className='h-[60px] w-[60px] rounded-full bg-blanco' />
			</Pressable>

			<FocusRing visible={focused} radiusClassName='rounded-full' />
		</View>
	)
}
