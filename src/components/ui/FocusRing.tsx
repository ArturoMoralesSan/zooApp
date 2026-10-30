import { useState } from 'react'
import { View } from 'react-native'

// React Native has no `outline`: the 3px Lima ring is an absolute view drawn
// just outside the control, so showing it never shifts the layout. The
// control itself switches to its 2px Bosque border while focused.
type FocusRingProps = {
	visible: boolean
	// Control radius + 3px, so the ring follows the control's corners.
	radiusClassName?: string
}

export function FocusRing({
	visible,
	radiusClassName = 'rounded-[15px]',
}: FocusRingProps) {
	if (!visible) {
		return null
	}

	return (
		<View
			pointerEvents='none'
			className={`absolute -bottom-[3px] -left-[3px] -right-[3px] -top-[3px] border-[3px] border-lima ${radiusClassName}`}
		/>
	)
}

export function useFocusRing() {
	const [focused, setFocused] = useState(false)

	return {
		focused,
		focusProps: {
			onFocus: () => setFocused(true),
			onBlur: () => setFocused(false),
		},
	}
}
