import { FocusRing, useFocusRing } from '@/components/ui/FocusRing'
import { Icon } from '@/components/ui/Icon'
import colors from '@/theme/colors'
import type { IconSvgElement } from '@hugeicons/react-native'
import { Pressable, Text, View } from 'react-native'

type ChipProps = {
	label: string
	icon?: IconSvgElement
	// Filters: selected is solid Esmeralda, unselected uses `look`.
	selected?: boolean
	// outline: white with a 1.5px border · soft: Niebla (tags, header pills)
	// · hoja: light green tag.
	look?: 'outline' | 'soft' | 'hoja'
	// Without onPress the chip is a static tag.
	onPress?: () => void
	accessibilityLabel?: string
	className?: string
}

const looks = {
	outline: {
		bg: 'bg-blanco',
		border: 'border-input-border',
		text: 'text-bosque',
	},
	soft: { bg: 'bg-niebla', border: 'border-card-border', text: 'text-tinta' },
	hoja: { bg: 'bg-hoja', border: 'border-hoja', text: 'text-bosque' },
}

const selectedLook = {
	bg: 'bg-esmeralda',
	border: 'border-esmeralda',
	text: 'text-blanco',
}

// 32px, full radius.
export function Chip({
	label,
	icon,
	selected = false,
	look = 'outline',
	onPress,
	accessibilityLabel,
	className = '',
}: ChipProps) {
	const { focused, focusProps } = useFocusRing()
	const style = selected ? selectedLook : looks[look]
	const border = focused
		? 'border-2 border-bosque'
		: `border-1.5 ${style.border}`

	const content = (
		<>
			{icon && (
				<Icon
					icon={icon}
					size={20}
					color={selected ? colors.blanco : colors.esmeralda}
				/>
			)}
			<Text className={`font-sans-bold text-[13px] ${style.text}`}>
				{label}
			</Text>
		</>
	)

	const chipClassName = `h-8 flex-row items-center justify-center gap-1.5 rounded-full px-3.5 ${style.bg} ${border}`

	if (!onPress) {
		return (
			<View
				accessibilityLabel={accessibilityLabel}
				className={`self-start ${chipClassName} ${className}`}
			>
				{content}
			</View>
		)
	}

	return (
		<View className={`self-start ${className}`}>
			<Pressable
				onPress={onPress}
				// 32px chip, 40px touch target.
				hitSlop={4}
				accessibilityRole='button'
				accessibilityLabel={accessibilityLabel ?? label}
				accessibilityState={{ selected }}
				{...focusProps}
				className={`${chipClassName} active:opacity-80`}
			>
				{content}
			</Pressable>

			<FocusRing visible={focused} radiusClassName='rounded-full' />
		</View>
	)
}
