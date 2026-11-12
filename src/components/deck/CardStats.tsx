import {
	BodyPartMuscleIcon,
	Brain02Icon,
	FlashIcon,
} from '@hugeicons/core-free-icons'
import { Text, View } from 'react-native'

import { Chip } from '@/components/ui/Chip'
import { Icon } from '@/components/ui/Icon'
import colors from '@/theme/colors'
import type { CardStats as Stats } from '@/types/cards'

type CardStatsProps = {
	// Unowned tiles show the 0 · 0 · 0 placeholder.
	stats?: Stats
	// inline: small icon + number (tiles) · pill: 32px chips (duel screens).
	variant?: 'inline' | 'pill'
	className?: string
}

const STATS = [
	{ key: 'astucia', label: 'Astucia', icon: Brain02Icon },
	{ key: 'rapidez', label: 'Rapidez', icon: FlashIcon },
	{ key: 'fuerza', label: 'Fuerza', icon: BodyPartMuscleIcon },
] as const

// Astucia, rapidez and fuerza; the icon always goes with the number.
export function CardStats({
	stats,
	variant = 'inline',
	className = '',
}: CardStatsProps) {
	const value = (key: keyof Stats) => stats?.[key] ?? 0
	const label = STATS.map((stat) => `${stat.label} ${value(stat.key)}`).join(
		', ',
	)

	return (
		<View
			accessible
			accessibilityLabel={label}
			className={`flex-row flex-wrap items-center ${variant === 'pill' ? 'gap-2' : 'gap-x-2.5 gap-y-1'} ${className}`}
		>
			{STATS.map((stat) =>
				variant === 'pill' ? (
					<Chip
						key={stat.key}
						look='soft'
						icon={stat.icon}
						label={String(value(stat.key))}
					/>
				) : (
					<View key={stat.key} className='flex-row items-center gap-1'>
						<Icon icon={stat.icon} size={14} color={colors.tinta2} />
						<Text className='font-sans-bold text-[12px] text-tinta'>
							{value(stat.key)}
						</Text>
					</View>
				),
			)}
		</View>
	)
}
