import { Text, View } from 'react-native'

export type BadgeTone = 'success' | 'pending' | 'error' | 'neutral'

type BadgeProps = {
	// Always text: a status is never shown by color alone.
	label: string
	tone?: BadgeTone
	className?: string
}

const tones = {
	success: {
		box: 'border-lima bg-lima',
		text: 'text-bosque',
		dot: 'bg-bosque',
	},
	pending: {
		box: 'border-aviso-text/25 bg-aviso',
		text: 'text-aviso-text',
		dot: 'bg-aviso-text',
	},
	error: {
		box: 'border-error-border bg-error-bg',
		text: 'text-error',
		dot: 'bg-error',
	},
	neutral: {
		box: 'border-card-border bg-niebla',
		text: 'text-tinta-2',
		dot: 'bg-tinta-2',
	},
}

// 24px, full radius, with a leading dot so the tone also reads as a shape.
export function Badge({ label, tone = 'neutral', className = '' }: BadgeProps) {
	const style = tones[tone]

	return (
		<View
			className={`h-6 shrink-0 flex-row items-center gap-1.5 self-start rounded-full border px-2.5 ${style.box} ${className}`}
		>
			<View className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
			<Text className={`font-sans-bold text-[12px] ${style.text}`}>
				{label}
			</Text>
		</View>
	)
}
