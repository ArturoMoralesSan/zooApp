import type { SpeciesDetail, SpeciesImage } from '@/types/species'
import { Image, Modal, Pressable, Text, View } from 'react-native'

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
	return (
		<Modal
			visible={selectedImage !== null}
			transparent
			animationType='fade'
			onRequestClose={onClose}
		>
			<View className='flex-1 items-center justify-center bg-tinta/95'>
				<View className='absolute right-5 top-14 z-10 overflow-hidden rounded-full border border-card-border/35 bg-niebla/20'>
					<Pressable
						onPress={onClose}
						className='rounded-full bg-niebla/20 px-3.5 py-2 active:bg-hoja/30'
					>
						<Text className='text-[14px] font-bold text-blanco'>Cerrar</Text>
					</Pressable>
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
