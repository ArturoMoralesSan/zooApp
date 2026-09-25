import { api } from '@/services/api'
import { getToken } from '@/services/auth'
import { UserGroupIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useMemo, useRef, useState } from 'react'
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

	const params = useLocalSearchParams<{
		id: string
	}>()

	const scrollY = useRef(new Animated.Value(0)).current

	const [species, setSpecies] = useState<Species | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [selectedImage, setSelectedImage] = useState<SpeciesImage | null>(null)

	useEffect(() => {
		void loadSpecies()
	}, [params.id])

	async function loadSpecies() {
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
			setError('No fue posible cargar la información de la especie.')
		} finally {
			setLoading(false)
		}
	}

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
		if (!species) {
			return null
		}

		return (
			species.images.find((image) => image.type === 'main') ??
			species.images.find((image) => image.type === 'thumbnail') ??
			species.images[0] ??
			null
		)
	}, [species])

	const galleryImages = useMemo(() => {
		if (!species) {
			return []
		}

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

				<Text className='mt-4 text-sm font-medium' style={styles.loadingText}>
					Cargando especie...
				</Text>
			</ImageBackground>
		)
	}

	if (error || !species) {
		return (
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				className='flex-1 px-5 pt-16'
				resizeMode='repeat'
				imageStyle={styles.patternImage}
				style={styles.errorBackground}
			>
				<View style={styles.errorBackWrapper}>
					<Pressable
						onPress={() => router.back()}
						className='flex-row items-center rounded-2xl px-4 py-3'
						style={({ pressed }) => [
							styles.errorBackButton,
							pressed && styles.errorBackButtonPressed,
						]}
					>
						<Text style={styles.errorBackArrow}>‹</Text>

						<Text style={styles.errorBackText}>Regresar</Text>
					</Pressable>
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

					<View style={styles.retryButtonWrapper}>
						<Pressable
							onPress={loadSpecies}
							className='rounded-[20px] px-6 py-3.5'
							style={({ pressed }) => [
								styles.retryButton,
								pressed && styles.retryButtonPressed,
							]}
						>
							<Text style={styles.retryButtonText}>Intentar nuevamente</Text>
						</Pressable>
					</View>
				</View>
			</ImageBackground>
		)
	}

	return (
		<>
			<Animated.ScrollView
				className='flex-1'
				style={styles.scrollView}
				showsVerticalScrollIndicator={false}
				scrollEventThrottle={16}
				onScroll={Animated.event(
					[
						{
							nativeEvent: {
								contentOffset: {
									y: scrollY,
								},
							},
						},
					],
					{
						useNativeDriver: false,
					},
				)}
			>
				<View className='relative' style={styles.mainBackground}>
					{/* HERO */}
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
									source={{
										uri: heroImage.url,
									}}
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

						{/* REGRESAR */}
						<Animated.View
							className='absolute left-5 top-14 z-20'
							style={{
								opacity: backButtonOpacity,
							}}
						>
							<Pressable
								onPress={() => router.back()}
								className='flex-row items-center rounded-full px-3.5 py-2.5'
								style={({ pressed }) => [
									styles.heroBackButton,
									pressed && styles.heroBackButtonPressed,
								]}
							>
								<Text style={styles.heroBackArrow}>‹</Text>

								<Text style={styles.heroBackText}>Regresar</Text>
							</Pressable>
						</Animated.View>
					</View>

					{/* CARD PRINCIPAL */}
					<Animated.View
						className='relative z-10 w-full overflow-hidden rounded-t-[30px]'
						style={[
							styles.mainCard,
							{
								marginTop: cardMarginTop,
							},
						]}
					>
						{/* ZOO PATTERN */}
						<ImageBackground
							source={require('@/assets/images/zoo-pattern.png')}
							resizeMode='repeat'
							imageStyle={styles.cardPatternImage}
							style={styles.cardBackground}
						>
							<View className='px-5 pb-8 pt-7'>
								{/* CATEGORÍA */}
								{species.category && (
									<View
										className='self-start rounded-full px-3.5 py-1.5'
										style={styles.categoryBadge}
									>
										<Text
											className='text-xs font-bold uppercase tracking-wide'
											style={styles.categoryText}
										>
											{species.category.name}
										</Text>
									</View>
								)}

								{/* NOMBRE */}
								<Text
									className='mt-4 text-[30px] font-bold leading-9'
									style={styles.speciesName}
								>
									{species.common_name}
								</Text>

								{/* NOMBRE CIENTÍFICO */}
								{species.scientific_name && (
									<Text
										className='mt-1.5 text-base italic'
										style={styles.scientificName}
									>
										{species.scientific_name}
									</Text>
								)}

								{/* DESCRIPCIÓN */}
								{species.description && (
									<View className='mt-8'>
										<Text
											className='text-[21px] font-bold'
											style={styles.sectionTitle}
										>
											Conoce a esta especie
										</Text>

										<Text
											className='mt-2 text-[15px] leading-7'
											style={styles.description}
										>
											{species.description}
										</Text>
									</View>
								)}

								{/* DATOS */}
								<View className='mt-8'>
									<Text
										className='text-[21px] font-bold'
										style={styles.sectionTitle}
									>
										Datos de la especie
									</Text>

									<View className='mt-4 gap-3'>
										{species.habitat && (
											<SpeciesDataCard
												label='Hábitat'
												value={species.habitat}
											/>
										)}

										{species.origin && (
											<SpeciesDataCard label='Origen' value={species.origin} />
										)}

										{species.diet && (
											<SpeciesDataCard
												label='Alimentación'
												value={species.diet}
											/>
										)}

										{species.conservation_status && (
											<SpeciesDataCard
												label='Conservación'
												value={species.conservation_status}
												accent
											/>
										)}
									</View>
								</View>

								{/* ETIQUETAS */}
								{species.tags.length > 0 && (
									<View className='mt-8'>
										<Text
											className='text-[21px] font-bold'
											style={styles.sectionTitle}
										>
											Etiquetas
										</Text>

										<View className='mt-4 flex-row flex-wrap gap-2'>
											{species.tags.map((tag) => (
												<View
													key={tag.id}
													className='rounded-full border px-4 py-2.5'
													style={styles.tag}
												>
													<Text
														className='text-sm font-semibold'
														style={styles.tagText}
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
									<View className='mt-8'>
										<Text
											className='text-[21px] font-bold'
											style={styles.sectionTitle}
										>
											Galería
										</Text>

										<ScrollView
											horizontal
											showsHorizontalScrollIndicator={false}
											className='-mx-5 mt-4'
											contentContainerStyle={styles.galleryContent}
										>
											{galleryImages.map((image) => (
												<View
													key={image.id}
													className='mr-3 overflow-hidden rounded-[22px]'
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
															source={{
																uri: image.url,
															}}
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

			{/* VISOR DE IMAGEN */}
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
							className='rounded-full px-4 py-2.5'
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
							source={{
								uri: selectedImage.url,
							}}
							className='h-[75%] w-full'
							resizeMode='contain'
							accessibilityLabel={selectedImage.alt_text || species.common_name}
						/>
					)}
				</View>
			</Modal>
		</>
	)
}

function SpeciesDataCard({
	label,
	value,
	accent = false,
}: {
	label: string
	value: string
	accent?: boolean
}) {
	return (
		<View
			className='rounded-[22px] border p-4'
			style={[styles.dataCard, accent && styles.dataCardAccent]}
		>
			<Text
				className='text-[11px] font-bold uppercase tracking-wider'
				style={[styles.dataLabel, accent && styles.dataLabelAccent]}
			>
				{label}
			</Text>

			<Text
				className='mt-1.5 text-base font-medium leading-6'
				style={styles.dataValue}
			>
				{value}
			</Text>
		</View>
	)
}
