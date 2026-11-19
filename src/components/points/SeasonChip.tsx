import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { Pressable, Text, View } from 'react-native'

import { FocusRing, useFocusRing } from '@/components/ui/FocusRing'
import { Icon } from '@/components/ui/Icon'
import type { SeasonColor } from '@/types/points'
import { asSentence, seasonIcon, seasonTones } from '@/utils/pointSeason'

type SeasonChipProps = {
	title: string
	icon: string | null
	color: SeasonColor | null
	onPress: () => void
	className?: string
}

// 32px season pill (Chip anatomy) on the season's `soft` tone, so it stays
// visible on dark surfaces like the LevelCard, where an Esmeralda accent
// would disappear.
export function SeasonChip({
	title,
	icon,
	color,
	onPress,
	className = '',
}: SeasonChipProps) {
	const { focused, focusProps } = useFocusRing()
	const tones = seasonTones(color)

	return (
		<View className={`max-w-full self-start ${className}`}>
			<Pressable
				onPress={onPress}
				// 32px chip, 40px touch target.
				hitSlop={4}
				accessibilityRole='button'
				accessibilityLabel={`Temporada de puntos: ${asSentence(title)} Ver cambios`}
				{...focusProps}
				className={`h-8 max-w-full flex-row items-center gap-1.5 rounded-full px-3 active:opacity-80 ${focused ? 'border-2 border-bosque' : ''}`}
				style={{ backgroundColor: tones.soft }}
			>
				<Icon icon={seasonIcon(icon)} size={18} color={tones.text} strong />
				<Text
					className='shrink font-sans-bold text-[13px]'
					style={{ color: tones.text }}
					numberOfLines={1}
				>
					{title}
				</Text>
				<Icon icon={ArrowRight01Icon} size={16} color={tones.text} strong />
			</Pressable>

			<FocusRing visible={focused} radiusClassName='rounded-full' />
		</View>
	)
}
