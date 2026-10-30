import BackButton from '@/components/ui/BackButton'
import { useScrollBottomSpace } from '@/theme/layout'
import { SpeciesErrorState } from '@/components/species/SpeciesErrorState'
import { SpeciesHero } from '@/components/species/SpeciesHero'
import { SpeciesDataGrid } from '@/components/species/SpeciesDataGrid'
import { SpeciesTags } from '@/components/species/SpeciesTags'
import { SpeciesGallery } from '@/components/species/SpeciesGallery'
import { SpeciesImageViewer } from '@/components/species/SpeciesImageViewer'
import { useSessionRedirect } from '@/hooks/useSessionRedirect'
import { useSpeciesDetail } from '@/hooks/useSpecies'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import {
	ActivityIndicator,
	Animated,
	ImageBackground,
	Text,
	View,
} from 'react-native'

import colors from '@/theme/colors'
import type { SpeciesImage } from '@/types/species'

export default function SpeciesDetailScreen() {
	const bottomSpace = useScrollBottomSpace(0)
	const router = useRouter()
	const params = useLocalSearchParams<{ id: string }>()

	const [scrollY] = useState(() => new Animated.Value(0))

	const {
		data: species,
		error: loadError,
		isLoading: loading,
		refresh,
	} = useSpeciesDetail(params.id)
	const [selectedImage, setSelectedImage] = useState<SpeciesImage | null>(null)

	const error = loadError
		? loadError.message || 'No fue posible cargar la información de la especie.'
		: null

	useSessionRedirect()

	const cardMarginTop = scrollY.interpolate({
		inputRange: [0, 180],
		outputRange: [-40, -220],
		extrapolate: 'clamp',
	})

	const backButtonOpacity = scrollY.interpolate({
		inputRange: [0, 80, 150],
		outputRange: [1, 0.6, 0],
		extrapolate: 'clamp',
	})

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

	if (loading) {
		return (
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				className='flex-1 items-center justify-center bg-blanco'
				resizeMode='repeat'
				imageClassName='opacity-90'
			>
				<ActivityIndicator size='large' color={colors.esmeralda} />

				<Text className='text-meta mt-3.5'>Cargando especie...</Text>
			</ImageBackground>
		)
	}

	if (error || !species) {
		return (
			<SpeciesErrorState
				error={error}
				onBack={() => router.back()}
				onRetry={() => void refresh()}
			/>
		)
	}

	return (
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
					{ useNativeDriver: false },
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
						className='relative z-10 w-full overflow-hidden rounded-t-[30px] border-1.5 border-card-border bg-niebla'
						style={{ marginTop: cardMarginTop }}
					>
						<ImageBackground
							source={require('@/assets/images/zoo-pattern.png')}
							resizeMode='repeat'
							imageClassName='opacity-30'
							className='bg-blanco'
						>
							<View className='px-4 pb-7 pt-6'>
								{/* CATEGORÍA */}
								{species.category && (
									<View className='self-start rounded-full border border-card-border bg-hoja px-3 py-1.5'>
										<Text className='text-overline text-esmeralda'>
											{species.category.name}
										</Text>
									</View>
								)}

								{/* NOMBRE */}
								<Text className='text-h1 mt-3.5'>{species.common_name}</Text>

								{species.scientific_name && (
									<Text className='text-body mt-1.5 italic text-tinta-2'>
										{species.scientific_name}
									</Text>
								)}

								{/* DESCRIPCIÓN */}
								{species.description && (
									<View className='mt-7'>
										<Text className='text-h2 text-tinta'>
											Conoce a esta especie
										</Text>

										<Text className='text-body mt-2 text-tinta-2'>
											{species.description}
										</Text>
									</View>
								)}

								{/* DATOS DE LA ESPECIE */}
								<SpeciesDataGrid species={species} />

								{/* ETIQUETAS */}
								{species.tags.length > 0 && <SpeciesTags species={species} />}

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
						</ImageBackground>
					</Animated.View>
				</View>
			</Animated.ScrollView>

			{/* BOTÓN REGRESAR SOBRE LA IMAGEN */}
			<Animated.View
				pointerEvents='box-none'
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					zIndex: 9999,
					elevation: 9999,
					opacity: backButtonOpacity,
				}}
			>
				<BackButton onPress={() => router.back()} />
			</Animated.View>

			{/* VISOR DE IMÁGENES */}
			<SpeciesImageViewer
				selectedImage={selectedImage}
				species={species}
				onClose={() => setSelectedImage(null)}
			/>
		</View>
	)
}
