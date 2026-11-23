import { Rotate360Icon, VrGlassesIcon } from '@hugeicons/core-free-icons'

import { ModeSwitch, type ModeSwitchOption } from '@/components/ui/ModeSwitch'
import type { AnimalView } from '@/types/settings'

type AnimalViewSwitchProps = {
	value: AnimalView
	onChange: (view: AnimalView) => void
	// While a view closes or opens.
	disabled?: boolean
	className?: string
}

const OPTIONS: ModeSwitchOption<AnimalView>[] = [
	{ value: 'ar', icon: VrGlassesIcon, label: 'AR' },
	{ value: '360', icon: Rotate360Icon, label: '360°' },
]

// AR or the 360° view, on the bottom edge under the controls (like a
// camera's mode selector). Only on phones with ARCore: without it there's
// no choice.
export function AnimalViewSwitch({
	value,
	onChange,
	disabled,
	className,
}: AnimalViewSwitchProps) {
	return (
		<ModeSwitch
			options={OPTIONS}
			value={value}
			onChange={onChange}
			showLabels
			disabled={disabled}
			className={className}
		/>
	)
}
