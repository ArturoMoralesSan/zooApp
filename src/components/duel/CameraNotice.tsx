import type { IconSvgElement } from '@hugeicons/react-native'
import type { ReactNode } from 'react'
import { Text, View } from 'react-native'

import { Icon } from '@/components/ui/Icon'
import colors from '@/theme/colors'

type CameraNoticeProps = {
	message: string
	icon?: IconSvgElement
	// Extra content under the text (a loader, a button).
	children?: ReactNode
	className?: string
}

// Dark panel at 82% over the camera feed (DS p.7), readable on any frame.
export function CameraNotice({
	message,
	icon,
	children,
	className = '',
}: CameraNoticeProps) {
	return (
		<View className={`rounded-2xl bg-tinta/[0.82] px-4 py-3 ${className}`}>
			<View className='flex-row items-center gap-3'>
				{icon && <Icon icon={icon} size={20} color={colors.blanco} />}

				<Text
					className='min-w-0 flex-1 font-sans-semibold text-[14px] leading-[1.5] text-blanco'
					accessibilityLiveRegion='polite'
				>
					{message}
				</Text>
			</View>

			{children && <View className='mt-3'>{children}</View>}
		</View>
	)
}
