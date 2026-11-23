import { useCallback, useEffect, useState } from 'react'

import { getArPlacement, setArPlacement } from '@/services/preferences'
import type { ArPlacement } from '@/types/settings'

// The "Colocación del animal" setting. `placement` is null while it's read,
// so an AR view never starts in the wrong mode. Setting it shows at once and
// saves in the background.
export function useArPlacement() {
	const [placement, setState] = useState<ArPlacement | null>(null)

	useEffect(() => {
		let cancelled = false

		void getArPlacement().then((value) => {
			// A choice made while reading wins over the stored one.
			if (!cancelled) setState((current) => current ?? value)
		})

		return () => {
			cancelled = true
		}
	}, [])

	const setPlacement = useCallback((value: ArPlacement) => {
		setState(value)
		void setArPlacement(value)
	}, [])

	return { placement, setPlacement }
}
