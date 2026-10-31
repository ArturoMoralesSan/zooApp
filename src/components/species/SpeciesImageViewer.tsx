import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { Cancel01Icon } from '@hugeicons/core-free-icons'
import type { SpeciesDetail, SpeciesImage } from '@/types/species'
import { Image, Modal, Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useOverlayStatusBar } from '@/hooks/useOverlayStatusBar'

type SpeciesImageViewerProps = {
	selectedImage: SpeciesImage | null
	// Every photo of the species, in gallery order.
	images: SpeciesImage[]
	species: SpeciesDetail
	onSelect: (image: SpeciesImage) => void
	onClose: () => void
}

// A-12: full-screen Tinta viewer with "i de n", close, thumbnails and a
// "Cerrar" button.
export function SpeciesImageViewer({
	selectedImage,
	images,
	species,
	onSelect,
	onClose,
}: SpeciesImageViewerProps) {
	const shown = useOverlayStatusBar(selectedImage !== null)
	const insets = useSafeAreaInsets()
	const index = images.findIndex((image) => image.url === selectedImage?.url)

	return (
		<Modal
			visible={shown}
			transparent
			animationType='fade'
			statusBarTranslucent
			navigationBarTranslucent
			onRequestClose={onClose}
		>
			<View
				className='flex-1 bg-tinta px-5'
				style={{
					paddingTop: insets.top + 8,
					paddingBottom: insets.bottom + 20,
				}}
			>
				<View className='flex-row items-center justify-between'>
					<Text className='font-sans-bold text-[14px] text-blanco'>
						{index >= 0 ? `${index + 1} de ${images.length}` : ''}
					</Text>

					<IconButton
						icon={Cancel01Icon}
						variant='outline'
						onPress={onClose}
						accessibilityLabel='Cerrar'
					/>
				</View>

				<View className='-mx-5 flex-1 justify-center'>
					{selectedImage && (
						<Image
							source={{ uri: selectedImage.url }}
							className='h-[70%] w-full'
							resizeMode='contain'
							accessibilityLabel={selectedImage.alt_text || species.common_name}
						/>
					)}
				</View>

				{images.length > 1 && (
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						className='mb-5 grow-0'
						contentContainerClassName='grow justify-center gap-2'
					>
						{images.map((image, i) => (
							<Pressable
								key={image.id}
								onPress={() => onSelect(image)}
								accessibilityRole='imagebutton'
								accessibilityLabel={`Foto ${i + 1} de ${images.length}`}
								accessibilityState={{ selected: i === index }}
								className={`h-14 w-14 overflow-hidden rounded-xl border-2 ${i === index ? 'border-lima' : 'border-transparent opacity-70'}`}
							>
								<Image
									source={{ uri: image.url }}
									className='h-full w-full'
									resizeMode='cover'
								/>
							</Pressable>
						))}
					</ScrollView>
				)}

				<Button title='Cerrar' variant='secondary' onPress={onClose} />
			</View>
		</Modal>
	)
}
