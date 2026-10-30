import { useEffect } from 'react'
import { Text, View } from 'react-native'
import colors from '@/theme/colors'

type ToastType = 'success' | 'error' | 'warning'

type ToastProps = {
	visible: boolean
	message: string
	type?: ToastType
	onHide: () => void
	duration?: number
}

const config = {
	success: {
		text: 'text-esmeralda',
		border: 'border-card-border',
		iconBackground: 'bg-hoja',
		icon: '✓',
	},
	error: {
		text: 'text-error',
		border: 'border-error-border',
		iconBackground: 'bg-error-bg',
		icon: '!',
	},
	warning: {
		text: 'text-aviso-text',
		border: 'border-aviso',
		iconBackground: 'bg-aviso',
		icon: '⚠',
	},
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

	const current = config[type]

	return (
		<View
			className={`absolute left-5 right-5 top-[45px] z-[9999] flex-row items-center rounded-[18px] border bg-blanco px-[14px] py-[13px] ${current.border}`}
			style={{
				elevation: 9999,
				shadowColor: colors.tinta,
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
				className={`mr-3 h-[34px] w-[34px] items-center justify-center rounded-[17px] ${current.iconBackground}`}
			>
				<Text className={`font-sans-x text-[16px] ${current.text}`}>
					{current.icon}
				</Text>
			</View>

			{/* MENSAJE */}
			<Text className='text-body flex-1 text-tinta'>{message}</Text>
		</View>
	)
}
