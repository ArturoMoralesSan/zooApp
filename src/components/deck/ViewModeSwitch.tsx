import { CubeIcon, SmartPhone01Icon } from '@hugeicons/core-free-icons'

import type { ViewerMode } from '@/components/deck/CardViewerScene'
import { ModeSwitch, type ModeSwitchOption } from '@/components/ui/ModeSwitch'

type ViewModeSwitchProps = {
	value: ViewerMode
	onChange: (mode: ViewerMode) => void
	className?: string
}

const OPTIONS: ModeSwitchOption<ViewerMode>[] = [
	{ value: 'model', icon: CubeIcon, label: 'Ver modelo 3D' },
	{ value: 'card', icon: SmartPhone01Icon, label: 'Ver tarjeta' },
]

// The card view's 3D model or card.
export function ViewModeSwitch({
	value,
	onChange,
	className,
}: ViewModeSwitchProps) {
	return (
		<ModeSwitch
			options={OPTIONS}
			value={value}
			onChange={onChange}
			className={className}
		/>
	)
}
