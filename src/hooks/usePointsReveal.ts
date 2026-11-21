import { useEffect, useState } from 'react'
import { AccessibilityInfo, Animated, Easing } from 'react-native'

const COUNT_MS = 700

// Counts the earned points up from 0, then fades in the new level (if any).
// With reduce motion on, both show at once.
export function usePointsReveal(awarded: number, levelName?: string) {
	const [shown, setShown] = useState(0)
	const [counted, setCounted] = useState(awarded === 0)
	const [levelOpacity] = useState(() => new Animated.Value(0))

	useEffect(() => {
		if (awarded === 0) return

		const value = new Animated.Value(0)
		const listener = value.addListener(({ value: current }) =>
			setShown(Math.round(current)),
		)
		let animation: Animated.CompositeAnimation | null = null
		let cancelled = false

		void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
			if (cancelled) return

			if (reduce) {
				setShown(awarded)
				setCounted(true)
				return
			}

			animation = Animated.timing(value, {
				toValue: awarded,
				duration: COUNT_MS,
				easing: Easing.out(Easing.cubic),
				// The listener reads the value on JS, so no native driver.
				useNativeDriver: false,
			})
			animation.start(({ finished }) => {
				if (finished) setCounted(true)
			})
		})

		return () => {
			cancelled = true
			animation?.stop()
			value.removeListener(listener)
		}
	}, [awarded])

	useEffect(() => {
		if (!counted || !levelName) return

		Animated.timing(levelOpacity, {
			toValue: 1,
			duration: 250,
			useNativeDriver: true,
		}).start()
	}, [counted, levelName, levelOpacity])

	return { shown, counted, levelOpacity }
}
