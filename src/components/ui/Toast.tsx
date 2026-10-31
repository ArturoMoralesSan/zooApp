import { Notice, type NoticeTone } from '@/components/ui/Notice'
import { useEffect } from 'react'
import { Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export type ToastType = NoticeTone

type ToastProps = {
	visible: boolean
	// Always title plus text; the title defaults per type.
	title?: string
	message: string
	type?: ToastType
	onHide: () => void
	// Defaults to a reading time based on the text length.
	duration?: number
}

// ~100ms per character (an unhurried reading pace) on top of 5s to notice
// the toast, kept between 10 and 20 seconds. Tapping closes it earlier.
function readingTime(text: string) {
	return Math.min(20000, Math.max(10000, 5000 + text.length * 100))
}

const defaultTitles = {
	success: 'Listo',
	error: 'No se pudo completar',
	warning: 'Atención',
}

// Floating Notice below the status bar that hides itself after `duration`
// (long enough to read the whole message) or when tapped.
export default function Toast({
	visible,
	title,
	message,
	type = 'success',
	onHide,
	duration,
}: ToastProps) {
	const insets = useSafeAreaInsets()
	const shownTitle = title ?? defaultTitles[type]
	const timeout = duration ?? readingTime(`${shownTitle} ${message}`)

	useEffect(() => {
		if (!visible) {
			return
		}

		const timer = setTimeout(() => {
			onHide()
		}, timeout)

		return () => clearTimeout(timer)
	}, [visible, timeout, onHide])

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
			<Pressable onPress={onHide} accessibilityHint='Toca para cerrar el aviso'>
				<Notice tone={type} title={shownTitle} message={message} />
			</Pressable>
		</View>
	)
}
