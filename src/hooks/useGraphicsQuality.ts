import { useCallback, useEffect, useState } from 'react'

import {
	getGraphicsCustom,
	getGraphicsQuality,
	setGraphicsCustom,
	setGraphicsQuality,
} from '@/services/preferences'
import type { GraphicsEffects, GraphicsQuality } from '@/types/settings'

type Graphics = { quality: GraphicsQuality; custom: GraphicsEffects }

const read = () =>
	Promise.all([getGraphicsQuality(), getGraphicsCustom()]).then(
		([quality, custom]): Graphics => ({ quality, custom }),
	)

// The "Calidad gráfica" setting: the level and the switches of
// "Personalizada". Both are null while they're read. Changes show at once
// and save in the background; `reload` reads them again (a screen that
// stayed mounted while another one changed them).
export function useGraphicsQuality() {
	const [graphics, setGraphics] = useState<Graphics | null>(null)

	useEffect(() => {
		let cancelled = false

		void read().then((saved) => {
			// A choice made while reading wins over the stored one.
			if (!cancelled) setGraphics((current) => current ?? saved)
		})

		return () => {
			cancelled = true
		}
	}, [])

	const reload = useCallback(() => {
		void read().then(setGraphics)
	}, [])

	const setQuality = useCallback((quality: GraphicsQuality) => {
		setGraphics((current) => current && { ...current, quality })
		void setGraphicsQuality(quality)
	}, [])

	// Editing a switch makes the level "Personalizada".
	const setCustom = useCallback((custom: GraphicsEffects) => {
		setGraphics({ quality: 'custom', custom })
		void setGraphicsQuality('custom')
		void setGraphicsCustom(custom)
	}, [])

	return {
		quality: graphics?.quality ?? null,
		custom: graphics?.custom ?? null,
		setQuality,
		setCustom,
		reload,
	}
}
