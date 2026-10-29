import BackButton from '@/components/BackButton'
import { SpeciesHero } from '@/components/species/SpeciesHero'
import { SpeciesDataGrid } from '@/components/species/SpeciesDataGrid'
import { SpeciesTags } from '@/components/species/SpeciesTags'
import { SpeciesGallery } from '@/components/species/SpeciesGallery'
import { SpeciesImageViewer } from '@/components/species/SpeciesImageViewer'
import { useSessionRedirect } from '@/hooks/useSessionRedirect'
import { useSpeciesDetail } from '@/hooks/useSpecies'
import { UserGroupIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import {
	ActivityIndicator,
	Animated,
	ImageBackground,
	Pressable,
	Text,
	View,
	type ViewStyle,
} from 'react-native'

import colors from '@/theme/colors'
import type { SpeciesImage } from '@/types/species'

const cardShadow: ViewStyle = {
	shadowColor: colors.esmeralda,
	shadowOffset: { width: 0, height: 5 },
	shadowOpacity: 0.12,
	shadowRadius: 10,
	elevation: 4,
}

export default function SpeciesDetailScreen() {
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

				<Text className='mt-3.5 text-xs font-medium text-tinta-2'>
					Cargando especie...
				</Text>
			</ImageBackground>
		)
	}

	if (error || !species) {
		return (
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				className='flex-1 bg-blanco px-4 pt-14'
				resizeMode='repeat'
				imageClassName='opacity-90'
			>
				<View className='z-[100]' style={{ elevation: 100 }}>
					<BackButton onPress={() => router.back()} />
				</View>

				<View
					className='items-center rounded-[28px] border border-card-border bg-niebla px-6 py-10'
					style={cardShadow}
				>
					<View className='h-16 w-16 items-center justify-center rounded-2xl border border-card-border bg-hoja'>
						<HugeiconsIcon
							icon={UserGroupIcon}
							size={34}
							strokeWidth={1.8}
							color={colors.tinta}
						/>
					</View>

					<Text className='mt-5 text-center text-[18px] font-bold text-tinta'>
						No fue posible cargar la especie
					</Text>

					<Text className='mt-2 text-center text-sm leading-5 text-tinta-2'>
						{error ?? 'La información no está disponible en este momento.'}
					</Text>

					<Pressable
						onPress={() => void refresh()}
						className='mt-3.5 self-start rounded-[20px] bg-esmeralda px-5 py-3 active:bg-bosque'
					>
						<Text className='font-bold text-blanco'>Intentar nuevamente</Text>
					</Pressable>
				</View>
			</ImageBackground>
		)
	}

	return (
		<View className='relative flex-1'>
			<Animated.ScrollView
				className='flex-1 bg-blanco'
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
						className='relative z-10 w-full overflow-hidden rounded-t-[30px] border border-card-border bg-niebla'
						style={[cardShadow, { marginTop: cardMarginTop }]}
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
										<Text className='text-[11px] font-bold uppercase leading-4 tracking-wide text-esmeralda'>
											{species.category.name}
										</Text>
									</View>
								)}

								{/* NOMBRE */}
								<Text className='mt-3.5 text-[30px] font-bold leading-8 text-tinta'>
									{species.common_name}
								</Text>

								{species.scientific_name && (
									<Text className='mt-1.5 text-sm italic text-tinta-2'>
										{species.scientific_name}
									</Text>
								)}

								{/* DESCRIPCIÓN */}
								{species.description && (
									<View className='mt-7'>
										<Text className='text-[21px] font-bold text-tinta'>
											Conoce a esta especie
										</Text>

										<Text className='mt-2 text-[15px] leading-6 text-tinta-2'>
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
