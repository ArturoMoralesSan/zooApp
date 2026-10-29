export type Level = {
	id: number
	name: string
	min_points?: number
	max_points?: number
	description?: string | null
}

export type UserProfile = {
	avatar?: string | null
	phone?: string | null
	birth_date?: string | null
	city?: string | null
	country?: string | null
}

export type UserGamification = {
	points?: number
	current_level?: Level | null
	next_level?: Level | null
	progress?: number
	points_to_next_level?: number
}

export type User = {
	id: number
	name: string
	email: string
	points: number
	level_id: number | null
	level?: Level | null
	qr_token?: string | null
	profile?: UserProfile | null
	gamification?: UserGamification | null
}

export type ProfileResponse = {
	success: boolean
	user: User
}

export type UpdateProfileResponse = {
	success: boolean
	message: string
	user: User
}

export type AvatarResponse = {
	success: boolean
	message: string
	avatar: string
	user: User
}
