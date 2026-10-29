import { createContext, useContext, type ReactNode } from 'react'

import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useDataRefresh } from '@/hooks/useDataRefresh'

import {
	login as authLogin,
	logout as authLogout,
	register as authRegister,
	type Level,
	type User,
} from '@/services/auth'

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

type AuthContextType = {
	user: User | null
	loading: boolean
	isAuthenticated: boolean

	login: (data: LoginData) => Promise<User>
	register: (data: RegisterData) => Promise<User>
	logout: () => Promise<void>
	refreshUser: () => Promise<User | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

type AuthProviderProps = {
	children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
	const { data: currentUser, isLoading: loading, refresh } = useCurrentUser()
	const { setCurrentUser, clearCache } = useDataRefresh()

	// A failed first load leaves no data, so the user is null as before; a
	// failed refresh keeps the last user, as refreshUser did.
	const user = currentUser ?? null

	const login = async (data: LoginData) => {
		const response = await authLogin(data)

		await setCurrentUser(response.user)

		return response.user
	}

	const register = async (data: RegisterData) => {
		const response = await authRegister(data)

		await setCurrentUser(response.user)

		return response.user
	}

	const refreshUser = async () => (await refresh()) ?? null

	const logout = async () => {
		try {
			await authLogout()
		} finally {
			await clearCache()
		}
	}

	const value: AuthContextType = {
		user,
		loading,
		isAuthenticated: user !== null,
		login,
		register,
		logout,
		refreshUser,
	}

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
	const context = useContext(AuthContext)

	if (!context) {
		throw new Error('useAuth debe utilizarse dentro de AuthProvider.')
	}

	return context
}

export type { Level, User }
