import type { User } from '@/types/user'

import { api } from './api'
import { getToken, removeToken, setToken } from './token'

export { getToken }

export type { Level, User } from '@/types/user'

export const userKeys = {
	current: '/user',
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

	await setToken(response.token)

	return response
}

export async function register(data: RegisterData): Promise<AuthResponse> {
	const response = await api<AuthResponse>('/register', {
		method: 'POST',
		body: JSON.stringify(data),
	})

	await setToken(response.token)

	return response
}

export async function getCurrentUser(): Promise<User> {
	const token = await getToken()

	if (!token) {
		throw new Error('No hay una sesión activa.')
	}

	const response = await api<UserResponse>(userKeys.current)

	return response.user
}

export async function logout(): Promise<void> {
	const token = await getToken()

	try {
		if (token) {
			await api('/logout', { method: 'POST' })
		}
	} finally {
		await removeToken()
	}
}

export async function isAuthenticated(): Promise<boolean> {
	const token = await getToken()

	return token !== null
}
