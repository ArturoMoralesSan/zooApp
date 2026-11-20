import { describe, expect, test } from '@jest/globals'

import { mapKeys } from '@/services/map'

// The ZooDeck map's key is its URL. Rounding keeps GPS jitter from
// refetching; checks that block a duel use the raw fix, as POST /duels does.
describe('mapKeys.zoodeck', () => {
	test('without a location, the map of the whole zoo', () => {
		expect(mapKeys.zoodeck(null)).toBe('/map/species')
	})

	test('rounds the position to 4 decimals (about 11 m)', () => {
		expect(mapKeys.zoodeck([-104.583_456_7, 24.075_812_3])).toBe(
			'/map/species?latitude=24.0758&longitude=-104.5835',
		)
	})

	test('rounds the accuracy up to 5 m steps', () => {
		expect(mapKeys.zoodeck([-104.5834, 24.0758], 11)).toBe(
			'/map/species?latitude=24.0758&longitude=-104.5834&accuracy=15',
		)
		expect(mapKeys.zoodeck([-104.5834, 24.0758], 15)).toContain('accuracy=15')
	})

	test('leaves out an unknown accuracy', () => {
		expect(mapKeys.zoodeck([-104.5834, 24.0758], null)).not.toContain(
			'accuracy',
		)
		expect(mapKeys.zoodeck([-104.5834, 24.0758], 0)).not.toContain('accuracy')
	})

	test('exact keeps the raw fix and accuracy', () => {
		expect(mapKeys.zoodeck([-104.583_456_7, 24.075_812_3], 11.5, true)).toBe(
			'/map/species?latitude=24.0758123&longitude=-104.5834567&accuracy=11.5',
		)
	})
})
