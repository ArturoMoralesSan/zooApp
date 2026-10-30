import { Icon } from '@/components/ui/Icon'
import colors from '@/theme/colors'
import { Alert02Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { Text, View } from 'react-native'

export type NoticeTone = 'success' | 'error' | 'warning'

type NoticeProps = {
	tone: NoticeTone
	title: string
	message?: string
	className?: string
}

const tones = {
	success: {
		box: 'border-bosque bg-bosque',
		iconBox: 'bg-lima',
		icon: Tick02Icon,
		iconColor: colors.bosque,
		title: 'text-blanco',
		message: 'text-hoja',
	},
	error: {
		box: 'border-error-border bg-error-bg',
		iconBox: 'bg-error',
		icon: Alert02Icon,
		iconColor: colors.blanco,
		title: 'text-error',
		message: 'text-error',
	},
	warning: {
		box: 'border-aviso-text/25 bg-aviso',
		iconBox: 'bg-aviso-text',
		icon: Alert02Icon,
		iconColor: colors.aviso,
		title: 'text-aviso-text',
		message: 'text-aviso-text',
	},
}

// Status message with icon, title and text: success on Bosque, error on
// Fondo error, warning on Aviso. Inline in forms, floating in Toast.
export function Notice({ tone, title, message, className = '' }: NoticeProps) {
	const style = tones[tone]

	return (
		<View
			className={`flex-row items-start gap-3 rounded-xl border-1.5 px-4 py-3 ${style.box} ${className}`}
		>
			<View
				className={`h-8 w-8 items-center justify-center rounded-lg ${style.iconBox}`}
			>
				<Icon icon={style.icon} size={20} color={style.iconColor} strong />
			</View>

			<View className='min-w-0 flex-1 justify-center'>
				<Text className={`font-sans-bold text-[14px] ${style.title}`}>
					{title}
				</Text>

				{message && (
					<Text className={`text-meta mt-0.5 ${style.message}`}>{message}</Text>
				)}
			</View>
		</View>
	)
}
