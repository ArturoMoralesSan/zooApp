import { CubeIcon, SmartPhone01Icon } from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react-native'
import { Pressable, View } from 'react-native'

import type { ViewerMode } from '@/components/deck/CardViewerScene'
import { FocusRing, useFocusRing } from '@/components/ui/FocusRing'
import { Icon } from '@/components/ui/Icon'
import colors from '@/theme/colors'

type ViewModeSwitchProps = {
	value: ViewerMode
	onChange: (mode: ViewerMode) => void
	className?: string
}

const OPTIONS: { mode: ViewerMode; icon: IconSvgElement; label: string }[] = [
	{ mode: 'model', icon: CubeIcon, label: 'Ver modelo 3D' },
	{ mode: 'card', icon: SmartPhone01Icon, label: 'Ver tarjeta' },
]

// "Selector de vista" (DS p.7): 3D model or card, in a bordered pill.
export function ViewModeSwitch({
	value,
	onChange,
	className = '',
}: ViewModeSwitchProps) {
	return (
		<View
			accessibilityRole='radiogroup'
			className={`flex-row gap-1 rounded-2xl border-1.5 border-card-border bg-blanco p-1 ${className}`}
		>
			{OPTIONS.map((option) => (
				<ModeOption
					key={option.mode}
					{...option}
					selected={value === option.mode}
					onPress={() => onChange(option.mode)}
				/>
			))}
		</View>
	)
}

type ModeOptionProps = {
	icon: IconSvgElement
	label: string
	selected: boolean
	onPress: () => void
}

function ModeOption({ icon, label, selected, onPress }: ModeOptionProps) {
	const { focused, focusProps } = useFocusRing()

	return (
		<View>
			<Pressable
				onPress={onPress}
				accessibilityRole='radio'
				accessibilityState={{ checked: selected }}
				accessibilityLabel={label}
				{...focusProps}
				className={`h-12 w-12 items-center justify-center rounded-xl active:opacity-80 ${selected ? 'bg-esmeralda' : 'bg-blanco'} ${focused ? 'border-2 border-bosque' : ''}`}
			>
				<Icon
					icon={icon}
					color={selected ? colors.blanco : colors.tinta2}
					strong={selected}
				/>
			</Pressable>

			<FocusRing visible={focused} radiusClassName='rounded-[15px]' />
		</View>
	)
}
