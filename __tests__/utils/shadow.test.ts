import { expect, test } from '@jest/globals'

import {
	blobSize,
	dimensionsOf,
	lightFromCamera,
	receiverSize,
	SHADOW_CAMERA_DISTANCE,
	shadowBox,
	shadowCameraFrom,
} from '@/utils/shadow'
import type { Vec3 } from '@/utils/view360'

const rounded = (vector: number[]) =>
	vector.map((value) => Math.round(value * 1e3) / 1e3 + 0)

test('measures size, footprint and height from the bounding box', () => {
	expect(
		dimensionsOf({
			minX: -1,
			maxX: 1,
			minY: 0,
			maxY: 3,
			minZ: -0.5,
			maxZ: 0.5,
		}),
	).toEqual({ size: 3, footprint: 2, height: 3 })
})

test('the shadow box grows with the animal, within limits', () => {
	expect(shadowBox(0)).toBe(8)
	expect(shadowBox(1)).toBe(8)
	expect(shadowBox(3)).toBe(15)
	expect(shadowBox(10)).toBe(30)
})

test('the shadow camera sits up-light from the target', () => {
	const from = shadowCameraFrom([1, -1.4, -3], [0, -1, 0])

	expect(from).toEqual([1, -1.4 + SHADOW_CAMERA_DISTANCE, -3])
})

test('the blob spreads past the footprint', () => {
	expect(blobSize(1)).toBeCloseTo(1.4)
})

test('the receiver covers the turned footprint and the thrown shadow', () => {
	const size = receiverSize({ size: 2, footprint: 1, height: 2 })

	expect(size).toBeGreaterThan(Math.SQRT2)
	// The top's shadow lands tan(30°) × height past the feet on each side.
	expect(size).toBeCloseTo(Math.SQRT2 + 2 * 2 * Math.tan(Math.PI / 6))
})

test('the AR light travels away from the camera, mostly downward', () => {
	const camera = [0, 1.5, 0]
	const target: Vec3 = [0, 0, -2]
	const [x, y, z] = lightFromCamera(target, camera)

	expect(Math.hypot(x, y, z)).toBeCloseTo(1)
	expect(y).toBeLessThan(-0.8)
	// Away from the camera (−Z here) and turned a little to one side.
	expect(z).toBeLessThan(0)
	expect(Math.abs(x)).toBeGreaterThan(0.1)
	expect(Math.abs(x)).toBeLessThan(Math.abs(z))
})

test('the AR light turns with where the camera stands', () => {
	const target: Vec3 = [0, 0, 0]
	const fromSouth = lightFromCamera(target, [0, 1.5, 2])
	const fromNorth = lightFromCamera(target, [0, 1.5, -2])

	expect(rounded(fromNorth)).toEqual(
		rounded([-fromSouth[0], fromSouth[1], -fromSouth[2]]),
	)
})

test('a camera right above the animal still gives a direction', () => {
	const [x, y, z] = lightFromCamera([0, 0, 0], [0, 1.5, 0])

	expect(Math.hypot(x, y, z)).toBeCloseTo(1)
	expect(y).toBeLessThan(-0.8)
})
