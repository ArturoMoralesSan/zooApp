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

	const config = {
		success: {
			color: '#087A5A',
			background: '#FFFFFF',
			border: '#B8DCCA',
			icon: '✓',
		},
		error: {
			color: '#C83B3B',
			background: '#FFFFFF',
			border: '#FFE3E1',
			icon: '!',
		},
		warning: {
			color: '#D97706',
			background: '#FFFFFF',
			border: '#FDE7B2',
			icon: '⚠',
		},
	}

	const current = config[type]

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

				paddingHorizontal: 14,
				paddingVertical: 13,

				borderRadius: 18,
				backgroundColor: current.background,
				borderWidth: 1,
				borderColor: current.border,

				shadowColor: '#123C32',
				shadowOffset: {
					width: 0,
					height: 4,
				},
				shadowOpacity: 0.12,
				shadowRadius: 10,
			}}
		>
			{/* ICONO */}
			<View
				style={{
					width: 34,
					height: 34,
					borderRadius: 17,
					alignItems: 'center',
					justifyContent: 'center',
					marginRight: 12,
					backgroundColor:
						type === 'success'
							? '#DCEFE5'
							: type === 'error'
								? '#FFF1F0'
								: '#FFF7E6',
				}}
			>
				<Text
					style={{
						fontSize: 16,
						fontWeight: '800',
						color: current.color,
					}}
				>
					{current.icon}
				</Text>
			</View>

			{/* MENSAJE */}
			<Text
				style={{
					flex: 1,
					fontSize: 14,
					fontWeight: '600',
					lineHeight: 20,
					color: '#123C32',
				}}
			>
				{message}
			</Text>
		</View>
	)
}
