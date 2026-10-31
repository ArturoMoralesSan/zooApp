import { useCallback, useState } from 'react'
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native'

// Whether a scroll view has left its top, for the fixed header's border.
// Pass onScroll with scrollEventThrottle={16}.
export function useScrolled() {
	const [scrolled, setScrolled] = useState(false)

	const onScroll = useCallback(
		(event: NativeSyntheticEvent<NativeScrollEvent>) =>
			setScrolled(event.nativeEvent.contentOffset.y > 0),
		[],
	)

	return { scrolled, onScroll }
}
