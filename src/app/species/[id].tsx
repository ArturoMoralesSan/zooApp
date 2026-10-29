import AppCard from '@/components/AppCard'
import BackButton from '@/components/BackButton'
import { useSessionRedirect } from '@/hooks/useSessionRedirect'
import { useSpeciesDetail } from '@/hooks/useSpecies'
import {
	Leaf01Icon,
	Location01Icon,
	Plant01Icon,
	Shield01Icon,
	UserGroupIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import {
	ActivityIndicator,
	Animated,
	Dimensions,
	Image,
	ImageBackground,
	Modal,
	Pressable,
	ScrollView,
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

const subtleShadow: ViewStyle = {
	shadowColor: colors.esmeralda,
	shadowOffset: { width: 0, height: 3 },
	shadowOpacity: 0.08,
	shadowRadius: 7,
	elevation: 2,
}

const { width: SCREEN_WIDTH } = Dimensions.get('window')

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
					<View className='h-[470px] w-full overflow-hidden bg-niebla'>
						{heroImage ? (
							<Pressable
								onPress={() => setSelectedImage(heroImage)}
								className='h-full w-full'
							>
								<Image
									source={{ uri: heroImage.url }}
									className='h-full w-full'
									resizeMode='cover'
									accessibilityLabel={heroImage.alt_text || species.common_name}
								/>
							</Pressable>
						) : (
							<View className='h-full w-full items-center justify-center bg-niebla'>
								<HugeiconsIcon
									icon={UserGroupIcon}
									size={80}
									strokeWidth={1.8}
									color={colors.esmeralda}
								/>
							</View>
						)}

						<View
							className='absolute inset-0 bg-bosque/[0.08]'
							pointerEvents='none'
						/>
					</View>

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
								<View className='mt-7'>
									<Text className='text-[21px] font-bold text-tinta'>
										Datos de la especie
									</Text>

									<View className='mt-3.5 flex-row flex-wrap justify-between'>
										{species.habitat && (
											<View className='mb-3 w-[48.5%]'>
												<AppCard
													icon={Location01Icon}
													iconPosition='top'
													title='Hábitat'
													description={species.habitat}
													backgroundColor={colors.niebla}
													borderColor={colors.cardBorder}
													iconColor={colors.esmeralda}
													iconBackgroundColor={colors.hoja}
													textColor={colors.bosque}
													descriptionColor={colors.tinta}
													showArrow={false}
												/>
											</View>
										)}

										{species.origin && (
											<View className='mb-3 w-[48.5%]'>
												<AppCard
													icon={Plant01Icon}
													iconPosition='top'
													title='Origen'
													description={species.origin}
													backgroundColor={colors.niebla}
													borderColor={colors.cardBorder}
													iconColor={colors.esmeralda}
													iconBackgroundColor={colors.hoja}
													textColor={colors.bosque}
													descriptionColor={colors.tinta}
													showArrow={false}
												/>
											</View>
										)}

										{species.diet && (
											<View className='mb-3 w-[48.5%]'>
												<AppCard
													icon={Leaf01Icon}
													title='Alimentación'
													iconPosition='top'
													description={species.diet}
													backgroundColor={colors.niebla}
													borderColor={colors.cardBorder}
													iconColor={colors.esmeralda}
													iconBackgroundColor={colors.hoja}
													textColor={colors.bosque}
													descriptionColor={colors.tinta}
													showArrow={false}
												/>
											</View>
										)}

										{species.conservation_status && (
											<View className='mb-3 w-[48.5%]'>
												<AppCard
													icon={Shield01Icon}
													iconPosition='top'
													title='Conservación'
													description={species.conservation_status}
													backgroundColor={colors.hoja}
													borderColor={colors.cardBorder}
													iconColor={colors.esmeralda}
													iconBackgroundColor={colors.niebla}
													textColor={colors.bosque}
													descriptionColor={colors.tinta}
													showArrow={false}
												/>
											</View>
										)}
									</View>
								</View>

								{/* ETIQUETAS */}
								{species.tags.length > 0 && (
									<View className='mt-7'>
										<Text className='text-[21px] font-bold text-tinta'>
											Etiquetas
										</Text>

										<View className='mt-3.5 flex-row flex-wrap gap-2'>
											{species.tags.map((tag) => (
												<View
													key={tag.id}
													className='rounded-full border border-card-border bg-esmeralda px-3.5 py-2'
												>
													<Text className='text-xs font-semibold text-blanco'>
														{tag.name}
													</Text>
												</View>
											))}
										</View>
									</View>
								)}

								{/* GALERÍA */}
								{galleryImages.length > 0 && (
									<View className='mt-7'>
										<Text className='text-[21px] font-bold text-tinta'>
											Galería
										</Text>

										<ScrollView
											horizontal
											showsHorizontalScrollIndicator={false}
											className='-mx-4 mt-3.5'
											contentContainerClassName='px-5'
										>
											{galleryImages.map((image) => (
												<View
													key={image.id}
													className='mr-2.5 overflow-hidden rounded-[22px] border border-card-border bg-niebla'
													style={[
														subtleShadow,
														{
															width: SCREEN_WIDTH * 0.68,
															height: SCREEN_WIDTH * 0.48,
														},
													]}
												>
													<Pressable
														onPress={() => setSelectedImage(image)}
														className='h-full w-full active:opacity-[0.88]'
													>
														<Image
															source={{ uri: image.url }}
															className='h-full w-full'
															resizeMode='cover'
															accessibilityLabel={
																image.alt_text || species.common_name
															}
														/>
													</Pressable>
												</View>
											))}
										</ScrollView>
									</View>
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
			<Modal
				visible={selectedImage !== null}
				transparent
				animationType='fade'
				onRequestClose={() => setSelectedImage(null)}
			>
				<View className='flex-1 items-center justify-center bg-tinta/95'>
					<View className='absolute right-5 top-14 z-10 overflow-hidden rounded-full border border-card-border/35 bg-niebla/20'>
						<Pressable
							onPress={() => setSelectedImage(null)}
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
		</View>
	)
}
