import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from 'react'

import {
	login as authLogin,
	logout as authLogout,
	register as authRegister,
	getCurrentUser,
	getToken,
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
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)

	const loadUser = useCallback(async () => {
		try {
			const token = await getToken()

			if (!token) {
				setUser(null)
				return null
			}

			const currentUser = await getCurrentUser()

			setUser(currentUser)

			return currentUser
		} catch {
			setUser(null)
			return null
		}
	}, [])

	useEffect(() => {
		loadUser().finally(() => {
			setLoading(false)
		})
	}, [loadUser])

	const login = useCallback(async (data: LoginData) => {
		const response = await authLogin(data)

		setUser(response.user)

		return response.user
	}, [])

	const register = useCallback(async (data: RegisterData) => {
		const response = await authRegister(data)

		setUser(response.user)

		return response.user
	}, [])

	const refreshUser = useCallback(async () => {
		const currentUser = await getCurrentUser()

		setUser(currentUser)

		return currentUser
	}, [])

	const logout = useCallback(async () => {
		try {
			await authLogout()
		} finally {
			setUser(null)
		}
	}, [])

	const value = useMemo<AuthContextType>(
		() => ({
			user,
			loading,
			isAuthenticated: user !== null,
			login,
			register,
			logout,
			refreshUser,
		}),
		[user, loading, login, register, logout, refreshUser],
	)

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
