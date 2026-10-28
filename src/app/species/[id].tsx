import AppCard from '@/components/AppCard'
import BackButton from '@/components/BackButton'
import { api } from '@/services/api'
import { getToken } from '@/services/auth'
import {
	Leaf01Icon,
	Location01Icon,
	Plant01Icon,
	Shield01Icon,
	UserGroupIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
} from 'react-native'

import { colors as panelColors } from '@/styles/panel'
import styles, { colors } from '@/styles/species-detail'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

type SpeciesImage = {
	id: number
	type: 'main' | 'thumbnail' | 'gallery' | string
	url: string
	alt_text: string | null
	sort_order: number
}

type SpeciesCategory = {
	id: number
	name: string
}

type SpeciesTag = {
	id: number
	name: string
	slug: string
}

type Species = {
	id: number
	common_name: string
	scientific_name: string | null
	slug: string
	description: string | null
	habitat: string | null
	origin: string | null
	diet: string | null
	conservation_status: string | null
	category: SpeciesCategory | null
	tags: SpeciesTag[]
	images: SpeciesImage[]
}

type SpeciesResponse = {
	success: boolean
	data: {
		species: Species
	}
}

export default function SpeciesDetailScreen() {
	const router = useRouter()
	const params = useLocalSearchParams<{ id: string }>()

	const scrollY = useRef(new Animated.Value(0)).current

	const [species, setSpecies] = useState<Species | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [selectedImage, setSelectedImage] = useState<SpeciesImage | null>(null)

	const loadSpecies = useCallback(async () => {
		try {
			setLoading(true)
			setError(null)

			const token = await getToken()

			if (!token) {
				router.replace('/login')
				return
			}

			const response = await api<SpeciesResponse>(`/species/${params.id}`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (!response.success || !response.data?.species) {
				throw new Error('No fue posible obtener la información de la especie.')
			}

			setSpecies(response.data.species)
		} catch (err) {
			console.error(err)
			setError(
				err instanceof Error
					? err.message
					: 'No fue posible cargar la información de la especie.',
			)
		} finally {
			setLoading(false)
		}
	}, [params.id, router])

	useEffect(() => {
		void loadSpecies()
	}, [loadSpecies])

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
				className='flex-1 items-center justify-center'
				resizeMode='repeat'
				imageStyle={styles.patternImage}
				style={styles.loadingBackground}
			>
				<ActivityIndicator size='large' color={colors.primary} />

				<Text
					className='mt-3.5 text-[12.25px] font-medium leading-[17.5px]'
					style={styles.loadingText}
				>
					Cargando especie...
				</Text>
			</ImageBackground>
		)
	}

	if (error || !species) {
		return (
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				className='flex-1 px-[17.5px] pt-14'
				resizeMode='repeat'
				imageStyle={styles.patternImage}
				style={styles.errorBackground}
			>
				<View style={{ zIndex: 100, elevation: 100 }}>
					<BackButton onPress={() => router.back()} />
				</View>

				<View style={styles.errorCard}>
					<View style={styles.errorIcon}>
						<HugeiconsIcon
							icon={UserGroupIcon}
							size={34}
							strokeWidth={1.8}
							color={colors.errorText}
						/>
					</View>

					<Text style={styles.errorTitle}>
						No fue posible cargar la especie
					</Text>

					<Text style={styles.errorMessage}>
						{error ?? 'La información no está disponible en este momento.'}
					</Text>

					<Pressable
						onPress={() => void loadSpecies()}
						className='mt-3.5 self-start rounded-[20px] px-[21px] py-[12.25px]'
						style={({ pressed }) => [
							styles.retryButton,
							pressed && styles.retryButtonPressed,
						]}
					>
						<Text style={styles.retryButtonText}>Intentar nuevamente</Text>
					</Pressable>
				</View>
			</ImageBackground>
		)
	}

	return (
		<View style={{ flex: 1, position: 'relative' }}>
			<Animated.ScrollView
				className='flex-1'
				style={styles.scrollView}
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
				<View className='relative' style={styles.mainBackground}>
					{/* IMAGEN PRINCIPAL */}
					<View
						className='h-[470px] w-full overflow-hidden'
						style={styles.heroContainer}
					>
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
							<View
								className='h-full w-full items-center justify-center'
								style={styles.heroPlaceholder}
							>
								<HugeiconsIcon
									icon={UserGroupIcon}
									size={80}
									strokeWidth={1.8}
									color={colors.primary}
								/>
							</View>
						)}

						<View
							className='absolute inset-0'
							pointerEvents='none'
							style={styles.heroOverlay}
						/>
					</View>

					{/* CONTENIDO */}
					<Animated.View
						className='relative z-10 w-full overflow-hidden rounded-t-[30px]'
						style={[styles.mainCard, { marginTop: cardMarginTop }]}
					>
						<ImageBackground
							source={require('@/assets/images/zoo-pattern.png')}
							resizeMode='repeat'
							imageStyle={styles.cardPatternImage}
							style={styles.cardBackground}
						>
							<View className='px-[17.5px] pb-7 pt-[24.5px]'>
								{/* CATEGORÍA */}
								{species.category && (
									<View
										className='self-start rounded-full px-[12.25px] py-[5.25px]'
										style={styles.categoryBadge}
									>
										<Text
											className='text-[10.5px] font-bold uppercase leading-[14px] tracking-wide'
											style={styles.categoryText}
										>
											{species.category.name}
										</Text>
									</View>
								)}

								{/* NOMBRE */}
								<Text
									className='mt-3.5 text-[30px] font-bold leading-[31.5px]'
									style={styles.speciesName}
								>
									{species.common_name}
								</Text>

								{species.scientific_name && (
									<Text
										className='mt-[5.25px] text-[14px] italic leading-[21px]'
										style={styles.scientificName}
									>
										{species.scientific_name}
									</Text>
								)}

								{/* DESCRIPCIÓN */}
								{species.description && (
									<View className='mt-7'>
										<Text
											className='text-[21px] font-bold'
											style={styles.sectionTitle}
										>
											Conoce a esta especie
										</Text>

										<Text
											className='mt-[7px] text-[15px] leading-[24.5px]'
											style={styles.description}
										>
											{species.description}
										</Text>
									</View>
								)}

								{/* DATOS DE LA ESPECIE */}
								<View className='mt-7'>
									<Text
										className='text-[21px] font-bold'
										style={styles.sectionTitle}
									>
										Datos de la especie
									</Text>

									<View
										className='mt-3.5'
										style={{
											flexDirection: 'row',
											flexWrap: 'wrap',
											justifyContent: 'space-between',
										}}
									>
										{species.habitat && (
											<View style={{ width: '48.5%', marginBottom: 12 }}>
												<AppCard
													icon={Location01Icon}
													iconPosition='top'
													title='Hábitat'
													description={species.habitat}
													backgroundColor={panelColors.card}
													borderColor={panelColors.border}
													iconColor={panelColors.primary}
													iconBackgroundColor={panelColors.active}
													textColor={panelColors.primaryDark}
													descriptionColor={panelColors.textSecondary}
													showArrow={false}
												/>
											</View>
										)}

										{species.origin && (
											<View style={{ width: '48.5%', marginBottom: 12 }}>
												<AppCard
													icon={Plant01Icon}
													iconPosition='top'
													title='Origen'
													description={species.origin}
													backgroundColor={panelColors.card}
													borderColor={panelColors.border}
													iconColor={panelColors.primary}
													iconBackgroundColor={panelColors.active}
													textColor={panelColors.primaryDark}
													descriptionColor={panelColors.textSecondary}
													showArrow={false}
												/>
											</View>
										)}

										{species.diet && (
											<View style={{ width: '48.5%', marginBottom: 12 }}>
												<AppCard
													icon={Leaf01Icon}
													title='Alimentación'
													iconPosition='top'
													description={species.diet}
													backgroundColor={panelColors.card}
													borderColor={panelColors.border}
													iconColor={panelColors.primary}
													iconBackgroundColor={panelColors.active}
													textColor={panelColors.primaryDark}
													descriptionColor={panelColors.textSecondary}
													showArrow={false}
												/>
											</View>
										)}

										{species.conservation_status && (
											<View style={{ width: '48.5%', marginBottom: 12 }}>
												<AppCard
													icon={Shield01Icon}
													iconPosition='top'
													title='Conservación'
													description={species.conservation_status}
													backgroundColor={panelColors.active}
													borderColor={panelColors.border}
													iconColor={panelColors.primary}
													iconBackgroundColor={panelColors.card}
													textColor={panelColors.primaryDark}
													descriptionColor={panelColors.textSecondary}
													showArrow={false}
												/>
											</View>
										)}
									</View>
								</View>

								{/* ETIQUETAS */}
								{species.tags.length > 0 && (
									<View className='mt-7'>
										<Text
											className='text-[21px] font-bold'
											style={styles.sectionTitle}
										>
											Etiquetas
										</Text>

										<View className='mt-3.5 flex-row flex-wrap gap-[7px]'>
											{species.tags.map((tag) => (
												<View
													key={tag.id}
													className='rounded-full border px-3.5 py-[8.75px]'
													style={{
														backgroundColor: panelColors.primary,
														borderColor: panelColors.border,
													}}
												>
													<Text
														className='text-[12.25px] font-semibold leading-[17.5px]'
														style={{ color: panelColors.white }}
													>
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
										<Text
											className='text-[21px] font-bold'
											style={styles.sectionTitle}
										>
											Galería
										</Text>

										<ScrollView
											horizontal
											showsHorizontalScrollIndicator={false}
											className='-mx-[17.5px] mt-3.5'
											contentContainerStyle={styles.galleryContent}
										>
											{galleryImages.map((image) => (
												<View
													key={image.id}
													className='mr-[10.5px] overflow-hidden rounded-[22px]'
													style={[
														styles.galleryItem,
														{
															width: SCREEN_WIDTH * 0.68,
															height: SCREEN_WIDTH * 0.48,
														},
													]}
												>
													<Pressable
														onPress={() => setSelectedImage(image)}
														className='h-full w-full'
														style={({ pressed }) => [
															styles.galleryPressable,
															pressed && styles.galleryPressed,
														]}
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

								<View className='h-[7px]' />
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
				<View
					className='flex-1 items-center justify-center'
					style={styles.modalContainer}
				>
					<View style={styles.modalCloseWrapper}>
						<Pressable
							onPress={() => setSelectedImage(null)}
							className='rounded-full px-3.5 py-[8.75px]'
							style={({ pressed }) => [
								styles.modalCloseButton,
								pressed && styles.modalCloseButtonPressed,
							]}
						>
							<Text style={styles.modalCloseText}>Cerrar</Text>
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
