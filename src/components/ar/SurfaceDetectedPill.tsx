import { Tick02Icon } from '@hugeicons/core-free-icons'
import { Text, View } from 'react-native'

import { Icon } from '@/components/ui/Icon'
import colors from '@/theme/colors'

// "Superficie detectada" (A-28): Lima pill with a check, so the state isn't
// conveyed by color alone.
export function SurfaceDetectedPill() {
	return (
		<View
			accessibilityLiveRegion='polite'
			className='h-10 flex-row items-center gap-2 self-center rounded-full bg-lima px-4'
		>
			<Icon icon={Tick02Icon} size={18} color={colors.bosque} strong />
			<Text className='font-sans-bold text-[14px] text-bosque'>
				Superficie detectada
			</Text>
		</View>
	)
}
