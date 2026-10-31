import { TopBar } from '@/components/ui/TopBar'
import { useScrolled } from '@/hooks/useScrolled'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { useScrollBottomSpace } from '@/theme/layout'
import { SpeciesStateFrame } from '@/components/species/SpeciesStateFrame'
import { QueryView } from '@/components/ui/QueryView'
import { SpeciesHero } from '@/components/species/SpeciesHero'
import { SpeciesDataGrid } from '@/components/species/SpeciesDataGrid'
import { SpeciesTags } from '@/components/species/SpeciesTags'
import { SpeciesGallery } from '@/components/species/SpeciesGallery'
import { SpeciesImageViewer } from '@/components/species/SpeciesImageViewer'
import { useSessionRedirect } from '@/hooks/useSessionRedirect'
import { useSpeciesDetail } from '@/hooks/useSpecies'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { Animated, Text, View } from 'react-native'

import type { SpeciesImage } from '@/types/species'

export default function SpeciesDetailScreen() {
	const bottomSpace = useScrollBottomSpace(0)
	const router = useRouter()
	const params = useLocalSearchParams<{ id: string }>()

	const [scrollY] = useState(() => new Animated.Value(0))

	const detail = useSpeciesDetail(params.id)
	const species = detail.data
	const [selectedImage, setSelectedImage] = useState<SpeciesImage | null>(null)

	useSessionRedirect()

	const cardMarginTop = scrollY.interpolate({
		inputRange: [0, 180],
		outputRange: [-40, -220],
		extrapolate: 'clamp',
	})

	// The sheet (470 hero, -40 overlap, rising 2px per scrolled px) meets
	// the bar's bottom edge here.
	const insets = useSafeAreaInsets()
	const { pastTitle: pastHero, onScroll } = useScrolled(
		(470 - 40 - (insets.top + 56)) / 2,
	)

	const heroImage = useMemo(() => {
		if (!species) return null

		return (
			species.images.find((image) => image.type === 'main') ??
			species.images.find((image) => image.type === 'thumbnail') ??
			species.images[0] ??
			null
		)
	}, [species])

	const galleryImages = useMemo(() => {
		if (!species) return []

		return species.images.filter(
			(image) => image.type === 'gallery' && image.url !== heroImage?.url,
		)
	}, [species, heroImage])

	const viewerImages = useMemo(
		() => (heroImage ? [heroImage, ...galleryImages] : galleryImages),
		[heroImage, galleryImages],
	)

	return (
		<QueryView
			query={detail}
			loadingMessage='Cargando especie…'
			errorTitle='No pudimos cargar la especie'
			wrapper={(state) => (
				<SpeciesStateFrame onBack={() => router.back()}>
					{state}
				</SpeciesStateFrame>
			)}
		>
			{(species) => (
				<View className='relative flex-1'>
					<Animated.ScrollView
						className='flex-1 bg-blanco'
						contentContainerStyle={{ paddingBottom: bottomSpace }}
						showsVerticalScrollIndicator={false}
						scrollEventThrottle={16}
						onScroll={Animated.event(
							[
								{
									nativeEvent: {
										contentOffset: { y: scrollY },
									},
								},
							],
							{ useNativeDriver: false, listener: onScroll },
						)}
					>
						<View className='relative bg-blanco'>
							{/* IMAGEN PRINCIPAL */}
							<SpeciesHero
								heroImage={heroImage}
								species={species}
								onOpenImage={setSelectedImage}
							/>

							{/* CONTENIDO */}
							<Animated.View
								className='relative z-10 w-full overflow-hidden rounded-t-3xl border-t-1.5 border-t-card-border bg-blanco'
								style={{ marginTop: cardMarginTop }}
							>
								<View className='bg-blanco'>
									<View className='px-5 pb-7 pt-6'>
										{/* CATEGORÍA */}
										{species.category && (
											<Text className='text-overline text-esmeralda'>
												{species.category.name}
											</Text>
										)}

										{/* NOMBRE */}
										<Text className='text-h1 mt-1'>{species.common_name}</Text>

										{species.scientific_name && (
											<Text className='text-body mt-1.5 italic text-tinta-2'>
												{species.scientific_name}
											</Text>
										)}

										{/* DESCRIPCIÓN */}
										{species.description && (
											<View className='mt-6'>
												<SectionTitle
													title='Conoce a esta especie'
													className='mb-2'
												/>

												<Text className='text-body text-tinta-2'>
													{species.description}
												</Text>
											</View>
										)}

										{/* DATOS DE LA ESPECIE */}
										<SpeciesDataGrid species={species} />

										{/* ETIQUETAS */}
										{species.tags.length > 0 && (
											<SpeciesTags species={species} />
										)}

										{/* GALERÍA */}
										{galleryImages.length > 0 && (
											<SpeciesGallery
												galleryImages={galleryImages}
												species={species}
												onOpenImage={setSelectedImage}
											/>
										)}

										<View className='h-2' />
									</View>
								</View>
							</Animated.View>
						</View>
					</Animated.ScrollView>

					{/* BARRA SUPERIOR: transparent over the photo, solid with the
					    species name once the sheet reaches it */}
					<TopBar
						overlay
						onBack={() => router.back()}
						title={species.common_name}
						showTitle={pastHero}
						scrolled={pastHero}
					/>

					{/* VISOR DE IMÁGENES */}
					<SpeciesImageViewer
						selectedImage={selectedImage}
						images={viewerImages}
						species={species}
						onSelect={setSelectedImage}
						onClose={() => setSelectedImage(null)}
					/>
				</View>
			)}
		</QueryView>
	)
}
