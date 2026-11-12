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
export function useViroExit(kind: keyof typeof RELEASE_MS, busy = false) {
	const [pending, setPending] = useState<{ then: () => void } | null>(null)
	const [gaveUp, setGaveUp] = useState(false)
	const [exiting, setExiting] = useState(false)

	// Latched: once the view is unmounted it isn't mounted again.
	if (pending && !exiting && (!busy || gaveUp)) {
		setExiting(true)
	}

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

	return { exiting, exit }
}
