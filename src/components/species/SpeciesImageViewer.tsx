import { IconButton } from '@/components/ui/IconButton'
import { Cancel01Icon } from '@hugeicons/core-free-icons'
import type { SpeciesDetail, SpeciesImage } from '@/types/species'
import { Image, Modal, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type SpeciesImageViewerProps = {
	selectedImage: SpeciesImage | null
	species: SpeciesDetail
	onClose: () => void
}

export function SpeciesImageViewer({
	selectedImage,
	species,
	onClose,
}: SpeciesImageViewerProps) {
	const insets = useSafeAreaInsets()

	return (
		<Modal
			visible={selectedImage !== null}
			transparent
			animationType='fade'
			statusBarTranslucent
			navigationBarTranslucent
			onRequestClose={onClose}
		>
			<View className='flex-1 items-center justify-center bg-tinta/95'>
				<View
					className='absolute right-5 z-10'
					style={{ top: insets.top + 16 }}
				>
					<IconButton
						icon={Cancel01Icon}
						variant='outline'
						onPress={onClose}
						accessibilityLabel='Cerrar'
					/>
				</View>

				{selectedImage && (
					<Image
						source={{ uri: selectedImage.url }}
						className='h-[75%] w-full'
						resizeMode='contain'
						accessibilityLabel={selectedImage.alt_text || species.common_name}
					/>
				)}
			</View>
		</Modal>
	)
}
