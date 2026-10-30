import type { ReactNode } from 'react'
import { View } from 'react-native'

// White form card of the auth screens: padding 32 × 24, radius 24.
export function AuthCard({ children }: { children: ReactNode }) {
	return (
		<View className='mt-5 rounded-3xl border-1.5 border-card-border bg-blanco px-6 py-8'>
			{children}
		</View>
	)
}
