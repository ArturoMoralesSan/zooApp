import type { Vec3 } from '@/utils/view360'

// Automatic AR placement (ModelPlacementScene, 'auto'): the animal floats in
// front of the camera until the floor is known, follows the point where the
// view's centre meets it, and lands there once that point holds still.

// Bounding box as Viro3DObject.getBoundingBoxAsync reports it (metres).
export type BoundingBox = {
	minX: number
	maxX: number
	minY: number
	maxY: number
	minZ: number
	maxZ: number
}

// What a hit test result carries that placement needs.
export type HitResult = {
	type: string
	transform: { position: number[]; rotation: number[] }
}

// Portrait camera view on the phone, a little narrower than the real one so
// the animal always fits: ARCore fills the screen height, and the 20:9
// screen crops the image's sides.
const VERTICAL_FOV = 60
const HORIZONTAL_FOV = 30
// The floating animal's centre sits this far below the horizon.
const DROP_ANGLE = 10
// How far up or down (degrees) the floating animal follows the view.
const MIN_ELEVATION = -50
const MAX_ELEVATION = 30
// Room around the animal on screen.
const FIT_MARGIN = 1.15
const MIN_DISTANCE = 0.8
const MAX_DISTANCE = 10
// Planes off by more than this from horizontal aren't floors.
const MAX_TILT = 10
// Planes within this height of the floor are the same floor (ARCore refines
// it); higher ones are furniture.
const SAME_FLOOR = 0.15
// How much each new reading moves the floor height.
const FLOOR_REFINE = 0.3
// The view's centre meets the floor farther than this (horizontally): too
// close to the horizon to place anything.
const MAX_FLOOR_DISTANCE = 8
// The ray only bridges gaps this close (horizontally) to the last real
// floor hit: farther, it may run under a wall to the floor behind it.
const MAX_BRIDGE = 0.6
// The surface counts as steady after holding within the tolerance for
// STEADY_MS. Far away, hand tremor moves the point more: the tolerance
// grows with the distance.
export const STEADY_MS = 500
const STEADY_TOLERANCE = 0.05
const STEADY_TOLERANCE_PER_METRE = 0.04

const toRadians = (degrees: number) => (degrees * Math.PI) / 180

export function distance(a: Vec3, b: Vec3) {
	return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
}

// Writes to Viro are skipped below a centimetre: invisible, and each one
// crosses the bridge.
export function movedEnough(from: Vec3 | null, to: Vec3, min = 0.01) {
	return from === null || distance(from, to) > min
}

// Yaw (degrees around Y) that turns the model's front (+Z, the glTF
// convention) toward the camera.
export function yawToward(from: Vec3, to: number[]) {
	return (Math.atan2(to[0] - from[0], to[2] - from[2]) * 180) / Math.PI
}

// Camera-to-model distance (to the model's origin, its bottom centre) at
// which the whole animal fits on screen, floating DROP_ANGLE below the
// horizon and facing the camera. Viro's box is world-aligned: measure it
// before the model turns, so X is its width and Z its depth.
export function fitDistance(box: BoundingBox) {
	const width = box.maxX - box.minX
	const height = box.maxY - box.minY
	const depth = box.maxZ - box.minZ
	const across = width / 2 / Math.tan(toRadians(HORIZONTAL_FOV / 2))
	// The centre is DROP_ANGLE low, so the top has that much less room.
	const up = height / 2 / Math.tan(toRadians(VERTICAL_FOV / 2 - DROP_ANGLE))
	// The front of the animal is half its depth closer than its origin.
	const fit = Math.max(across, up) * FIT_MARGIN + depth / 2

	return Math.min(MAX_DISTANCE, Math.max(MIN_DISTANCE, fit))
}

// Where the floating model's origin goes: `modelDistance` along the view,
// with the animal's centre DROP_ANGLE below the screen centre. It follows
// the camera's pitch (a fixed height dropped out of view when the phone
// tilted up), within MIN_ELEVATION..MAX_ELEVATION.
export function floatPosition(
	camera: { position: number[]; forward: number[] },
	modelDistance: number,
	height: number,
): Vec3 {
	const [x, y, z] = camera.position
	const [fx, fy, fz] = camera.forward
	const length = Math.hypot(fx, fz)
	// Pointing straight up or down: no heading, keep -Z.
	const [dx, dz] = length < 1e-3 ? [0, -1] : [fx / length, fz / length]
	const pitch = (Math.atan2(fy, length) * 180) / Math.PI
	const elevation = toRadians(
		Math.min(MAX_ELEVATION, Math.max(MIN_ELEVATION, pitch - DROP_ANGLE)),
	)
	const ahead = Math.cos(elevation) * modelDistance

	return [
		x + dx * ahead,
		y + Math.sin(elevation) * modelDistance - height / 2,
		z + dz * ahead,
	]
}

// A hit that can hold the animal: a detected plane, facing up and below the
// camera. Feature points and estimated planes jump around.
export function isFloorHit(hit: HitResult, cameraY: number) {
	if (hit.type !== 'ExistingPlaneUsingExtent' && hit.type !== 'ExistingPlane')
		return false

	const [tiltX, , tiltZ] = hit.transform.rotation

	return (
		Math.abs(tiltX) <= MAX_TILT &&
		Math.abs(tiltZ) <= MAX_TILT &&
		hit.transform.position[1] < cameraY
	)
}

// Height of the lowest floor among the results (ARCore sometimes lists a
// feature point first), or null.
export function floorHeight(hits: HitResult[], cameraY: number) {
	const heights = hits
		.filter((hit) => isFloorHit(hit, cameraY))
		.map((hit) => hit.transform.position[1])

	return heights.length ? Math.min(...heights) : null
}

// The floor height after a new reading: a lower plane is the real floor, a
// close one refines it, a higher one (a table) is ignored.
export function nextFloorY(current: number | null, seen: number | null) {
	if (seen === null) return current
	if (current === null || seen < current - SAME_FLOOR) return seen
	if (seen > current + SAME_FLOOR) return current

	return current + (seen - current) * FLOOR_REFINE
}

// The first hit on the floor itself (not a table), set at the floor's
// height so it lines up with floorPoint.
export function floorHitAt(
	hits: HitResult[],
	cameraY: number,
	floorY: number,
): Vec3 | null {
	const hit = hits.find(
		(item) =>
			isFloorHit(item, cameraY) &&
			Math.abs(item.transform.position[1] - floorY) <= SAME_FLOOR,
	)

	return hit
		? [hit.transform.position[0], floorY, hit.transform.position[2]]
		: null
}

// Whether a ray point is close enough to the last real floor hit to stand
// in for the hit test, which blinks at the edge of what ARCore has mapped.
export function bridges(point: Vec3, lastHit: Vec3 | null) {
	return (
		lastHit !== null &&
		Math.hypot(point[0] - lastHit[0], point[2] - lastHit[2]) <= MAX_BRIDGE
	)
}

// Where the view's centre meets the floor, or null when it points above
// the horizon or too far.
export function floorPoint(
	camera: { position: number[]; forward: number[] },
	floorY: number,
): Vec3 | null {
	const [x, y, z] = camera.position
	const [fx, fy, fz] = camera.forward

	if (fy >= -1e-3 || floorY >= y) return null

	const t = (floorY - y) / fy

	if (Math.hypot(fx * t, fz * t) > MAX_FLOOR_DISTANCE) return null

	return [x + fx * t, floorY, z + fz * t]
}

// How far the point may wander and still count as steady, `away` metres
// from the camera.
export function steadyTolerance(away: number) {
	return Math.max(STEADY_TOLERANCE, away * STEADY_TOLERANCE_PER_METRE)
}

// Exponential smoothing that doesn't depend on how often events arrive:
// after `halfLifeMs` the value has covered half the way to the target.
export function smooth(
	from: Vec3,
	to: Vec3,
	elapsedMs: number,
	halfLifeMs = 80,
): Vec3 {
	const t = 1 - 0.5 ** (Math.max(0, elapsedMs) / halfLifeMs)

	return [
		from[0] + (to[0] - from[0]) * t,
		from[1] + (to[1] - from[1]) * t,
		from[2] + (to[2] - from[2]) * t,
	]
}

// Tells when the floor under the screen centre has held still for STEADY_MS.
// Viro stops sending hit tests while the phone doesn't move, so the caller
// arms a timer for the time `update` returns instead of waiting for the
// next event.
export function createSteadyTimer(
	ms = STEADY_MS,
	tolerance = STEADY_TOLERANCE,
) {
	let anchor: Vec3 | null = null
	let since = 0

	return {
		// Feeds a hit; returns the milliseconds left until it counts as steady
		// (0: steady now, `ms`: it just moved and the wait starts again).
		update(position: Vec3, now: number, within = tolerance) {
			if (anchor === null || distance(anchor, position) > within) {
				anchor = position
				since = now
			}

			return Math.max(0, since + ms - now)
		},
		// Whether the last hit has held until `now` without new events.
		isSteady(now: number) {
			return anchor !== null && now - since >= ms
		},
		reset() {
			anchor = null
		},
	}
}
