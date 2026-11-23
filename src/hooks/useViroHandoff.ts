import { useCallback, useEffect, useState } from 'react'

// Viro shares one native platform between its views: creating one while
// another is still being released crashes natively, and releasing one while
// it's still loading a model or image breaks the next one (it renders
// black). So a screen with a Viro view leaves through useViroExit, which
// waits for loads, unmounts the view and waits for its release before
// navigating; the next screen also waits a moment before mounting its own
// (useViroHandoff).
const HANDOFF_MS = 500
// Closing an ARCore session takes much longer than a 3D view.
const RELEASE_MS = { scene3d: 500, ar: 1500 }
// Never keep the user waiting for a load longer than this.
const BUSY_CAP_MS = 6000
// A scene with per-frame events stops them (`closing`) this long before its
// view is removed: Viro's GL thread emitting one while Fabric removes the
// view deadlocks the app (an ANR). A margin of about six frames, not a
// guarantee: Viro gives no signal that the events have stopped.
const QUIET_MS = 200

export function useViroHandoff() {
	const [ready, setReady] = useState(false)

	useEffect(() => {
		const timeout = setTimeout(() => setReady(true), HANDOFF_MS)

		return () => clearTimeout(timeout)
	}, [])

	return ready
}

// `exiting` turns true once the view can go: render the Viro view only while
// it's false. `exit(then)` asks to leave; `then` runs after the release.
// `busy` (a model or image still loading) delays it, up to BUSY_CAP_MS.
// `closing` is true from the moment exit is asked: the scene stops its
// per-frame events then. Only views with them (`perFrameEvents`, e.g. AR
// auto placement's hit tests) wait QUIET_MS before going.
export function useViroExit(
	kind: keyof typeof RELEASE_MS,
	busy = false,
	perFrameEvents = false,
) {
	const [pending, setPending] = useState<{ then: () => void } | null>(null)
	const [gaveUp, setGaveUp] = useState(false)
	const [quietDone, setQuietDone] = useState(false)
	const [exiting, setExiting] = useState(false)
	const quiet = !perFrameEvents || quietDone

	// Latched: once the view is unmounted it isn't mounted again (until
	// `reset`).
	if (pending && !exiting && quiet && (!busy || gaveUp)) {
		setExiting(true)
	}

	useEffect(() => {
		if (!pending || !perFrameEvents) return

		const timeout = setTimeout(() => setQuietDone(true), QUIET_MS)

		return () => clearTimeout(timeout)
	}, [pending, perFrameEvents])

	useEffect(() => {
		if (!pending || exiting) return

		const timeout = setTimeout(() => setGaveUp(true), BUSY_CAP_MS)

		return () => clearTimeout(timeout)
	}, [pending, exiting])

	useEffect(() => {
		if (!exiting || !pending) return

		const timeout = setTimeout(pending.then, RELEASE_MS[kind])

		return () => clearTimeout(timeout)
	}, [exiting, pending, kind])

	const exit = useCallback((then: () => void) => {
		setPending((current) => current ?? { then })
	}, [])

	// After an exit that didn't leave the screen (switching between AR and
	// the 360° view): the view may be mounted again.
	const reset = useCallback(() => {
		setPending(null)
		setGaveUp(false)
		setQuietDone(false)
		setExiting(false)
	}, [])

	return { closing: pending !== null, exiting, exit, reset }
}
