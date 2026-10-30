import { API_URL } from '@/services/api'

export function getAvatarUrl(avatar: string | null | undefined): string | null {
	if (!avatar) return null

	if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
		return avatar
	}

	const baseUrl = API_URL.replace(/\/api\/?$/, '')

	return `${baseUrl}/storage/${avatar}`
}

// "Arturo Moralesz" -> "AM"; one letter for single names.
export function getInitials(name: string | null | undefined): string {
	return (name ?? '')
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part.charAt(0).toUpperCase())
		.join('')
}
