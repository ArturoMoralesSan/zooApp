import type {
	AvatarResponse,
	ProfileResponse,
	UpdateProfileBody,
	UpdateProfileResponse,
	User,
} from '@/types/user'

import { API_URL, api } from './api'
import { getToken } from './token'

export const profileKeys = {
	detail: '/profile',
	avatar: '/profile/avatar',
}

export async function getProfile(): Promise<User> {
	const response = await api<ProfileResponse>(profileKeys.detail)

	return response.user
}

export async function updateProfile(
	body: UpdateProfileBody,
): Promise<UpdateProfileResponse> {
	return api<UpdateProfileResponse>(profileKeys.detail, {
		method: 'PUT',
		body: JSON.stringify(body),
	})
}

// Multipart upload: api() always sends JSON, so this one calls fetch itself
// and keeps its own error messages.
export async function updateAvatar(file: Blob): Promise<AvatarResponse> {
	const token = await getToken()

	const formData = new FormData()
	formData.append('avatar', file)

	const response = await fetch(`${API_URL}${profileKeys.avatar}`, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		},
		body: formData,
	})

	const responseText = await response.text()

	let data:
		| AvatarResponse
		| {
				message?: string
				errors?: Record<string, string[]>
		  }

	try {
		data = JSON.parse(responseText)
	} catch {
		throw new Error(
			`Respuesta inválida del servidor. Código HTTP: ${response.status}`,
		)
	}

	if (!response.ok) {
		const errorData = data as {
			message?: string
			errors?: Record<string, string[]>
		}

		if (response.status === 401) {
			throw new Error('La sesión ya no es válida. Inicia sesión nuevamente.')
		}

		if (errorData.errors) {
			const firstError = Object.values(errorData.errors)[0]?.[0]
			if (firstError) throw new Error(firstError)
		}

		throw new Error(
			errorData.message ||
				`No fue posible actualizar la foto. Código HTTP: ${response.status}`,
		)
	}

	return data as AvatarResponse
}
