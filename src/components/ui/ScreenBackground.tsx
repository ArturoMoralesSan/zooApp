import type { ReactNode } from 'react'
import { type Edge, SafeAreaView } from 'react-native-safe-area-context'

type ScreenBackgroundProps = {
	edges?: Edge[]
	// niebla: the 3D viewer, which blends into a Niebla scene.
	tone?: 'screen' | 'niebla'
	children: ReactNode
}

// Plain Fondo de pantalla (white) for maximum contrast outdoors.
export function ScreenBackground({
	edges = ['top', 'left', 'right'],
	tone = 'screen',
	children,
}: ScreenBackgroundProps) {
	return (
		<SafeAreaView
			className={`flex-1 ${tone === 'niebla' ? 'bg-niebla' : 'bg-screen'}`}
			edges={edges}
		>
			{children}
		</SafeAreaView>
	)
}
