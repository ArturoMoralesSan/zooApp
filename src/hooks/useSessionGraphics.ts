import * as Device from 'expo-device'
import { useState } from 'react'

import { useGraphicsQuality } from '@/hooks/useGraphicsQuality'
import type { GraphicsEffects } from '@/types/settings'
import { resolveGraphics } from '@/utils/settings'

// The effects an AR or 360° view may use, fixed once read: a change in
// Configuración applies to the next session, never mid-session. Null while
// the setting is read; the view waits for it.
export function useSessionGraphics(): GraphicsEffects | null {
	const { quality, custom } = useGraphicsQuality()
	const [effects, setEffects] = useState<GraphicsEffects | null>(null)

	if (effects === null && quality && custom) {
		setEffects(
			resolveGraphics(quality, custom, {
				totalMemory: Device.totalMemory,
				yearClass: Device.deviceYearClass,
			}),
		)
	}

	return effects
}
