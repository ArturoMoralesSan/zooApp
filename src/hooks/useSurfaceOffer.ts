import { useEffect, useState } from 'react'

// How long AR looks for a surface before offering the 360° view.
const SURFACE_OFFER_MS = 10_000

// True once `searching` (AR open, nothing found yet) has lasted
// SURFACE_OFFER_MS; false again as soon as a surface shows up or AR closes.
export function useSurfaceOffer(searching: boolean) {
	const [timedOut, setTimedOut] = useState(false)

	// Each search starts its own wait (AR opened again after the 360° view).
	if (!searching && timedOut) setTimedOut(false)

	useEffect(() => {
		if (!searching) return

		const timeout = setTimeout(() => setTimedOut(true), SURFACE_OFFER_MS)

		return () => clearTimeout(timeout)
	}, [searching])

	return searching && timedOut
}
