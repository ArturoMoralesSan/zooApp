import BackButton from '@/components/ui/BackButton'
import type { ReactNode } from 'react'
import { ImageBackground, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type SpeciesStateFrameProps = {
	children: ReactNode
	onBack: () => void
}

// Pattern background and back button around the species detail's loading
// and error states (QueryView wrapper).
export function SpeciesStateFrame({
	children,
	onBack,
}: SpeciesStateFrameProps) {
	const insets = useSafeAreaInsets()

	return (
		<ImageBackground
			source={require('@/assets/images/zoo-pattern.png')}
			className='flex-1 bg-blanco px-5'
			style={{ paddingTop: insets.top + 8 }}
			resizeMode='repeat'
			imageClassName='opacity-90'
		>
			<BackButton onPress={onBack} position='relative' />

			<View className='mt-6'>{children}</View>
		</ImageBackground>
	)
}
