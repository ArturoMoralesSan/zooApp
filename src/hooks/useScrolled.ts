import { useCallback, useRef, useState } from 'react'
import type {
	LayoutChangeEvent,
	NativeScrollEvent,
	NativeSyntheticEvent,
} from 'react-native'

// Scroll state for the fixed TopBar:
// - scrolled: the content has left its top (bar shows its border).
// - pastTitle: the large title (measured with onTitleLayout) or a fixed
//   threshold has scrolled under the bar (bar shows its compact title).
// Pass onScroll with scrollEventThrottle={16}, or as an Animated.event
// listener.
export function useScrolled(threshold?: number) {
	const titleBottom = useRef(Number.POSITIVE_INFINITY)
	const [scrolled, setScrolled] = useState(false)
	const [pastTitle, setPastTitle] = useState(false)

	const onScroll = useCallback(
		(event: NativeSyntheticEvent<NativeScrollEvent>) => {
			const y = event.nativeEvent.contentOffset.y

			setScrolled(y > 0)
			setPastTitle(y > (threshold ?? titleBottom.current))
		},
		[threshold],
	)

	const onTitleLayout = useCallback((event: LayoutChangeEvent) => {
		const { y, height } = event.nativeEvent.layout
		titleBottom.current = y + height
	}, [])

	return { scrolled, pastTitle, onScroll, onTitleLayout }
}
