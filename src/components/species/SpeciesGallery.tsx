import { SectionTitle } from '@/components/ui/SectionTitle'
import type { SpeciesDetail, SpeciesImage } from '@/types/species'
import { Dimensions, Image, Pressable, ScrollView, View } from 'react-native'

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
			<SectionTitle title='Galería' className='' />

			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				className='-mx-5 mt-3'
				contentContainerClassName='px-5'
			>
				{galleryImages.map((image) => (
					<View
						key={image.id}
						className='mr-3 overflow-hidden rounded-xl border-1.5 border-card-border bg-niebla'
						style={{
							width: SCREEN_WIDTH * 0.62,
							height: SCREEN_WIDTH * 0.41,
						}}
					>
						<Pressable
							onPress={() => onOpenImage(image)}
							className='h-full w-full active:opacity-[0.88]'
							accessibilityRole='imagebutton'
							accessibilityLabel={`Ver foto de ${species.common_name}`}
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
