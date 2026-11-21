import type { IconSvgElement } from '@hugeicons/react-native'
import { Text, View } from 'react-native'

import { Icon } from '@/components/ui/Icon'
import colors from '@/theme/colors'

type CameraLabelProps = {
	icon: IconSvgElement
	label: string
}

// Small dark pill naming what the camera is doing ("Selfie con Mapache",
// A-30), on the same 82% panel as CameraNotice so it reads on any frame.
export function CameraLabel({ icon, label }: CameraLabelProps) {
	return (
		<View className='h-8 flex-row items-center gap-1.5 self-center rounded-full bg-tinta/[0.82] px-3'>
			<Icon icon={icon} size={16} color={colors.blanco} />
			<Text
				className='font-sans-semibold text-[12px] text-blanco'
				numberOfLines={1}
			>
				{label}
			</Text>
		</View>
	)
}
