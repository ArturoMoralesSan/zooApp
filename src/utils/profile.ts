import { API_URL } from '@/services/api'

export function getAvatarUrl(avatar: string | null | undefined): string | null {
	if (!avatar) return null

	if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
		return avatar
	}

	const baseUrl = API_URL.replace(/\/api\/?$/, '')

	return `${baseUrl}/storage/${avatar}`
}
