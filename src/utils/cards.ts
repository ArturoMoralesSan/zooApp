import type { Attempts, Rarity } from '@/types/cards'
import { formatEventDate, formatEventTime } from '@/utils/format'

// Feminine: they describe a "tarjeta".
const rarityLabels: Record<Rarity, string> = {
	comun: 'Común',
	rara: 'Rara',
	epica: 'Épica',
	edicion_especial: 'Especial',
}

export function rarityLabel(rarity: Rarity): string {
	return rarityLabels[rarity] ?? rarity
}

// "Rara · Mamíferos", or just the rarity when the card has no category.
export function cardSubtitle(rarity: Rarity, category: string | null): string {
	return [rarityLabel(rarity), category].filter(Boolean).join(' · ')
}

// A lock that already ended counts as available: the server has reset the
// attempts even if a cached list still shows it.
export function isLocked(attempts: Attempts, now = new Date()): boolean {
	return attempts.locked_until !== null && new Date(attempts.locked_until) > now
}

// "5 de noviembre, 12:30 p.m." in the device's time zone.
export function formatUnlockTime(lockedUntil: string): string {
	return `${formatEventDate(lockedUntil)}, ${formatEventTime(lockedUntil)}`
}
