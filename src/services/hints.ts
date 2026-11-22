import * as SecureStore from 'expo-secure-store'

// One-time UI hints, remembered per device. SecureStore is the only key-value
// store the app ships with, and a flag doesn't justify a native module.
export type HintKey =
	| 'deck_model_tap'
	// ZooDeck's offline pack: the first-visit modal and the mobile-data notice.
	| 'deck_offline_intro'
	| 'deck_offline_mobile'
	// How to look around and turn the animal in the 360° view.
	| 'deck_360_controls'

const prefix = 'zooapp_hint_'

export async function wasHintShown(key: HintKey): Promise<boolean> {
	try {
		return (await SecureStore.getItemAsync(prefix + key)) === '1'
	} catch {
		// Unreadable storage: better to show a hint twice than never.
		return false
	}
}

export async function markHintShown(key: HintKey): Promise<void> {
	try {
		await SecureStore.setItemAsync(prefix + key, '1')
	} catch {
		// Not critical: the hint shows again next time.
	}
}

// Hints that remember a value instead of a flag.
export type HintValueKey =
	// Title of the points season whose banner was closed: a new title shows
	// it again.
	'points_season_dismissed'

export async function getHintValue(key: HintValueKey): Promise<string | null> {
	try {
		return await SecureStore.getItemAsync(prefix + key)
	} catch {
		return null
	}
}

export async function setHintValue(
	key: HintValueKey,
	value: string,
): Promise<void> {
	try {
		await SecureStore.setItemAsync(prefix + key, value)
	} catch {
		// Not critical: the banner shows again next launch.
	}
}
