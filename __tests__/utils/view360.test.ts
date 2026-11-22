import { expect, test } from '@jest/globals'

import { isUntrackedPose, rotateAroundY, type Vec3 } from '@/utils/view360'

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

test('spots the pose GVR reports before head tracking starts', () => {
	expect(isUntrackedPose([0, -1, 0], [-1, 0, 0])).toBe(true)
	// Tracking running: a reading logged on the phone held upright, and a
	// phone lying flat (close to straight down, but never exactly).
	expect(
		isUntrackedPose(
			[-0.001926642027683556, -0.4425305426120758, -0.8967512845993042],
			[0.005913237575441599, 0.8967321515083313, -0.4425338804721832],
		),
	).toBe(false)
	expect(
		isUntrackedPose([0.0004, -0.99999, 0.0011], [-0.99998, 0.0004, 0.002]),
	).toBe(false)
})
