import { Refresh01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { useRef, useState } from 'react'
import { Text, View } from 'react-native'

import { PhotoFrame } from '@/components/ar/PhotoFrame'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { captureFrame } from '@/services/photo'

type PhotoReviewProps = {
	// The shot to review; null hides the dialog.
	uri: string | null
	name: string
	area: string | null
	onRetake: () => void
	// The framed photo, ready to save or share.
	onUse: (framedUri: string) => void
	onError: () => void
}

// "¿Te gusta tu foto?" (A-31): the shot in the zoo frame, to take it again
// or keep it. Keeping it captures the frame as the final image.
export function PhotoReview({
	uri,
	name,
	area,
	onRetake,
	onUse,
	onError,
}: PhotoReviewProps) {
	const frameRef = useRef<View>(null)
	// Loaded for this uri: the frame can't be captured before.
	const [readyFor, setReadyFor] = useState<string | null>(null)
	const [saving, setSaving] = useState(false)
	const ready = uri !== null && readyFor === uri

	const use = async () => {
		setSaving(true)

		try {
			onUse(await captureFrame(frameRef))
		} catch {
			onError()
		} finally {
			setSaving(false)
		}
	}

	return (
		<Modal visible={uri !== null} onClose={onRetake} dismissible={!saving}>
			{uri && (
				<PhotoFrame
					ref={frameRef}
					uri={uri}
					name={name}
					area={area}
					onReady={() => setReadyFor(uri)}
				/>
			)}

			<Text className='text-h2 mt-5 text-center text-bosque'>
				¿Te gusta tu foto?
			</Text>

			<View className='mt-4 flex-row gap-3'>
				<View style={{ flex: 1 }}>
					<Button
						title='Repetir'
						variant='secondary'
						icon={Refresh01Icon}
						iconPosition='leading'
						onPress={onRetake}
						disabled={saving}
					/>
				</View>
				<View style={{ flex: 1 }}>
					<Button
						title='Usar foto'
						icon={Tick02Icon}
						iconPosition='leading'
						onPress={() => void use()}
						disabled={!ready}
						loading={saving}
					/>
				</View>
			</View>
		</Modal>
	)
}
