import type { SpeciesDetail, SpeciesImage } from '@/types/species'
import {
	Dimensions,
	Image,
	Pressable,
	ScrollView,
	Text,
	View,
} from 'react-native'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

type SpeciesGalleryProps = {
	galleryImages: SpeciesImage[]
	species: SpeciesDetail
	onOpenImage: (image: SpeciesImage) => void
}

export function SpeciesGallery({
	galleryImages,
	species,
	onOpenImage,
}: SpeciesGalleryProps) {
	return (
		<View className='mt-7'>
			<Text className='text-h2 text-tinta'>Galería</Text>

			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				className='-mx-4 mt-3.5'
				contentContainerClassName='px-5'
			>
				{galleryImages.map((image) => (
					<View
						key={image.id}
						className='mr-2.5 overflow-hidden rounded-[22px] border-1.5 border-card-border bg-niebla'
						style={{
							width: SCREEN_WIDTH * 0.68,
							height: SCREEN_WIDTH * 0.48,
						}}
					>
						<Pressable
							onPress={() => onOpenImage(image)}
							className='h-full w-full active:opacity-[0.88]'
						>
							<Image
								source={{ uri: image.url }}
								className='h-full w-full'
								resizeMode='cover'
								accessibilityLabel={image.alt_text || species.common_name}
							/>
						</Pressable>
					</View>
				))}
			</ScrollView>
		</View>
	)
}
