import type { ReactNode } from 'react'
import { Modal as RNModal, Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useOverlayStatusBar } from '@/hooks/useOverlayStatusBar'

type BottomSheetProps = {
	visible: boolean
	onClose: () => void
	children: ReactNode
}

// Sheet from the bottom edge: padding 24 × 20, top radius 24, a grab handle
// and a Tinta 78% backdrop. The content stays above the navigation bar.
export function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
	const shown = useOverlayStatusBar(visible)
	const insets = useSafeAreaInsets()

	return (
		<RNModal
			visible={shown}
			transparent
			animationType='slide'
			statusBarTranslucent
			navigationBarTranslucent
			onRequestClose={onClose}
		>
			<View className='flex-1 justify-end' style={{ paddingTop: insets.top }}>
				<Pressable
					className='absolute inset-0 bg-tinta/[0.78]'
					onPress={onClose}
					accessible={false}
				/>

				<View
					className='max-h-[90%] rounded-t-3xl border-1.5 border-b-0 border-card-border bg-blanco px-5 pt-3'
					style={{ paddingBottom: insets.bottom + 24 }}
				>
					<View className='mb-4 h-1 w-10 self-center rounded-full bg-card-border' />

					{children}
				</View>
			</View>
		</RNModal>
	)
}
