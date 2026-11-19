import { ArrowDown02Icon, ArrowUp02Icon } from '@hugeicons/core-free-icons'
import { Text, View } from 'react-native'

import { Badge } from '@/components/ui/Badge'
import { formatSeasonPoints, pointChange } from '@/utils/pointSeason'

type SeasonChangeRowProps = {
	label: string
	basePoints: number
	points: number
}

const changes = {
	up: { label: 'Sube', tone: 'success', icon: ArrowUp02Icon },
	down: { label: 'Baja', tone: 'pending', icon: ArrowDown02Icon },
} as const

// One rule the season changes: usual points struck through, season points,
// and the direction as a word + arrow (never color alone).
export function SeasonChangeRow({
	label,
	basePoints,
	points,
}: SeasonChangeRowProps) {
	const change = pointChange(basePoints, points)
	const badge = change === 'same' ? null : changes[change]
	const base = formatSeasonPoints(basePoints)
	const now = formatSeasonPoints(points)

	return (
		<View
			accessible
			accessibilityLabel={`${label}: ${now}, normalmente ${base}`}
			className='flex-row items-center gap-3'
		>
			<View style={{ flex: 1, minWidth: 0 }}>
				<Text className='text-h3 text-tinta'>{label}</Text>
				<View className='mt-1 flex-row flex-wrap items-baseline gap-x-2'>
					<Text className='text-meta text-apagado line-through'>{base}</Text>
					<Text className='font-sans-bold text-[16px] text-bosque'>{now}</Text>
				</View>
			</View>

			{badge && (
				<Badge label={badge.label} tone={badge.tone} icon={badge.icon} />
			)}
		</View>
	)
}
