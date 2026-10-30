import colors from '@/theme/colors'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react-native'

type IconProps = {
	icon: IconSvgElement
	// App icons are 20–24px.
	size?: number
	color?: string
	// 2.4 stroke for small icons on solid backgrounds (buttons, badges).
	strong?: boolean
}

// Hugeicons with the App's defaults: 22px, stroke 2.2.
export function Icon({
	icon,
	size = 22,
	color = colors.esmeralda,
	strong = false,
}: IconProps) {
	return (
		<HugeiconsIcon
			icon={icon}
			size={size}
			color={color}
			strokeWidth={strong ? 2.4 : 2.2}
		/>
	)
}
