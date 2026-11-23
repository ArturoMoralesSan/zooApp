import {
	BatteryFullIcon,
	BatteryLowIcon,
	DashboardSpeed01Icon,
} from '@hugeicons/core-free-icons'
import { Text, View, type LayoutChangeEvent } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { IconBox } from '@/components/ui/IconBox'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { getFooterBottomPadding } from '@/theme/layout'
import type { GraphicsLoad } from '@/utils/settings'

type GraphicsLoadFooterProps = {
	load: GraphicsLoad
	// Its height, so the screen can scroll its last item above it.
	onLayout?: (event: LayoutChangeEvent) => void
}

const LEVELS = {
	low: {
		label: 'Bajo',
		hint: 'Ligero: ideal si tu teléfono se calienta.',
		icon: BatteryFullIcon,
	},
	medium: {
		label: 'Medio',
		hint: 'Un buen equilibrio para la mayoría de los teléfonos.',
		icon: DashboardSpeed01Icon,
	},
	high: {
		label: 'Alto',
		hint: 'Se ve mejor, pero gasta más batería.',
		icon: BatteryLowIcon,
	},
}

// Pinned under "Calidad gráfica": how much the chosen effects ask of the
// phone, in view while the user flips the switches.
export function GraphicsLoadFooter({
	load,
	onLayout,
}: GraphicsLoadFooterProps) {
	const insets = useSafeAreaInsets()
	const level = LEVELS[load.level]

	return (
		<View
			onLayout={onLayout}
			accessibilityLiveRegion='polite'
			className='absolute bottom-0 left-0 right-0 border-t-1.5 border-t-card-border bg-blanco px-5 pt-4'
			style={{ paddingBottom: getFooterBottomPadding(insets.bottom) }}
		>
			<View className='flex-row items-center gap-3'>
				<IconBox icon={level.icon} tone='accent' />
				<View style={{ flex: 1, minWidth: 0 }}>
					<Text className='text-overline'>Consumo estimado</Text>
					<Text className='text-h3 text-tinta'>{level.label}</Text>
				</View>
			</View>
			<ProgressBar
				progress={load.share}
				className='mt-3'
				accessibilityLabel={`Consumo estimado: ${level.label}`}
			/>
			<Text className='text-meta mt-2'>{level.hint}</Text>
		</View>
	)
}
