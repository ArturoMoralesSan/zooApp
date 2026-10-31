import type { ReactNode } from 'react'
import { type Edge, SafeAreaView } from 'react-native-safe-area-context'

type ScreenBackgroundProps = {
	edges?: Edge[]
	children: ReactNode
}

// Plain Fondo de pantalla (white) for maximum contrast outdoors.
export function ScreenBackground({
	edges = ['top', 'left', 'right'],
	children,
}: ScreenBackgroundProps) {
	return (
		<SafeAreaView className='flex-1 bg-screen' edges={edges}>
			{children}
		</SafeAreaView>
	)
}
