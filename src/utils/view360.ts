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
