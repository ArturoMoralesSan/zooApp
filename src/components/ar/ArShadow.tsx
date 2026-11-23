import { ViroMaterials, ViroNode, ViroQuad } from '@reactvision/react-viro'
import type { Ref } from 'react'

// The 360° view's contact shadow at 1.8× its opacity: on a real floor,
// with the animal covering its core, the original is barely visible.
import contactShadow from '@/assets/images/ar/contact-shadow.png'
import { blobSize, type Dimensions, receiverSize } from '@/utils/shadow'
import type { Vec3 } from '@/utils/view360'

type ArShadowProps = {
	ref?: Ref<ViroNode>
	dimensions: Dimensions
	// The invisible floor that shows the live shadow on the real one.
	receiver: boolean
	position?: Vec3
	visible?: boolean
}

const FLAT: Vec3 = [-90, 0, 0]
// Just above the floor, below the placement ring.
const BLOB_LIFT = 0.001
const NO_SHADOW = 0

ViroMaterials.createMaterials({
	arContactShadow: {
		diffuseTexture: contactShadow,
		lightingModel: 'Constant',
		blendMode: 'Alpha',
		writesToDepthBuffer: false,
	},
})

// What grounds the animal on the real floor, centred on its feet: the
// soft contact blob, always, and the shadow receiver once the live shadow
// is on. Neither casts.
export function ArShadow({
	ref,
	dimensions,
	receiver,
	position,
	visible,
}: ArShadowProps) {
	const blob = blobSize(dimensions.footprint)
	const floor = receiverSize(dimensions)

	return (
		<ViroNode ref={ref} position={position} visible={visible}>
			<ViroQuad
				width={blob}
				height={blob}
				position={[0, BLOB_LIFT, 0]}
				rotation={FLAT}
				materials={['arContactShadow']}
				shadowCastingBitMask={NO_SHADOW}
			/>
			{receiver && (
				<ViroQuad
					width={floor}
					height={floor}
					rotation={FLAT}
					arShadowReceiver
					shadowCastingBitMask={NO_SHADOW}
				/>
			)}
		</ViroNode>
	)
}
