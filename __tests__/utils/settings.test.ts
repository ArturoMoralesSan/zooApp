import { expect, test } from '@jest/globals'

import {
	autoGraphicsLevel,
	GRAPHICS_PRESETS,
	graphicsLoad,
	resolveGraphics,
} from '@/utils/settings'

const GB = 1024 ** 3

test('auto picks Alta on a recent phone with 3 GB or more', () => {
	// A phone sold with 4 GB reports about 3.4.
	expect(autoGraphicsLevel({ totalMemory: 3.4 * GB, yearClass: 2019 })).toBe(
		'high',
	)
})

test('auto saves on little memory or an older phone', () => {
	expect(autoGraphicsLevel({ totalMemory: 2.8 * GB, yearClass: 2023 })).toBe(
		'saver',
	)
	expect(autoGraphicsLevel({ totalMemory: 8 * GB, yearClass: 2018 })).toBe(
		'saver',
	)
})

test('auto saves when the phone can’t be described', () => {
	expect(autoGraphicsLevel({ totalMemory: null, yearClass: 2023 })).toBe(
		'saver',
	)
	expect(autoGraphicsLevel({ totalMemory: 8 * GB, yearClass: null })).toBe(
		'saver',
	)
})

test('the load grows with the effects, the savanna weighing most', () => {
	expect(graphicsLoad(GRAPHICS_PRESETS.high)).toEqual({
		share: 1,
		level: 'high',
	})
	expect(graphicsLoad(GRAPHICS_PRESETS.saver).level).toBe('low')
	expect(
		graphicsLoad({ ...GRAPHICS_PRESETS.saver, view360Scenario: true }).level,
	).toBe('medium')
})

test('a level resolves to its effects; Personalizada to the user’s mix', () => {
	const recent = { totalMemory: 8 * GB, yearClass: 2023 }
	const old = { totalMemory: 2 * GB, yearClass: 2016 }
	const mix = { ...GRAPHICS_PRESETS.saver, view360Scenario: true }

	expect(resolveGraphics('high', mix, old)).toEqual(GRAPHICS_PRESETS.high)
	expect(resolveGraphics('saver', mix, recent)).toEqual(GRAPHICS_PRESETS.saver)
	expect(resolveGraphics('auto', mix, recent)).toEqual(GRAPHICS_PRESETS.high)
	expect(resolveGraphics('auto', mix, old)).toEqual(GRAPHICS_PRESETS.saver)
	expect(resolveGraphics('custom', mix, recent)).toBe(mix)
})
