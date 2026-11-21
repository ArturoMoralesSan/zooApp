import zooLogo from '@/assets/images/zoo-logo.svg'
import { Image } from 'expo-image'
import type { Ref } from 'react'
import { Text, View } from 'react-native'

import colors from '@/theme/colors'

type PhotoFrameProps = {
	uri: string
	// The animal in the photo ("Con Mapache").
	name: string
	// Its area in the zoo, when the card has one.
	area: string | null
	// The photo is drawn, so the frame can be captured.
	onReady?: () => void
	ref?: Ref<View>
}

// Shared photos are portrait 4:5, the shape social feeds show uncropped.
const PHOTO_ASPECT = 4 / 5
// The logo's own proportions (zoo-logo.svg's viewBox).
const LOGO_ASPECT = 13.42 / 9.09

// The zoo's photo frame (A-31/A-32): the shot with the animal's name, the
// zoo and its logo, so every saved or shared photo carries them. Captured
// as the final image (services/photo.ts).
export function PhotoFrame({ uri, name, area, onReady, ref }: PhotoFrameProps) {
	return (
		// Rounded and bordered on screen only: the capture is the inner view,
		// a plain white rectangle (a JPEG has no transparent corners).
		<View className='overflow-hidden rounded-2xl border-1.5 border-card-border'>
			<View
				ref={ref}
				// A real native view, so it can be captured.
				collapsable={false}
				className='bg-blanco p-3'
			>
				{/* expo-image takes no className: the wrapper rounds and sizes it. */}
				<View
					className='w-full overflow-hidden rounded-xl bg-niebla'
					style={{ aspectRatio: PHOTO_ASPECT }}
				>
					<Image
						source={{ uri }}
						contentFit='cover'
						onLoad={onReady}
						accessibilityLabel={`Foto con ${name}`}
						style={{ width: '100%', height: '100%' }}
					/>
				</View>

				<View className='mt-3 flex-row items-center gap-3'>
					<View className='min-w-0 flex-1'>
						<Text className='text-h3 text-bosque' numberOfLines={1}>
							Con {name}
						</Text>
						<Text className='text-meta' numberOfLines={1}>
							{area ? `Zoológico Sahuatoba · ${area}` : 'Zoológico Sahuatoba'}
						</Text>
					</View>

					<Image
						source={zooLogo}
						contentFit='contain'
						tintColor={colors.bosque}
						accessibilityLabel='Logo del Zoológico Sahuatoba'
						style={{ height: 32, aspectRatio: LOGO_ASPECT }}
					/>
				</View>
			</View>
		</View>
	)
}
