import { API_URL } from '@/services/api'
import type { UserGamification } from '@/types/user'

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

// Progress toward the next level, as the profile reports it. The bar is
// full only when the profile says there's no next level; unknown (profile
// not loaded) stays empty.
export function levelProgress(
	gamification: UserGamification | null | undefined,
) {
	const topLevel = Boolean(gamification) && !gamification?.next_level
	const percent = Math.min(100, Math.max(0, gamification?.progress ?? 0))

	return {
		// 0–1, for ProgressBar.
		progress: topLevel ? 1 : percent / 100,
		topLevel,
		pointsToNextLevel: gamification?.points_to_next_level ?? 0,
		nextLevel: gamification?.next_level?.name || undefined,
	}
}
