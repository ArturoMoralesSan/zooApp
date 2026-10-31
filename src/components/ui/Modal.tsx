import type { ReactNode } from 'react'
import { Modal as RNModal, Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useOverlayStatusBar } from '@/hooks/useOverlayStatusBar'

type ModalProps = {
	visible: boolean
	onClose: () => void
	children: ReactNode
	// Closes when the backdrop is tapped (default true).
	dismissible?: boolean
}

// Centered dialog: padding 24 × 20, radius 24, over a Tinta 78% backdrop.
// Drawn edge-to-edge and kept inside the safe area.
export function Modal({
	visible,
	onClose,
	children,
	dismissible = true,
}: ModalProps) {
	const shown = useOverlayStatusBar(visible)
	const insets = useSafeAreaInsets()

	return (
		<RNModal
			visible={shown}
			transparent
			animationType='fade'
			statusBarTranslucent
			navigationBarTranslucent
			onRequestClose={onClose}
		>
			<View
				className='flex-1 items-center justify-center px-5'
				style={{
					paddingTop: insets.top + 20,
					paddingBottom: insets.bottom + 20,
				}}
			>
				<Pressable
					className='absolute inset-0 bg-tinta/[0.78]'
					onPress={dismissible ? onClose : undefined}
					accessible={false}
				/>

				<View className='max-h-full w-full max-w-[380px] rounded-3xl border-1.5 border-card-border bg-blanco px-5 py-6'>
					{children}
				</View>
			</View>
		</RNModal>
	)
}
