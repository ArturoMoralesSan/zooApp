import { Icon } from '@/components/ui/Icon'
import colors from '@/theme/colors'
import type { IconSvgElement } from '@hugeicons/react-native'
import { View } from 'react-native'

export type IconBoxSize = 'sm' | 'md' | 'lg'
export type IconBoxTone = 'soft' | 'solid' | 'accent' | 'surface' | 'danger'

type IconBoxProps = {
	icon: IconSvgElement
	// sm 32 (inline, chevrons) · md 40 (list cards) · lg 48 (tiles, modals)
	size?: IconBoxSize
	tone?: IconBoxTone
	className?: string
}

const sizes = {
	sm: { box: 'h-8 w-8', icon: 20 },
	md: { box: 'h-10 w-10', icon: 22 },
	lg: { box: 'h-12 w-12', icon: 24 },
}

const tones = {
	soft: { box: 'bg-hoja', icon: colors.esmeralda },
	solid: { box: 'bg-esmeralda', icon: colors.blanco },
	accent: { box: 'bg-lima', icon: colors.bosque },
	surface: {
		box: 'border-1.5 border-card-border bg-blanco',
		icon: colors.esmeralda,
	},
	danger: { box: 'bg-error-bg', icon: colors.error },
}

// Radius 12 square that holds an icon.
export function IconBox({
	icon,
	size = 'md',
	tone = 'soft',
	className = '',
}: IconBoxProps) {
	return (
		<View
			className={`shrink-0 items-center justify-center rounded-xl ${sizes[size].box} ${tones[tone].box} ${className}`}
		>
			<Icon icon={icon} size={sizes[size].icon} color={tones[tone].icon} />
		</View>
	)
}
