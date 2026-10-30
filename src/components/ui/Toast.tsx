import { useEffect } from 'react'
import { Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export type ToastType = 'success' | 'error' | 'warning'

type ToastProps = {
	visible: boolean
	// Always title plus text; the title defaults per type.
	title?: string
	message: string
	type?: ToastType
	onHide: () => void
	duration?: number
}

const config = {
	success: {
		box: 'border-bosque bg-bosque',
		title: 'text-blanco',
		message: 'text-hoja',
		defaultTitle: 'Listo',
	},
	error: {
		box: 'border-error-border bg-error-bg',
		title: 'text-error',
		message: 'text-tinta',
		defaultTitle: 'No se pudo completar',
	},
	warning: {
		box: 'border-aviso-text/25 bg-aviso',
		title: 'text-aviso-text',
		message: 'text-tinta',
		defaultTitle: 'Atención',
	},
}

// Success on Bosque, error on Fondo error, warning on Aviso. Depth comes from
// the solid fill and border, not a shadow.
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

	const current = config[type]

	return (
		<View
			accessibilityRole='alert'
			accessibilityLiveRegion='polite'
			className={`absolute left-5 right-5 z-[9999] rounded-xl border-1.5 px-4 py-3 ${current.box}`}
			style={{ top: insets.top + 12 }}
		>
			<Text className={`font-sans-bold text-[14px] ${current.title}`}>
				{title ?? current.defaultTitle}
			</Text>

			<Text className={`text-body mt-0.5 ${current.message}`}>{message}</Text>
		</View>
	)
}
