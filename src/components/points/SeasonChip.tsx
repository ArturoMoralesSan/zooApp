import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { Pressable, Text, View } from 'react-native'

import { FocusRing, useFocusRing } from '@/components/ui/FocusRing'
import { Icon } from '@/components/ui/Icon'
import type { SeasonColor } from '@/types/points'
import { seasonIcon, seasonTones } from '@/utils/pointSeason'

type SeasonChipProps = {
	title: string
	icon: string | null
	color: SeasonColor | null
	// accent: strong chip on light surfaces · soft: on dark ones (LevelCard),
	// where an Esmeralda accent would disappear.
	look?: 'accent' | 'soft'
	// Without onPress it's a static tag.
	onPress?: () => void
	className?: string
}

// 32px season pill (Chip anatomy) in the season's own tone pair.
export function SeasonChip({
	title,
	icon,
	color,
	look = 'accent',
	onPress,
	className = '',
}: SeasonChipProps) {
	const { focused, focusProps } = useFocusRing()
	const tones = seasonTones(color)
	const bg = look === 'accent' ? tones.accent : tones.soft
	const fg = look === 'accent' ? tones.onAccent : tones.text

	const content = (
		<>
			<Icon icon={seasonIcon(icon)} size={18} color={fg} strong />
			<Text
				className='shrink font-sans-bold text-[13px]'
				style={{ color: fg }}
				numberOfLines={1}
			>
				{title}
			</Text>
			{onPress && <Icon icon={ArrowRight01Icon} size={16} color={fg} strong />}
		</>
	)

	const chipClassName = `h-8 max-w-full flex-row items-center gap-1.5 rounded-full px-3 ${focused ? 'border-2 border-bosque' : ''}`

	if (!onPress) {
		return (
			<View
				className={`self-start ${chipClassName} ${className}`}
				style={{ backgroundColor: bg }}
			>
				{content}
			</View>
		)
	}

	return (
		<View className={`max-w-full self-start ${className}`}>
			<Pressable
				onPress={onPress}
				// 32px chip, 40px touch target.
				hitSlop={4}
				accessibilityRole='button'
				accessibilityLabel={`Temporada de puntos: ${title}. Ver cambios`}
				{...focusProps}
				className={`${chipClassName} active:opacity-80`}
				style={{ backgroundColor: bg }}
			>
				{content}
			</Pressable>

			<FocusRing visible={focused} radiusClassName='rounded-full' />
		</View>
	)
}
