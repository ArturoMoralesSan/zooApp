import { describe, expect, test } from '@jest/globals'

import { asSentence, seasonPointsText } from '@/utils/pointSeason'

describe('seasonPointsText', () => {
	test('says what the season changed, per action', () => {
		expect(seasonPointsText('compra', 20, 10)).toBe(
			'Esta compra da 20 puntos en lugar de 10.',
		)
		expect(seasonPointsText('donación', 3, 5)).toBe(
			'Esta donación da 3 puntos en lugar de 5.',
		)
		expect(seasonPointsText('carta', 30, 50)).toBe(
			'Esta carta da 30 puntos en lugar de 50.',
		)
	})

	test('a season that turns the action off says so instead of "0 puntos"', () => {
		expect(seasonPointsText('compra', 0, 10)).toBe(
			'Esta temporada, esta compra no da puntos. Normalmente da 10.',
		)
	})

	test('says nothing when the season left the points as they were', () => {
		expect(seasonPointsText('compra', 10, 10)).toBeNull()
	})

	// Rule off or a donation under the minimum: the server sends no base, so
	// the season isn't blamed for the 0.
	test('says nothing without a base', () => {
		expect(seasonPointsText('donación', 0, null)).toBeNull()
	})
})

describe('asSentence', () => {
	test('adds a period only when the text has no closing punctuation', () => {
		expect(asSentence('Halloween')).toBe('Halloween.')
		expect(asSentence('¡Feliz Navidad!')).toBe('¡Feliz Navidad!')
	})
})
