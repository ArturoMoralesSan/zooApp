import { describe, expect, test } from '@jest/globals'

import type { Rarity } from '@/types/cards'
import {
	cardSubtitle,
	formatUnlockTime,
	isLocked,
	rarityLabel,
} from '@/utils/cards'

// Intl may separate "p.m." with a (narrow) no-break space.
const normalizeSpaces = (text: string) => text.replace(/[\u00a0\u202f]/g, ' ')

describe('rarity', () => {
	test.each<[Rarity, string]>([
		['comun', 'Común'],
		['rara', 'Rara'],
		['epica', 'Épica'],
		['edicion_especial', 'Especial'],
	])('%s → %s', (rarity, label) => {
		expect(rarityLabel(rarity)).toBe(label)
	})

	test('the subtitle adds the category when there is one', () => {
		expect(cardSubtitle('rara', 'Mamíferos')).toBe('Rara · Mamíferos')
		expect(cardSubtitle('rara', null)).toBe('Rara')
	})
})

describe('isLocked', () => {
	const now = new Date('2026-11-19T18:00:00Z')

	test('locked until a time still ahead', () => {
		expect(
			isLocked({ max: 3, left: 0, locked_until: '2026-11-19T18:10:00Z' }, now),
		).toBe(true)
	})

	// A cached list can still show a lock the server already lifted.
	test('a lock that already ended counts as available', () => {
		expect(
			isLocked({ max: 3, left: 0, locked_until: '2026-11-19T17:50:00Z' }, now),
		).toBe(false)
		expect(isLocked({ max: 3, left: 2, locked_until: null }, now)).toBe(false)
	})
})

describe('formatUnlockTime', () => {
	test("is the date and time in the zoo's time zone", () => {
		// 18:30 UTC is 12:30 in Durango (UTC-6).
		expect(normalizeSpaces(formatUnlockTime('2026-11-05T18:30:00Z'))).toBe(
			'5 de noviembre, 12:30 p.m.',
		)
	})
})
