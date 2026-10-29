import type { ReactNode } from 'react'
import { ImageBackground } from 'react-native'
import { type Edge, SafeAreaView } from 'react-native-safe-area-context'

type ScreenBackgroundProps = {
	edges?: Edge[]
	patternClassName?: string
	withBackground?: boolean
	withSafeAreaBackground?: boolean
	children: ReactNode
}

export function ScreenBackground({
	edges = ['top', 'left', 'right'],
	patternClassName = 'opacity-[0.025]',
	withBackground = true,
	withSafeAreaBackground = true,
	children,
}: ScreenBackgroundProps) {
	return (
		<SafeAreaView
			className={withSafeAreaBackground ? 'flex-1 bg-blanco' : 'flex-1'}
			edges={edges}
		>
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				resizeMode='repeat'
				imageClassName={patternClassName}
				className={withBackground ? 'flex-1 bg-blanco' : 'flex-1'}
			>
				{children}
			</ImageBackground>
		</SafeAreaView>
	)
}
