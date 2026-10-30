import { Notice, type NoticeTone } from '@/components/ui/Notice'
import { useEffect } from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export type ToastType = NoticeTone

type ToastProps = {
	visible: boolean
	// Always title plus text; the title defaults per type.
	title?: string
	message: string
	type?: ToastType
	onHide: () => void
	duration?: number
}

const defaultTitles = {
	success: 'Listo',
	error: 'No se pudo completar',
	warning: 'Atención',
}

// Floating Notice below the status bar that hides itself after `duration`.
export default function Toast({
	visible,
	title,
	message,
	type = 'success',
	onHide,
	duration = 3000,
}: ToastProps) {
	const insets = useSafeAreaInsets()

	useEffect(() => {
		if (!visible) {
			return
		}

		const timer = setTimeout(() => {
			onHide()
		}, duration)

		return () => clearTimeout(timer)
	}, [visible, duration, onHide])

	if (!visible) {
		return null
	}

	return (
		<View
			accessibilityRole='alert'
			accessibilityLiveRegion='polite'
			className='absolute left-5 right-5 z-[9999]'
			style={{ top: insets.top + 12 }}
		>
			<Notice
				tone={type}
				title={title ?? defaultTitles[type]}
				message={message}
			/>
		</View>
	)
}
