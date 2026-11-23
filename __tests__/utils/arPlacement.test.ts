import { expect, test } from '@jest/globals'

import {
	type BoundingBox,
	createSteadyTimer,
	distance,
	fitDistance,
	floatPosition,
	bridges,
	floorHeight,
	floorHitAt,
	floorPoint,
	type HitResult,
	isFloorHit,
	movedEnough,
	nextFloorY,
	smooth,
	STEADY_MS,
	steadyTolerance,
	yawToward,
} from '@/utils/arPlacement'

// What getBoundingBoxAsync gave for the hippo card, 1 m down and 3 m ahead.
const HIPPO: BoundingBox = {
	minX: -0.376,
	maxX: 0.376,
	minY: -1,
	maxY: 0,
	minZ: -3.912,
	maxZ: -2.088,
}

const box = (width: number, height: number, depth: number): BoundingBox => ({
	minX: -width / 2,
	maxX: width / 2,
	minY: 0,
	maxY: height,
	minZ: -depth / 2,
	maxZ: depth / 2,
})

const plane = (position: number[], rotation = [0, 12, 0]): HitResult => ({
	type: 'ExistingPlaneUsingExtent',
	transform: { position, rotation },
})

const rounded = (vector: number[]) =>
	vector.map((value) => Math.round(value * 1000) / 1000 + 0)

test('the fitting distance grows with the animal and stays within limits', () => {
	const hippo = fitDistance(HIPPO)

	expect(hippo).toBeGreaterThan(1.5)
	expect(hippo).toBeLessThan(4)
	// Only the size counts, not where the box was measured.
	expect(fitDistance(box(0.752, 1, 1.824))).toBeCloseTo(hippo, 5)
	expect(fitDistance(box(1, 5, 4))).toBeGreaterThan(hippo)
	// A frog doesn't float in the user's face, a giraffe isn't in the distance.
	expect(fitDistance(box(0.05, 0.05, 0.1))).toBe(0.8)
	expect(fitDistance(box(20, 20, 20))).toBe(10)
})

test('the whole animal fits the view at that distance', () => {
	const size = box(1, 1.8, 2)
	const at = fitDistance(size)
	const front = at - 1
	// 15° each side, and 20° above the centre (which is 10° low).
	expect(0.5 / front).toBeLessThanOrEqual(Math.tan((15 * Math.PI) / 180))
	expect(0.9 / front).toBeLessThanOrEqual(Math.tan((20 * Math.PI) / 180))
})

const degrees = (value: number) => (value * Math.PI) / 180

test('floats ahead with its centre 10° below the screen centre', () => {
	const level = floatPosition(
		{ position: [0, 0, 0], forward: [0.6, 0, 0.8] },
		1,
		0,
	)
	const ahead = Math.cos(degrees(10))

	expect(rounded(level)).toEqual(
		rounded([0.6 * ahead, -Math.sin(degrees(10)), 0.8 * ahead]),
	)
	// The origin is the animal's feet: half its height below the centre.
	expect(
		floatPosition({ position: [0, 0, 0], forward: [0.6, 0, 0.8] }, 1, 2)[1],
	).toBeCloseTo(level[1] - 1, 10)
})

test('follows the camera pitch, within limits', () => {
	// Looking 36.9° down: the centre is 46.9° down the view.
	const [x, y, z] = floatPosition(
		{ position: [1, 1.5, 0], forward: [0, -0.6, -0.8] },
		2,
		1,
	)
	const down = degrees((Math.atan2(0.6, 0.8) * 180) / Math.PI + 10)

	expect(x).toBeCloseTo(1, 10)
	expect(y).toBeCloseTo(1.5 - Math.sin(down) * 2 - 0.5, 10)
	expect(z).toBeCloseTo(-Math.cos(down) * 2, 10)
	// Looking up at 53°: it stops 30° up.
	expect(
		rounded(
			floatPosition({ position: [0, 0, 0], forward: [0, 0.8, -0.6] }, 2, 0),
		),
	).toEqual(rounded([0, Math.sin(degrees(30)) * 2, -Math.cos(degrees(30)) * 2]))
})

test('looking straight down keeps the last-resort heading and the limit', () => {
	expect(
		rounded(floatPosition({ position: [0, 0, 0], forward: [0, -1, 0] }, 2, 0)),
	).toEqual(
		rounded([0, -Math.sin(degrees(50)) * 2, -Math.cos(degrees(50)) * 2]),
	)
})

test('only upward planes below the camera count as floor', () => {
	expect(isFloorHit(plane([0, -0.8, -1]), 0)).toBe(true)
	expect(
		isFloorHit({ ...plane([0, -0.8, -1]), type: 'ExistingPlane' }, 0),
	).toBe(true)
	expect(isFloorHit({ ...plane([0, -0.8, -1]), type: 'FeaturePoint' }, 0)).toBe(
		false,
	)
	expect(
		isFloorHit(
			{ ...plane([0, -0.8, -1]), type: 'EstimatedHorizontalPlane' },
			0,
		),
	).toBe(false)
	// A wall, a ceiling, a shelf above the phone.
	expect(isFloorHit(plane([0, 0, -1], [90, 0, 0]), 0.5)).toBe(false)
	expect(isFloorHit(plane([0, 2, -1], [180, 0, 0]), 0)).toBe(false)
	expect(isFloorHit(plane([0, 0.2, -1]), 0)).toBe(false)
})

test('the floor is the lowest upward plane, even after a feature point', () => {
	const hits: HitResult[] = [
		{
			type: 'FeaturePoint',
			transform: { position: [9, -2, 9], rotation: [0, 0, 0] },
		},
		plane([0.1, -0.7, -1.2]),
		plane([0.4, -1.3, -2]),
	]

	expect(floorHeight(hits, 0)).toBe(-1.3)
	expect(floorHeight([hits[0]], 0)).toBeNull()
	expect(floorHeight([], 0)).toBeNull()
})

test('a lower plane replaces the floor, a close one refines it, a table is ignored', () => {
	expect(nextFloorY(null, null)).toBeNull()
	expect(nextFloorY(null, -0.7)).toBe(-0.7)
	expect(nextFloorY(-1.3, null)).toBe(-1.3)
	expect(nextFloorY(-0.7, -1.3)).toBe(-1.3)
	expect(nextFloorY(-1.3, -0.6)).toBe(-1.3)
	expect(nextFloorY(-1.3, -1.2)).toBeCloseTo(-1.27, 10)
})

test('the hit on the floor itself counts, at the floor height', () => {
	const hits: HitResult[] = [plane([0.5, -0.6, -1]), plane([0.2, -1.28, -2])]

	expect(floorHitAt(hits, 0, -1.3)).toEqual([0.2, -1.3, -2])
	// Only the table under the centre: no floor hit.
	expect(floorHitAt([hits[0]], 0, -1.3)).toBeNull()
})

test('the ray only bridges gaps near the last floor hit', () => {
	expect(bridges([0, -1.3, -2], null)).toBe(false)
	expect(bridges([0.3, -1.3, -2.4], [0, -1.3, -2])).toBe(true)
	// Under the wall, to the floor of the next room.
	expect(bridges([0, -1.3, -3.5], [0, -1.3, -2])).toBe(false)
})

test('the ring goes where the view centre meets the floor', () => {
	const camera = { position: [0, 0, 0], forward: [0, -0.6, -0.8] }

	expect(rounded(floorPoint(camera, -1.2) ?? [])).toEqual([0, -1.2, -1.6])
	// Level or looking up: it never meets the floor.
	expect(
		floorPoint({ position: [0, 0, 0], forward: [0, 0, -1] }, -1.2),
	).toBeNull()
	expect(
		floorPoint({ position: [0, 0, 0], forward: [0, 0.3, -1] }, -1.2),
	).toBeNull()
	// Near the horizon: too far to place anything.
	expect(
		floorPoint({ position: [0, 0, 0], forward: [0, -0.1, -0.995] }, -1.2),
	).toBeNull()
	// A floor above the camera isn't one.
	expect(floorPoint(camera, 0.5)).toBeNull()
})

test('the steady tolerance grows with the distance', () => {
	expect(steadyTolerance(0.5)).toBe(0.05)
	expect(steadyTolerance(4)).toBeCloseTo(0.16, 10)
})

test('smoothing covers half the way per half-life, at any event rate', () => {
	expect(smooth([0, 0, 0], [1, 2, -4], 80)).toEqual([0.5, 1, -2])
	expect(smooth([0, 0, 0], [1, 0, 0], 0)).toEqual([0, 0, 0])
	// Two 40 ms steps land where one 80 ms step does.
	const twice = smooth(smooth([0, 0, 0], [1, 0, 0], 40), [1, 0, 0], 40)
	expect(twice[0]).toBeCloseTo(0.5, 10)
	expect(smooth([0, 0, 0], [1, 0, 0], 10_000)[0]).toBeCloseTo(1, 10)
})

test('moves under a centimetre are skipped', () => {
	expect(movedEnough(null, [0, 0, 0])).toBe(true)
	expect(movedEnough([0, 0, 0], [0.005, 0, 0.005])).toBe(false)
	expect(movedEnough([0, 0, 0], [0.02, 0, 0])).toBe(true)
	expect(distance([0, 0, 0], [3, 4, 0])).toBe(5)
})

test('turns the front toward the camera', () => {
	expect(yawToward([0, 0, 0], [0, 1, 5])).toBe(0)
	expect(yawToward([0, 0, 0], [5, 1, 0])).toBe(90)
	expect(Math.abs(yawToward([0, 0, -2], [0, 1.4, -4]))).toBe(180)
})

test('the surface counts as steady after holding still for 0.5 s', () => {
	const timer = createSteadyTimer()

	expect(timer.isSteady(0)).toBe(false)
	expect(timer.update([0, -1, -1], 1000)).toBe(STEADY_MS)
	// Jitter within tolerance keeps the countdown going.
	expect(timer.update([0.02, -1, -1.02], 1200)).toBe(300)
	expect(timer.isSteady(1499)).toBe(false)
	// No more events (the phone held still): the timer still knows.
	expect(timer.isSteady(1500)).toBe(true)
	expect(timer.update([0.01, -1, -1], 1600)).toBe(0)
})

test('a jump or a reset starts the wait again', () => {
	const timer = createSteadyTimer()

	timer.update([0, -1, -1], 0)
	expect(timer.update([0.3, -1, -1], 400)).toBe(STEADY_MS)
	expect(timer.isSteady(800)).toBe(false)
	expect(timer.isSteady(900)).toBe(true)

	// A wider tolerance (far away) keeps the countdown going.
	expect(timer.update([0.4, -1, -1], 950, 0.15)).toBe(0)

	timer.reset()
	expect(timer.isSteady(5000)).toBe(false)
	expect(timer.update([0.3, -1, -1], 5000)).toBe(STEADY_MS)
})
