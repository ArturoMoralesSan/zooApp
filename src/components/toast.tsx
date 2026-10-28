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

const config = {
	success: {
		text: 'text-[#087A5A]',
		border: 'border-[#B8DCCA]',
		iconBackground: 'bg-[#DCEFE5]',
		icon: '✓',
	},
	error: {
		text: 'text-[#C83B3B]',
		border: 'border-[#FFE3E1]',
		iconBackground: 'bg-[#FFF1F0]',
		icon: '!',
	},
	warning: {
		text: 'text-[#D97706]',
		border: 'border-[#FDE7B2]',
		iconBackground: 'bg-[#FFF7E6]',
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
				className={`mr-3 h-[34px] w-[34px] items-center justify-center rounded-[17px] ${current.iconBackground}`}
			>
				<Text className={`text-[16px] font-extrabold ${current.text}`}>
					{current.icon}
				</Text>
			</View>

			{/* MENSAJE */}
			<Text className='flex-1 text-[14px] font-semibold leading-5 text-[#123C32]'>
				{message}
			</Text>
		</View>
	)
}
