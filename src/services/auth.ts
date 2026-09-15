import * as SecureStore from 'expo-secure-store'
import { api } from './api'

const TOKEN_KEY = 'zooapp_token'

export type Level = {
	id: number
	name: string
	min_points?: number
	max_points?: number
	description?: string | null
}

export type User = {
	id: number
	name: string
	email: string
	points: number
	level_id: number | null
	level?: Level | null
}

type AuthResponse = {
	success: boolean
	message: string
	token: string
	user: User
}

type UserResponse = {
	success: boolean
	user: User
}

type LoginData = {
	email: string
	password: string
}

type RegisterData = {
	name: string
	email: string
	password: string
	password_confirmation: string
}

export async function login(data: LoginData): Promise<AuthResponse> {
	const response = await api<AuthResponse>('/login', {
		method: 'POST',
		body: JSON.stringify(data),
	})

	await SecureStore.setItemAsync(TOKEN_KEY, response.token)

	return response
}

export async function register(data: RegisterData): Promise<AuthResponse> {
	const response = await api<AuthResponse>('/register', {
		method: 'POST',
		body: JSON.stringify(data),
	})

	await SecureStore.setItemAsync(TOKEN_KEY, response.token)

	return response
}

export async function getToken(): Promise<string | null> {
	return SecureStore.getItemAsync(TOKEN_KEY)
}

export async function getCurrentUser(): Promise<User> {
	const token = await getToken()

	if (!token) {
		throw new Error('No hay una sesión activa.')
	}

	const response = await api<UserResponse>('/user', {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	})

	return response.user
}

export async function logout(): Promise<void> {
	const token = await getToken()

	try {
		if (token) {
			await api('/logout', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
		}
	} finally {
		await SecureStore.deleteItemAsync(TOKEN_KEY)
	}
}

export async function isAuthenticated(): Promise<boolean> {
	const token = await getToken()

	return token !== null
}
