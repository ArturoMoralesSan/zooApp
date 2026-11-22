import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
	Animated,
	Dimensions,
	Easing,
	PanResponder,
	Modal as RNModal,
	Pressable,
	View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useOverlayStatusBar } from '@/hooks/useOverlayStatusBar'

type BottomSheetProps = {
	visible: boolean
	onClose: () => void
	children: ReactNode
}

const OPEN_MS = 260
const CLOSE_MS = 200
// A drag past this share of the sheet's height, or a flick, closes it.
const CLOSE_SHARE = 0.3
const CLOSE_VELOCITY = 0.8

// Sheet from the bottom edge: padding 24 × 20, top radius 24, a grab handle
// and a Tinta 78% backdrop. The content stays above the navigation bar.
// The backdrop fades while the sheet slides (the Modal's own 'slide' would
// move the backdrop with it), and dragging the handle down closes it.
export function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
	const shown = useOverlayStatusBar(visible)
	const insets = useSafeAreaInsets()
	// Kept mounted until the closing slide ends.
	const [mounted, setMounted] = useState(false)

	// The sheet's measured height (the window's until it's laid out): how
	// far it slides, and where the backdrop is fully clear.
	const [height, setHeight] = useState(() => Dimensions.get('window').height)
	// Distance pushed down from its open position.
	const [offset] = useState(() => new Animated.Value(height))

	const backdrop = offset.interpolate({
		inputRange: [0, height],
		outputRange: [1, 0],
		extrapolate: 'clamp',
	})

	// Mounted as soon as it's shown (state adjusted while rendering).
	if (shown && !mounted) setMounted(true)

	useEffect(() => {
		if (shown || !mounted) return

		Animated.timing(offset, {
			toValue: height,
			duration: CLOSE_MS,
			easing: Easing.in(Easing.cubic),
			useNativeDriver: true,
		}).start(() => setMounted(false))
	}, [shown, mounted, offset, height])

	// Also when reopened during the closing slide, while still mounted.
	useEffect(() => {
		if (!shown || !mounted) return

		Animated.timing(offset, {
			toValue: 0,
			duration: OPEN_MS,
			easing: Easing.out(Easing.cubic),
			useNativeDriver: true,
		}).start()
	}, [shown, mounted, offset])

	const drag = useMemo(() => {
		const settle = () =>
			Animated.spring(offset, {
				toValue: 0,
				bounciness: 0,
				useNativeDriver: true,
			}).start()

		return PanResponder.create({
			// The handle takes the touch at once and keeps it, so the sheet
			// follows the finger from the start.
			onStartShouldSetPanResponder: () => true,
			onMoveShouldSetPanResponder: () => true,
			onPanResponderTerminationRequest: () => false,
			onPanResponderMove: (_, gesture) =>
				offset.setValue(Math.max(0, gesture.dy)),
			onPanResponderRelease: (_, gesture) => {
				if (gesture.dy > height * CLOSE_SHARE || gesture.vy > CLOSE_VELOCITY) {
					onClose()
				} else {
					settle()
				}
			},
			onPanResponderTerminate: settle,
		})
	}, [offset, height, onClose])

	return (
		<RNModal
			visible={mounted}
			transparent
			animationType='none'
			statusBarTranslucent
			navigationBarTranslucent
			onRequestClose={onClose}
		>
			<View className='flex-1 justify-end' style={{ paddingTop: insets.top }}>
				<Animated.View
					className='absolute inset-0'
					style={{ opacity: backdrop }}
				>
					<Pressable
						className='flex-1 bg-tinta/[0.78]'
						onPress={onClose}
						accessible={false}
					/>
				</Animated.View>

				<Animated.View
					onLayout={(event) => {
						setHeight(event.nativeEvent.layout.height)
					}}
					className='max-h-[90%] rounded-t-3xl border-1.5 border-b-0 border-card-border bg-blanco px-5'
					style={{
						paddingBottom: insets.bottom + 24,
						transform: [{ translateY: offset }],
					}}
				>
					{/* Grab handle: the pill and the full-width strip around it
					    drag the sheet. The content keeps its taps (and scroll). */}
					<View {...drag.panHandlers} className='-mx-5 items-center pb-4 pt-3'>
						<View className='h-1 w-10 rounded-full bg-card-border' />
					</View>

					{children}
				</Animated.View>
			</View>
		</RNModal>
	)
}
