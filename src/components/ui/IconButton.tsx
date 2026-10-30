import { FocusRing, useFocusRing } from '@/components/ui/FocusRing'
import { Icon } from '@/components/ui/Icon'
import colors from '@/theme/colors'
import type { IconSvgElement } from '@hugeicons/react-native'
import { Pressable, View } from 'react-native'

type IconButtonProps = {
	icon: IconSvgElement
	onPress: () => void
	// Required: the icon alone carries no text.
	accessibilityLabel: string
	// soft: Niebla · outline: white with Borde de input · solid: Esmeralda
	variant?: 'soft' | 'outline' | 'solid'
	className?: string
}

const variants = {
	soft: {
		box: 'border-1.5 border-card-border bg-niebla active:bg-hoja',
		focusedBg: 'bg-niebla',
		icon: colors.bosque,
	},
	outline: {
		box: 'border-1.5 border-input-border bg-blanco active:bg-hoja',
		focusedBg: 'bg-blanco',
		icon: colors.bosque,
	},
	solid: {
		box: 'border-1.5 border-esmeralda bg-esmeralda active:bg-bosque',
		focusedBg: 'bg-esmeralda',
		icon: colors.blanco,
	},
}

// 40 × 40 icon-only button, radius 12.
export function IconButton({
	icon,
	onPress,
	accessibilityLabel,
	variant = 'soft',
	className = '',
}: IconButtonProps) {
	const { focused, focusProps } = useFocusRing()
	const style = variants[variant]

	return (
		<View className={`self-start ${className}`}>
			<Pressable
				onPress={onPress}
				hitSlop={4}
				accessibilityRole='button'
				accessibilityLabel={accessibilityLabel}
				{...focusProps}
				className={`h-10 w-10 items-center justify-center rounded-xl ${focused ? `border-2 border-bosque ${style.focusedBg}` : style.box}`}
			>
				<Icon icon={icon} color={style.icon} strong />
			</Pressable>

			<FocusRing visible={focused} />
		</View>
	)
}
