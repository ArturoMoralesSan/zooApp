import { useMemo, useState } from 'react'
import {
	type GestureResponderEvent,
	type NativeTouchEvent,
	PanResponder,
	type PanResponderGestureState,
} from 'react-native'

// Where a model stands in front of the camera: meters sideways and up,
// a size factor and degrees around its vertical axis.
export type ModelTransform = {
	x: number
	y: number
	scale: number
	yaw: number
}

type Limits = {
	x: [number, number]
	y: [number, number]
	scale: [number, number]
}

type Options = {
	// Meters the model moves per dp dragged (depends on its distance).
	metersPerDp: number
	limits: Limits
	onTap: () => void
}

type Start = {
	transform: ModelTransform
	// The gesture's dx/dy when this start was taken (one finger).
	dx: number
	dy: number
	// Distance and angle between two fingers (two fingers).
	distance: number
	angle: number
	touches: number
}

// A tap moves less than this.
const TAP_SLOP_DP = 8

type Gesture = {
	transform: ModelTransform
	// Where the current finger setup started; null between gestures.
	start: Start | null
}

const clamp = (value: number, [min, max]: [number, number]) =>
	Math.min(max, Math.max(min, value))

// A copy of the event taken when it arrives: PanResponder reuses its
// gesture state object, and the state updaters below run later.
type Snapshot = {
	dx: number
	dy: number
	touches: Pick<NativeTouchEvent, 'pageX' | 'pageY'>[]
}

function snapshot(
	event: GestureResponderEvent,
	state: PanResponderGestureState,
): Snapshot {
	return {
		dx: state.dx,
		dy: state.dy,
		touches: event.nativeEvent.touches.map(({ pageX, pageY }) => ({
			pageX,
			pageY,
		})),
	}
}

function pair(touches: Snapshot['touches']) {
	const [a, b] = touches
	const dx = b.pageX - a.pageX
	const dy = b.pageY - a.pageY

	return {
		distance: Math.hypot(dx, dy),
		angle: (Math.atan2(dy, dx) * 180) / Math.PI,
	}
}

// A start from where the model is now, so adding or lifting a finger
// doesn't make it jump.
function startFrom(
	transform: ModelTransform,
	{ dx, dy, touches }: Snapshot,
): Start {
	const twoFingers = touches.length >= 2 ? pair(touches) : null

	return {
		transform,
		dx,
		dy,
		distance: twoFingers?.distance ?? 0,
		angle: twoFingers?.angle ?? 0,
		touches: touches.length,
	}
}

function moved(
	from: Start,
	{ dx, dy, touches }: Snapshot,
	{ metersPerDp, limits }: Omit<Options, 'onTap'>,
): ModelTransform {
	if (touches.length >= 2) {
		const now = pair(touches)
		const ratio = from.distance > 0 ? now.distance / from.distance : 1

		return {
			...from.transform,
			scale: clamp(from.transform.scale * ratio, limits.scale),
			yaw: from.transform.yaw - (now.angle - from.angle),
		}
	}

	return {
		...from.transform,
		x: clamp(from.transform.x + (dx - from.dx) * metersPerDp, limits.x),
		// Screen y grows downward, world y upward.
		y: clamp(from.transform.y - (dy - from.dy) * metersPerDp, limits.y),
	}
}

// Drag with one finger to move a model, pinch to resize it and twist two
// fingers to turn it; a tap calls onTap. Viro's view has no touch handling
// outside rear-camera plane AR, so this goes on a layer above it. Every
// update derives from the previous state (see CardViewerFrame).
export function useModelGestures(
	initial: ModelTransform,
	{ metersPerDp, limits, onTap }: Options,
) {
	const [gesture, setGesture] = useState<Gesture>({
		transform: initial,
		start: null,
	})

	const panResponder = useMemo(
		() =>
			PanResponder.create({
				onStartShouldSetPanResponder: () => true,
				onMoveShouldSetPanResponder: () => true,
				// Keep the gesture: losing it midway would drop the move.
				onPanResponderTerminationRequest: () => false,
				onPanResponderGrant: (event, state) => {
					const now = snapshot(event, state)

					setGesture((previous) => ({
						...previous,
						start: startFrom(previous.transform, now),
					}))
				},
				onPanResponderMove: (event, state) => {
					const now = snapshot(event, state)

					setGesture((previous) => {
						if (
							!previous.start ||
							previous.start.touches !== now.touches.length
						) {
							return {
								...previous,
								start: startFrom(previous.transform, now),
							}
						}

						return {
							...previous,
							transform: moved(previous.start, now, {
								metersPerDp,
								limits,
							}),
						}
					})
				},
				onPanResponderRelease: (_event, state) => {
					setGesture((previous) => ({ ...previous, start: null }))

					if (Math.hypot(state.dx, state.dy) < TAP_SLOP_DP) onTap()
				},
				onPanResponderTerminate: () =>
					setGesture((previous) => ({ ...previous, start: null })),
			}),
		[metersPerDp, limits, onTap],
	)

	return { transform: gesture.transform, panHandlers: panResponder.panHandlers }
}
