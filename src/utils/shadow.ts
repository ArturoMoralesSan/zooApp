import type { BoundingBox } from '@/utils/arPlacement'
import { rotateAroundY, type Vec3 } from '@/utils/view360'

// Live shadows of a card's animal, shared by the 360° view and AR. Only the
// animal casts; a directional light draws it through an orthographic shadow
// camera that sits up-light from the animal and grows with it.

export const SHADOW_MAP_SIZE = 2048
// How far up-light the shadow camera sits; its depth range reaches twice
// as far, past the animal.
export const SHADOW_CAMERA_DISTANCE = 15
// The box grows with the animal: a low sun casts long shadows.
const SHADOW_PER_SIZE = 5
const MIN_SHADOW_BOX = 8
const MAX_SHADOW_BOX = 30
// The contact shadow spreads a little past the animal's footprint.
const BLOB_SPREAD = 1.4
// In AR the light comes from above, tilted this much toward the camera's
// side and turned a little to one side, so the shadow falls behind and
// beside the animal, where it stays visible.
const LIGHT_TILT = 30
const LIGHT_SIDE = 30

export type Dimensions = {
	// Its largest side: width, height or depth.
	size: number
	// The larger of width and depth.
	footprint: number
	height: number
}

// Used when the model can't be measured.
export const FALLBACK_DIMENSIONS: Dimensions = {
	size: 0,
	footprint: 1,
	height: 1,
}

export function dimensionsOf(box: BoundingBox): Dimensions {
	const width = box.maxX - box.minX
	const height = box.maxY - box.minY
	const depth = box.maxZ - box.minZ

	return {
		size: Math.max(width, height, depth),
		footprint: Math.max(width, depth),
		height,
	}
}

// Side of the orthographic shadow camera's box, in metres.
export function shadowBox(size: number) {
	return Math.min(
		MAX_SHADOW_BOX,
		Math.max(MIN_SHADOW_BOX, size * SHADOW_PER_SIZE),
	)
}

// Where the shadow camera sits: up-light from the target.
export function shadowCameraFrom(target: Vec3, direction: Vec3): Vec3 {
	return [
		target[0] - direction[0] * SHADOW_CAMERA_DISTANCE,
		target[1] - direction[1] * SHADOW_CAMERA_DISTANCE,
		target[2] - direction[2] * SHADOW_CAMERA_DISTANCE,
	]
}

// Side of the contact-shadow blob under the animal.
export function blobSize(footprint: number) {
	return footprint * BLOB_SPREAD
}

const radians = (degrees: number) => (degrees * Math.PI) / 180

// Side of the invisible floor that catches the live shadow in AR: the
// footprint turned any way, plus how far the tilted light throws the
// animal's top past it, on every side.
export function receiverSize({ footprint, height }: Dimensions) {
	return footprint * Math.SQRT2 + height * Math.tan(radians(LIGHT_TILT)) * 2
}

// The AR light's direction (where the light travels), fixed when the
// animal is placed: away from the camera's side, mostly downward.
export function lightFromCamera(target: Vec3, camera: number[]): Vec3 {
	const dx = target[0] - camera[0]
	const dz = target[2] - camera[2]
	const flat = Math.hypot(dx, dz)
	// Right above the animal there's no camera side: straight ahead.
	const away: Vec3 = flat < 1e-3 ? [0, 0, -1] : [dx / flat, 0, dz / flat]
	const [x, , z] = rotateAroundY(away, LIGHT_SIDE)
	const reach = Math.tan(radians(LIGHT_TILT))
	const length = Math.hypot(reach, 1)

	return [(x * reach) / length, -1 / length, (z * reach) / length]
}
