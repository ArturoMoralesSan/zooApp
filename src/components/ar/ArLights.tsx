import { ViroAmbientLight, ViroDirectionalLight } from '@reactvision/react-viro'

import {
	SHADOW_CAMERA_DISTANCE,
	SHADOW_MAP_SIZE,
	shadowBox,
	shadowCameraFrom,
} from '@/utils/shadow'
import type { Vec3 } from '@/utils/view360'

type ArLightsProps = {
	// Where the light travels (utils/shadow lightFromCamera).
	direction: Vec3
	// Where the animal stands and its size, once the live shadow is on.
	shadow: { target: Vec3; size: number } | null
}

// Before the animal is placed the light comes from straight ahead, mostly
// from above.
export const DEFAULT_LIGHT_DIRECTION: Vec3 = [0, -0.866, -0.5]

// Fixed daylight for the AR placement view, made for duels outdoors at the
// zoo: the 360° view's sky and sun colours, a sun a little stronger than
// indoors would need and a clear shadow.
// ARCore's room estimate isn't usable: Viro runs it in ENVIRONMENTAL_HDR
// mode, and onAmbientLightUpdate only reports the ambient-intensity mode's
// values (always 0 here). The animal casts through the default bitmasks
// (1 on the light, the model and the shadow receiver).
export function ArLights({ direction, shadow }: ArLightsProps) {
	return (
		<>
			{/* eslint-disable-next-line no-restricted-syntax -- AR light color */}
			<ViroAmbientLight color='#c5e3ff' intensity={330} />
			<ViroDirectionalLight
				// eslint-disable-next-line no-restricted-syntax -- AR light color
				color='#fff2cc'
				direction={direction}
				intensity={750}
				castsShadow={shadow !== null}
				shadowOpacity={0.6}
				shadowMapSize={SHADOW_MAP_SIZE}
				shadowOrthographicPosition={
					shadow ? shadowCameraFrom(shadow.target, direction) : undefined
				}
				shadowOrthographicSize={shadow ? shadowBox(shadow.size) : undefined}
				shadowNearZ={1}
				shadowFarZ={SHADOW_CAMERA_DISTANCE * 2}
			/>
		</>
	)
}
