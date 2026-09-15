import { useEffect } from 'react'
import { Text, View } from 'react-native'

type ToastType = 'success' | 'error' | 'warning'

type ToastProps = {
	visible: boolean
	message: string
	type?: ToastType
	onHide: () => void
	duration?: number
}

export default function Toast({
	visible,
	message,
	type = 'success',
	onHide,
	duration = 3000,
}: ToastProps) {
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

	const backgroundColor =
		type === 'success' ? '#6EE7B7' : type === 'error' ? '#FCA5A5' : '#FCD34D'

	const textColor =
		type === 'warning' ? '#78350F' : type === 'error' ? '#7F1D1D' : '#064E3B'

	const icon = type === 'success' ? '✓' : type === 'error' ? '!' : '⚠'

	return (
		<View
			style={{
				position: 'absolute',
				top: 45,
				left: 20,
				right: 20,
				zIndex: 9999,
				elevation: 9999,
				flexDirection: 'row',
				alignItems: 'center',
				paddingHorizontal: 16,
				paddingVertical: 14,
				borderRadius: 16,
				backgroundColor,
			}}
		>
			<View
				style={{
					width: 32,
					height: 32,
					borderRadius: 16,
					alignItems: 'center',
					justifyContent: 'center',
					marginRight: 12,
					backgroundColor: 'rgba(255,255,255,0.35)',
				}}
			>
				<Text
					style={{
						fontSize: 16,
						fontWeight: '700',
						color: textColor,
					}}
				>
					{icon}
				</Text>
			</View>

			<Text
				style={{
					flex: 1,
					fontSize: 14,
					fontWeight: '600',
					color: textColor,
				}}
			>
				{message}
			</Text>
		</View>
	)
}
