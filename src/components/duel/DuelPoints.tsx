import { Coins02Icon, Crown02Icon } from '@hugeicons/core-free-icons'
import { useEffect, useState } from 'react'
import { AccessibilityInfo, Animated, Easing, Text, View } from 'react-native'

import { Badge } from '@/components/ui/Badge'
import type { DuelPoints as DuelPointsData } from '@/types/cards'

type DuelPointsProps = {
	points: DuelPointsData
}

const COUNT_MS = 700

const formatPoints = (value: number) => value.toLocaleString('es-MX')

// A-22: points from the server for the won card. Counts up, then shows the
// new level, below the card so it never covers it.
export function DuelPoints({ points }: DuelPointsProps) {
	const { awarded, total, level, level_up } = points
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

	const levelName = level_up ? level?.name : undefined

	useEffect(() => {
		if (!counted || !levelName) return

		Animated.timing(levelOpacity, {
			toValue: 1,
			duration: 250,
			useNativeDriver: true,
		}).start()
	}, [counted, levelName, levelOpacity])

	const summary = [
		awarded > 0 ? `Ganaste ${formatPoints(awarded)} puntos.` : null,
		`Total: ${formatPoints(total)} puntos.`,
		levelName ? `Subiste a nivel ${levelName}.` : null,
	]
		.filter(Boolean)
		.join(' ')

	return (
		<View
			accessible
			accessibilityLabel={summary}
			className='items-center gap-2'
		>
			{/* Wrapped: Badge is self-start, the wrapper centers it. */}
			{awarded > 0 && (
				<View>
					<Badge icon={Coins02Icon} label={`+${formatPoints(shown)}`} />
				</View>
			)}

			<Text className='text-meta text-center text-tinta-2'>
				Total: {formatPoints(total)} puntos
			</Text>

			{levelName && counted && (
				<Animated.View style={{ opacity: levelOpacity }}>
					<Badge
						tone='success'
						icon={Crown02Icon}
						label={`¡Subiste a nivel ${levelName}!`}
					/>
				</Animated.View>
			)}
		</View>
	)
}
