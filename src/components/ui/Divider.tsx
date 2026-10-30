import { View } from 'react-native'

type DividerProps = {
	// Vertical spacing around the line; 12px each side by default.
	className?: string
}

// 1px Borde de card line between rows inside a card.
export function Divider({ className = 'my-3' }: DividerProps) {
	return <View className={`h-px bg-card-border ${className}`} />
}
