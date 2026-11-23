import { useCallback, useEffect, useState } from 'react'

import { getAnimalView, setAnimalView } from '@/services/preferences'
import type { AnimalView } from '@/types/settings'

// "Vista de los animales": AR or the 360° view, the last one chosen in a
// viewer or in Configuración. `view` is null while it's read, so a viewer
// never opens the wrong one first. Setting it shows at once and saves in the
// background; `reload` reads it again (the card screen, after a viewer
// changed it).
export function useAnimalView() {
	const [view, setState] = useState<AnimalView | null>(null)

	useEffect(() => {
		let cancelled = false

		void getAnimalView().then((value) => {
			// A choice made while reading wins over the stored one.
			if (!cancelled) setState((current) => current ?? value)
		})

		return () => {
			cancelled = true
		}
	}, [])

	const reload = useCallback(() => {
		void getAnimalView().then(setState)
	}, [])

	const setView = useCallback((value: AnimalView) => {
		setState(value)
		void setAnimalView(value)
	}, [])

	return { view, setView, reload }
}
