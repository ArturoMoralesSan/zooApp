import * as SecureStore from 'expo-secure-store'

import type { ArPlacement } from '@/types/settings'

// App preferences, remembered per device. SecureStore is the only key-value
// store the app ships with (see hints.ts).
const AR_PLACEMENT_KEY = 'zooapp_pref_ar_placement'

const AR_PLACEMENTS: readonly ArPlacement[] = ['plane', 'auto']

// How AR places the animal. Unset, unknown or unreadable: 'plane' ('auto'
// is experimental).
export async function getArPlacement(): Promise<ArPlacement> {
	try {
		const value = await SecureStore.getItemAsync(AR_PLACEMENT_KEY)

		return AR_PLACEMENTS.find((item) => item === value) ?? 'plane'
	} catch {
		return 'plane'
	}
}

export async function setArPlacement(value: ArPlacement): Promise<void> {
	try {
		await SecureStore.setItemAsync(AR_PLACEMENT_KEY, value)
	} catch {
		// Not critical: AR uses the default until it's chosen again.
	}
}
