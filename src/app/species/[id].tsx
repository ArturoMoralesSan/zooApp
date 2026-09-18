import { UserGroupIcon } from '@hugeicons/core-free-icons'

import { HugeiconsIcon } from '@hugeicons/react-native'

import { useLocalSearchParams, useRouter } from 'expo-router'

import { useEffect, useMemo, useRef, useState } from 'react'

import {
	ActivityIndicator,
	Animated,
	Dimensions,
	Image,
	Modal,
	Pressable,
	ScrollView,
	Text,
	View,
} from 'react-native'

import { api } from '@/services/api'

import { getToken } from '@/services/auth'

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

const cardShadow = {
	shadowColor: '#000000',
	shadowOffset: {
		width: 0,
		height: 5,
	},
	shadowOpacity: 0.18,
	shadowRadius: 8,
	elevation: 1,
}

const subtleShadow = {
	shadowColor: '#064D36',
	shadowOffset: {
		width: 0,
		height: 1,
	},
	shadowOpacity: 0.04,
	shadowRadius: 4,
	elevation: 1,
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
		loadSpecies()
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

	/*
	 * =========================================================
	 * ANIMACIÓN DE LA CARD
	 * =========================================================
	 */

	const cardMarginTop = scrollY.interpolate({
		inputRange: [0, 180],
		outputRange: [-40, -220],
		extrapolate: 'clamp',
	})

	/*
	 * =========================================================
	 * BOTÓN REGRESAR
	 * =========================================================
	 */

	const backButtonOpacity = scrollY.interpolate({
		inputRange: [0, 80, 150],
		outputRange: [1, 0.6, 0],
		extrapolate: 'clamp',
	})

	/*
	 * =========================================================
	 * IMAGEN PRINCIPAL
	 * =========================================================
	 */

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

	/*
	 * =========================================================
	 * GALERÍA
	 * =========================================================
	 */

	const galleryImages = useMemo(() => {
		if (!species) {
			return []
		}

		return species.images.filter(
			(image) => image.type === 'gallery' && image.url !== heroImage?.url,
		)
	}, [species, heroImage])

	/*
	 * =========================================================
	 * LOADING
	 * =========================================================
	 */

	if (loading) {
		return (
			<View
				className='flex-1 items-center justify-center'
				style={{
					backgroundColor: '#F7F8F3',
				}}
			>
				<ActivityIndicator size='large' color='#087A5A' />

				<Text
					className='mt-4 text-sm'
					style={{
						color: '#6F8A7D',
					}}
				>
					Cargando especie...
				</Text>
			</View>
		)
	}

	/*
	 * =========================================================
	 * ERROR
	 * =========================================================
	 */

	if (error || !species) {
		return (
			<View
				className='flex-1 px-5 pt-16'
				style={{
					backgroundColor: '#F7F8F3',
				}}
			>
				<View
					className='mb-8 self-start rounded-2xl'
					style={{
						backgroundColor: '#FFFFFF',
						...cardShadow,
					}}
				>
					<Pressable
						onPress={() => router.back()}
						className='rounded-2xl px-4 py-2.5'
						style={({ pressed }) => ({
							backgroundColor: '#FFFFFF',
							opacity: pressed ? 0.75 : 1,
						})}
					>
						<Text
							className='text-base font-semibold'
							style={{
								color: '#087A5A',
							}}
						>
							← Regresar
						</Text>
					</Pressable>
				</View>

				<View
					className='items-center rounded-3xl border px-6 py-10'
					style={{
						backgroundColor: '#FFF1F0',
						borderColor: '#FFE3E1',
					}}
				>
					<View
						className='h-16 w-16 items-center justify-center rounded-2xl'
						style={{
							backgroundColor: '#FFE3E1',
						}}
					>
						<HugeiconsIcon
							icon={UserGroupIcon}
							size={34}
							strokeWidth={1.8}
							color='#C24141'
						/>
					</View>

					<Text
						className='mt-5 text-center text-lg font-bold'
						style={{
							color: '#123C32',
						}}
					>
						No fue posible cargar la especie
					</Text>

					<Text
						className='mt-2 text-center text-sm leading-5'
						style={{
							color: '#6F8A7D',
						}}
					>
						{error ?? 'La información no está disponible en este momento.'}
					</Text>

					<View
						className='mt-6 overflow-hidden rounded-2xl'
						style={{
							backgroundColor: '#087A5A',
						}}
					>
						<Pressable
							onPress={loadSpecies}
							className='rounded-2xl px-6 py-3'
							style={({ pressed }) => ({
								backgroundColor: pressed ? '#064D36' : '#087A5A',
							})}
						>
							<Text
								className='font-semibold'
								style={{
									color: '#FFFFFF',
								}}
							>
								Intentar nuevamente
							</Text>
						</Pressable>
					</View>
				</View>
			</View>
		)
	}

	return (
		<>
			<Animated.ScrollView
				className='flex-1'
				style={{
					backgroundColor: '#F7F8F3',
				}}
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
				{/*
				 * =====================================================
				 * FOTO PRINCIPAL
				 * =====================================================
				 */}

				<View
					className='relative'
					style={{
						backgroundColor: '#F7F8F3',
					}}
				>
					<View
						className='h-[470px] w-full overflow-hidden'
						style={{
							backgroundColor: '#DCEFE5',
						}}
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
								style={{
									backgroundColor: '#DCEFE5',
								}}
							>
								<HugeiconsIcon
									icon={UserGroupIcon}
									size={80}
									strokeWidth={1.8}
									color='#087A5A'
								/>
							</View>
						)}

						{/*
						 * =================================================
						 * BOTÓN REGRESAR
						 * =================================================
						 */}

						<Animated.View
							className='absolute left-5 top-14 rounded-2xl'
							style={{
								opacity: backButtonOpacity,
								backgroundColor: '#FFFFFF',
								...cardShadow,
							}}
						>
							<Pressable
								onPress={() => router.back()}
								className='rounded-2xl px-4 py-2.5'
								style={({ pressed }) => ({
									backgroundColor: '#FFFFFF',
									opacity: pressed ? 0.75 : 1,
								})}
							>
								<Text
									className='text-base font-semibold'
									style={{
										color: '#087A5A',
									}}
								>
									← Regresar
								</Text>
							</Pressable>
						</Animated.View>
					</View>

					{/*
					 * =====================================================
					 * CARD PRINCIPAL
					 * =====================================================
					 */}

					<Animated.View
						className='relative z-10 w-full overflow-hidden rounded-t-[30px] px-5 pb-8 pt-7'
						style={{
							marginTop: cardMarginTop,
							backgroundColor: '#FFFFFF',
						}}
					>
						{/*
						 * =================================================
						 * CATEGORÍA
						 * =================================================
						 */}

						{species.category && (
							<View
								className='self-start rounded-2xl px-3.5 py-1.5'
								style={{
									backgroundColor: '#DCEFE5',
								}}
							>
								<Text
									className='text-xs font-bold uppercase tracking-wide'
									style={{
										color: '#087A5A',
									}}
								>
									{species.category.name}
								</Text>
							</View>
						)}

						{/*
						 * =================================================
						 * NOMBRE
						 * =================================================
						 */}

						<Text
							className='mt-4 text-3xl font-extrabold leading-9'
							style={{
								color: '#123C32',
							}}
						>
							{species.common_name}
						</Text>

						{/*
						 * =================================================
						 * NOMBRE CIENTÍFICO
						 * =================================================
						 */}

						{species.scientific_name && (
							<Text
								className='mt-1.5 text-base italic'
								style={{
									color: '#6F8A7D',
								}}
							>
								{species.scientific_name}
							</Text>
						)}

						{/*
						 * =================================================
						 * DESCRIPCIÓN
						 * =================================================
						 */}

						{species.description && (
							<View className='mt-8'>
								<Text
									className='text-xl font-bold'
									style={{
										color: '#123C32',
									}}
								>
									Conoce a esta especie
								</Text>

								<Text
									className='mt-3 text-base leading-7'
									style={{
										color: '#6F8A7D',
									}}
								>
									{species.description}
								</Text>
							</View>
						)}

						{/*
						 * =================================================
						 * DATOS DE LA ESPECIE
						 * =================================================
						 */}

						<View className='mt-8'>
							<Text
								className='text-xl font-bold'
								style={{
									color: '#123C32',
								}}
							>
								Datos de la especie
							</Text>

							<View className='mt-4 gap-3'>
								{species.habitat && (
									<SpeciesDataCard label='Hábitat' value={species.habitat} />
								)}

								{species.origin && (
									<SpeciesDataCard label='Origen' value={species.origin} />
								)}

								{species.diet && (
									<SpeciesDataCard label='Alimentación' value={species.diet} />
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

						{/*
						 * =================================================
						 * ETIQUETAS
						 * =================================================
						 */}

						{species.tags.length > 0 && (
							<View className='mt-8'>
								<Text
									className='text-xl font-bold'
									style={{
										color: '#123C32',
									}}
								>
									Etiquetas
								</Text>

								<View className='mt-4 flex-row flex-wrap gap-2'>
									{species.tags.map((tag) => (
										<View
											key={tag.id}
											className='rounded-2xl border px-4 py-2.5'
											style={{
												backgroundColor: '#EEF4F0',
												borderColor: '#B8DCCA',
											}}
										>
											<Text
												className='text-sm font-semibold'
												style={{
													color: '#087A5A',
												}}
											>
												{tag.name}
											</Text>
										</View>
									))}
								</View>
							</View>
						)}

						{/*
						 * =================================================
						 * GALERÍA
						 * =================================================
						 */}

						{galleryImages.length > 0 && (
							<View className='mt-8'>
								<Text
									className='text-xl font-bold'
									style={{
										color: '#123C32',
									}}
								>
									Galería
								</Text>

								<ScrollView
									horizontal
									showsHorizontalScrollIndicator={false}
									className='-mx-5 mt-4'
									contentContainerStyle={{
										paddingHorizontal: 20,
									}}
								>
									{galleryImages.map((image) => (
										<View
											key={image.id}
											className='mr-3 overflow-hidden rounded-2xl'
											style={{
												width: SCREEN_WIDTH * 0.68,
												height: SCREEN_WIDTH * 0.48,
												backgroundColor: '#DCEFE5',
												...subtleShadow,
											}}
										>
											<Pressable
												onPress={() => setSelectedImage(image)}
												className='h-full w-full rounded-2xl'
												style={({ pressed }) => ({
													opacity: pressed ? 0.9 : 1,
												})}
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

						{/*
						 * =================================================
						 * ESPACIO FINAL
						 * =================================================
						 */}

						<View className='h-2' />
					</Animated.View>
				</View>
			</Animated.ScrollView>

			{/*
			 * =========================================================
			 * VISOR DE IMAGEN
			 * =========================================================
			 */}

			<Modal
				visible={selectedImage !== null}
				transparent
				animationType='fade'
				onRequestClose={() => setSelectedImage(null)}
			>
				<View
					className='flex-1 items-center justify-center'
					style={{
						backgroundColor: 'rgba(18,60,50,0.95)',
					}}
				>
					<View
						className='absolute right-5 top-14 z-10 overflow-hidden rounded-2xl'
						style={{
							backgroundColor: 'rgba(255,255,255,0.20)',
						}}
					>
						<Pressable
							onPress={() => setSelectedImage(null)}
							className='rounded-2xl px-4 py-2.5'
							style={({ pressed }) => ({
								backgroundColor: pressed
									? 'rgba(255,255,255,0.30)'
									: 'rgba(255,255,255,0.20)',
								opacity: pressed ? 0.75 : 1,
							})}
						>
							<Text
								className='text-base font-semibold'
								style={{
									color: '#FFFFFF',
								}}
							>
								Cerrar
							</Text>
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

/*
 * =============================================================
 * TARJETA DE DATOS
 * =============================================================
 */

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
			className='rounded-2xl border p-4'
			style={{
				backgroundColor: accent ? '#DCEFE5' : '#FFFFFF',
				borderColor: '#B8DCCA',
				...subtleShadow,
			}}
		>
			<Text
				className='text-xs font-bold uppercase tracking-wide'
				style={{
					color: accent ? '#087A5A' : '#6F8A7D',
				}}
			>
				{label}
			</Text>

			<Text
				className='mt-1.5 text-base font-medium leading-6'
				style={{
					color: '#123C32',
				}}
			>
				{value}
			</Text>
		</View>
	)
}
