import { expect, test } from '@jest/globals'

import { rotateAroundY, type Vec3 } from '@/utils/view360'

const AHEAD: Vec3 = [0, 0, -1]

const rounded = (vector: Vec3) =>
	vector.map((value) => Math.round(value * 1e6) / 1e6 + 0)

test('no turn keeps the direction', () => {
	expect(rounded(rotateAroundY([0.3, -0.4, -0.6], 0))).toEqual([
		0.3, -0.4, -0.6,
	])
})

test('turns counter-clockwise seen from above, like a Viro rotation', () => {
	expect(rounded(rotateAroundY(AHEAD, 90))).toEqual([-1, 0, 0])
	expect(rounded(rotateAroundY(AHEAD, -90))).toEqual([1, 0, 0])
	expect(rounded(rotateAroundY(AHEAD, 180))).toEqual([0, 0, 1])
})

test('a full turn and the height are left as they were', () => {
	expect(rounded(rotateAroundY([-0.604, -0.409, -0.684], 360))).toEqual([
		-0.604, -0.409, -0.684,
	])
	expect(rotateAroundY([0, -1, 0], 73)[1]).toBe(-1)
})
