import { FocusRing, useFocusRing } from '@/components/ui/FocusRing'
import type { ReactNode } from 'react'
import { Pressable, View } from 'react-native'

export type CardTone = 'default' | 'dark' | 'hoja' | 'surface'

type CardProps = {
	children: ReactNode
	tone?: CardTone
	// Padding 16 by default; 'none' for cards that start with an image.
	padding?: 'none' | 'md'
	onPress?: () => void
	accessibilityLabel?: string
	// Spacing and layout around the card, never its look.
	className?: string
}

const tones = {
	default: { bg: 'bg-niebla', border: 'border-card-border' },
	dark: { bg: 'bg-bosque', border: 'border-bosque' },
	hoja: { bg: 'bg-hoja', border: 'border-card-border' },
	surface: { bg: 'bg-blanco', border: 'border-card-border' },
}

const pressedTones = {
	default: 'active:bg-hoja',
	dark: 'active:bg-tinta',
	hoja: 'active:bg-card-border',
	surface: 'active:bg-niebla',
}

// Niebla card with a 1.5px Borde de card border and radius 16. Depth comes
// from the border, never from a shadow.
export function Card({
	children,
	tone = 'default',
	padding = 'md',
	onPress,
	accessibilityLabel,
	className = '',
}: CardProps) {
	const { focused, focusProps } = useFocusRing()

	const cardClassName = `overflow-hidden rounded-2xl ${padding === 'md' ? 'p-4' : ''} ${tones[tone].bg}`

	if (onPress) {
		return (
			<View className={className}>
				<Pressable
					onPress={onPress}
					accessibilityRole='button'
					accessibilityLabel={accessibilityLabel}
					{...focusProps}
					className={`grow ${cardClassName} ${pressedTones[tone]} ${focused ? 'border-2 border-bosque' : `border-1.5 ${tones[tone].border}`}`}
				>
					{children}
				</Pressable>

				<FocusRing visible={focused} radiusClassName='rounded-[19px]' />
			</View>
		)
	}

	return (
		<View
			className={`${cardClassName} border-1.5 ${tones[tone].border} ${className}`}
		>
			{children}
		</View>
	)
}
