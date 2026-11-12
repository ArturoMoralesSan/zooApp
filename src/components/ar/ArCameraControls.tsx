import { CameraSmile01Icon, Refresh01Icon } from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react-native'
import { Pressable, View } from 'react-native'

import { FocusRing, useFocusRing } from '@/components/ui/FocusRing'
import { Icon } from '@/components/ui/Icon'
import colors from '@/theme/colors'

type ArCameraControlsProps = {
	onReset: () => void
	onShutter: () => void
	onSelfie: () => void
}

// Controls over the camera (DS p.7, A-29): white reset, 76dp shutter and a
// Lima selfie button.
export function ArCameraControls({
	onReset,
	onShutter,
	onSelfie,
}: ArCameraControlsProps) {
	return (
		<View className='flex-row items-center justify-center gap-8'>
			<RoundCameraButton
				icon={Refresh01Icon}
				label='Colocar de nuevo'
				onPress={onReset}
				tone='white'
			/>

			<Shutter onPress={onShutter} />

			<RoundCameraButton
				icon={CameraSmile01Icon}
				label='Selfie'
				onPress={onSelfie}
				tone='lima'
			/>
		</View>
	)
}

type RoundCameraButtonProps = {
	icon: IconSvgElement
	label: string
	onPress: () => void
	tone: 'white' | 'lima'
}

function RoundCameraButton({
	icon,
	label,
	onPress,
	tone,
}: RoundCameraButtonProps) {
	const { focused, focusProps } = useFocusRing()

	return (
		<View>
			<Pressable
				onPress={onPress}
				accessibilityRole='button'
				accessibilityLabel={label}
				{...focusProps}
				className={`h-[52px] w-[52px] items-center justify-center rounded-full active:opacity-80 ${tone === 'lima' ? 'bg-lima' : 'bg-blanco'} ${focused ? 'border-2 border-bosque' : ''}`}
			>
				<Icon icon={icon} color={colors.bosque} strong />
			</Pressable>

			<FocusRing visible={focused} radiusClassName='rounded-full' />
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
