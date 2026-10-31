import type { ReactNode } from 'react'
import { View } from 'react-native'

type QrFrameProps = {
	children: ReactNode
	className?: string
}

// White frame around a QR code: 1.5 Borde de input, radius 16, padding 12.
export function QrFrame({ children, className = '' }: QrFrameProps) {
	return (
		<View
			className={`items-center justify-center self-center rounded-2xl border-1.5 border-input-border bg-blanco p-3 ${className}`}
		>
			{children}
		</View>
	)
}
