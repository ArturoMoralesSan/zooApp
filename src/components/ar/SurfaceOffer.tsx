import { Rotate360Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/Button'
import { CameraNotice } from '@/components/ui/CameraNotice'

type SurfaceOfferProps = {
	onAccept: () => void
	className?: string
}

// Shown when AR finds no surface for a while: the 360° view needs none.
export function SurfaceOffer({ onAccept, className }: SurfaceOfferProps) {
	return (
		<CameraNotice
			message='¿No encuentras una superficie?'
			className={className}
		>
			<Button
				title='Ver en 360°'
				variant='secondary'
				icon={Rotate360Icon}
				iconPosition='leading'
				onPress={onAccept}
			/>
		</CameraNotice>
	)
}
