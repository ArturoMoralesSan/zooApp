import { jest } from '@jest/globals'

// In-memory expo-secure-store: missing keys read as null, like the device.
const store = new Map<string, string>()

export const getItemAsync = jest.fn(
	async (key: string): Promise<string | null> => store.get(key) ?? null,
)

export const setItemAsync = jest.fn(
	async (key: string, value: string): Promise<void> => {
		store.set(key, value)
	},
)

export const deleteItemAsync = jest.fn(async (key: string): Promise<void> => {
	store.delete(key)
})

export function __reset() {
	store.clear()
}
