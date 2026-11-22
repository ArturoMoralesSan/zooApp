export type Vec3 = [number, number, number]

// Turns a direction around the vertical axis the way a Viro node's
// rotation [0, degrees, 0] does: positive is counter-clockwise seen from
// above, so -Z (straight ahead) turned 90° points to -X.
export function rotateAroundY([x, y, z]: Vec3, degrees: number): Vec3 {
	const angle = (degrees * Math.PI) / 180
	const cos = Math.cos(angle)
	const sin = Math.sin(angle)

	return [x * cos + z * sin, y, z * cos - x * sin]
}

// The pose GVR reports before its head tracking starts: looking straight
// down with the phone's top to -X, exactly. Real sensor readings never land
// on these round numbers, even with the phone lying flat.
export function isUntrackedPose(forward: number[], up: number[]) {
	return (
		forward[0] === 0 &&
		forward[1] === -1 &&
		forward[2] === 0 &&
		up[0] === -1 &&
		up[1] === 0 &&
		up[2] === 0
	)
}
