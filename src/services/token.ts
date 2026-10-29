import * as SecureStore from 'expo-secure-store'

// Token storage lives apart from auth.ts so api.ts can read it without
// importing auth.ts, which itself imports api.ts.
const TOKEN_KEY = 'zooapp_token'

export async function getToken(): Promise<string | null> {
	return SecureStore.getItemAsync(TOKEN_KEY)
}

export async function setToken(token: string): Promise<void> {
	await SecureStore.setItemAsync(TOKEN_KEY, token)
}

export async function removeToken(): Promise<void> {
	await SecureStore.deleteItemAsync(TOKEN_KEY)
}
