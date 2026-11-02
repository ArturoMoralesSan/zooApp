import * as SecureStore from 'expo-secure-store'

// One-time UI hints, remembered per device. SecureStore is the only key-value
// store the app ships with, and a flag doesn't justify a native module.
export type HintKey = 'deck_model_tap'

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
