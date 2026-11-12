import { Cancel01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { Pressable, Text, View } from 'react-native'

import { FocusRing, useFocusRing } from '@/components/ui/FocusRing'
import { Icon } from '@/components/ui/Icon'
import colors from '@/theme/colors'

export type DuelAnswerState = 'idle' | 'selected' | 'correct' | 'incorrect'

type DuelAnswerProps = {
	label: string
	state?: DuelAnswerState
	// Without onPress the answer is read-only (results, review).
	onPress?: () => void
	className?: string
}

const looks = {
	idle: { box: 'border-1.5 border-input-border bg-blanco', text: 'text-tinta' },
	selected: { box: 'border-2 border-esmeralda bg-hoja', text: 'text-bosque' },
	correct: { box: 'border-2 border-esmeralda bg-hoja', text: 'text-bosque' },
	incorrect: { box: 'border-2 border-error bg-error-bg', text: 'text-error' },
}

const stateLabels = {
	idle: '',
	selected: '',
	correct: ', correcta',
	incorrect: ', incorrecta',
}

// Duel answer (DS p.7): normal, correct and incorrect, always with an icon
// so the state never relies on color alone. Selected shows a filled radio.
export function DuelAnswer({
	label,
	state = 'idle',
	onPress,
	className = '',
}: DuelAnswerProps) {
	const { focused, focusProps } = useFocusRing()
	const look = looks[state]

	const trailing =
		state === 'correct' ? (
			<Icon icon={Tick02Icon} size={20} color={colors.esmeralda} strong />
		) : state === 'incorrect' ? (
			<Icon icon={Cancel01Icon} size={20} color={colors.error} strong />
		) : onPress ? (
			<View
				className={`h-5 w-5 items-center justify-center rounded-full border-2 ${state === 'selected' ? 'border-esmeralda' : 'border-input-border'}`}
			>
				{state === 'selected' && (
					<View className='h-2.5 w-2.5 rounded-full bg-esmeralda' />
				)}
			</View>
		) : null

	return (
		<View className={className}>
			<Pressable
				onPress={onPress}
				disabled={!onPress}
				accessibilityRole={onPress ? 'radio' : 'text'}
				accessibilityState={
					onPress ? { checked: state === 'selected' } : undefined
				}
				accessibilityLabel={`${label}${stateLabels[state]}`}
				{...focusProps}
				className={`min-h-[52px] flex-row items-center gap-3 rounded-xl px-4 py-3 active:opacity-80 ${focused ? 'border-2 border-bosque bg-blanco' : look.box}`}
			>
				<Text
					className={`min-w-0 flex-1 font-sans-semibold text-[14px] leading-[1.4] ${look.text}`}
				>
					{label}
				</Text>

				{trailing}
			</Pressable>

			<FocusRing visible={focused} radiusClassName='rounded-[15px]' />
		</View>
	)
}
