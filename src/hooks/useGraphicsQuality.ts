import { useCallback, useEffect, useState } from 'react'

import {
	getGraphicsCustom,
	getGraphicsQuality,
	setGraphicsCustom,
	setGraphicsQuality,
} from '@/services/preferences'
import type { GraphicsEffects, GraphicsQuality } from '@/types/settings'

type Graphics = { quality: GraphicsQuality; custom: GraphicsEffects }

// The "Calidad gráfica" setting: the level and the switches of
// "Personalizada". Both are null while they're read. Changes show at once
// and save in the background.
export function useGraphicsQuality() {
	const [graphics, setGraphics] = useState<Graphics | null>(null)

	useEffect(() => {
		let cancelled = false

		void Promise.all([getGraphicsQuality(), getGraphicsCustom()]).then(
			([quality, custom]) => {
				// A choice made while reading wins over the stored one.
				if (!cancelled) setGraphics((current) => current ?? { quality, custom })
			},
		)

		return () => {
			cancelled = true
		}
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
	}
}
