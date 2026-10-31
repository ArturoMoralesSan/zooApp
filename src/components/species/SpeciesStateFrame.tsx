import BackButton from '@/components/ui/BackButton'
import type { ReactNode } from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type SpeciesStateFrameProps = {
	children: ReactNode
	onBack: () => void
}

// White background and back button around the species detail's loading
// and error states (QueryView wrapper).
export function SpeciesStateFrame({
	children,
	onBack,
}: SpeciesStateFrameProps) {
	const insets = useSafeAreaInsets()

	return (
		<View
			className='flex-1 bg-screen px-5'
			style={{ paddingTop: insets.top + 8 }}
		>
			<BackButton onPress={onBack} position='relative' />

			<View className='mt-6'>{children}</View>
		</View>
	)
}
