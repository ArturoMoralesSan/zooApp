import { useCallback, useEffect, useRef, useState } from 'react'

// Viro shares one native platform between its views: creating one while
// another is still being released crashes natively. So a screen with a
// Viro view unmounts it first, waits for the release, and only then
// navigates (useViroExit); the next screen also waits a moment before
// mounting its own (useViroHandoff).
const HANDOFF_MS = 500
// Closing an ARCore session takes much longer than a 3D view.
const RELEASE_MS = { scene3d: 500, ar: 1500 }

export function useViroHandoff() {
	const [ready, setReady] = useState(false)

	useEffect(() => {
		const timeout = setTimeout(() => setReady(true), HANDOFF_MS)

		return () => clearTimeout(timeout)
	}, [])

	return ready
}

// `exiting` turns true as soon as `exit` is called: render the Viro view only
// while it's false. `then` runs once the view has had time to be released.
export function useViroExit(kind: keyof typeof RELEASE_MS) {
	const [exiting, setExiting] = useState(false)
	const timeout = useRef<ReturnType<typeof setTimeout>>(undefined)

	useEffect(() => () => clearTimeout(timeout.current), [])

	const exit = useCallback(
		(then: () => void) => {
			if (exiting) return

			setExiting(true)
			timeout.current = setTimeout(then, RELEASE_MS[kind])
		},
		[exiting, kind],
	)

	return { exiting, exit }
}
