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

const colors = {
	background: '#F7F9F8',
	primary: '#075C3B',
	primaryLight: '#16845D',
	card: '#DDF5EA',
	cardLight: '#E8F7F0',
	active: '#BDEED9',
	text: '#17372C',
	textSecondary: '#557067',
	border: '#B8E6D3',
	white: '#FFFFFF',
	coral: '#D95C4F',
	errorBackground: '#FFF3F1',
	errorBorder: '#F3D5D0',
	errorText: '#8C4037',
	mapBackground: '#F8E1DE',
	mapBorder: '#EFC2BC',
	overlay: 'rgba(0,0,0,0.45)',
}

const cardShadow = {
	shadowColor: '#075C3B',
	shadowOffset: {
		width: 0,
		height: 5,
	},
	shadowOpacity: 0.12,
	shadowRadius: 10,
	elevation: 4,
}

const subtleShadow = {
	shadowColor: '#075C3B',
	shadowOffset: {
		width: 0,
		height: 3,
	},
	shadowOpacity: 0.08,
	shadowRadius: 7,
	elevation: 2,
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
				imageStyle={{
					opacity: 0.9,
				}}
				style={{
					backgroundColor: colors.background,
				}}
			>
				<ActivityIndicator size='large' color={colors.primary} />

				<Text
					className='mt-4 text-sm font-medium'
					style={{
						color: colors.textSecondary,
					}}
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
				className='flex-1 px-5 pt-16'
				resizeMode='repeat'
				imageStyle={{
					opacity: 0.9,
				}}
				style={{
					backgroundColor: colors.background,
				}}
			>
				<View
					className='mb-8 self-start overflow-hidden rounded-2xl'
					style={{
						backgroundColor: colors.cardLight,
						borderWidth: 1,
						borderColor: colors.border,
						...subtleShadow,
					}}
				>
					<Pressable
						onPress={() => router.back()}
						className='flex-row items-center rounded-2xl px-4 py-3'
						style={({ pressed }) => ({
							backgroundColor: pressed ? colors.active : colors.cardLight,
						})}
					>
						<Text
							className='mr-1 text-xl font-bold'
							style={{
								color: colors.primary,
								lineHeight: 20,
							}}
						>
							‹
						</Text>

						<Text
							className='text-sm font-semibold'
							style={{
								color: colors.text,
							}}
						>
							Regresar
						</Text>
					</Pressable>
				</View>

				<View
					className='items-center rounded-[28px] border px-6 py-10'
					style={{
						backgroundColor: colors.errorBackground,
						borderColor: colors.errorBorder,
						...cardShadow,
					}}
				>
					<View
						className='h-16 w-16 items-center justify-center rounded-2xl'
						style={{
							backgroundColor: colors.errorBorder,
							borderWidth: 1,
							borderColor: colors.errorBorder,
						}}
					>
						<HugeiconsIcon
							icon={UserGroupIcon}
							size={34}
							strokeWidth={1.8}
							color={colors.errorText}
						/>
					</View>

					<Text
						className='mt-5 text-center text-lg font-bold'
						style={{
							color: colors.text,
						}}
					>
						No fue posible cargar la especie
					</Text>

					<Text
						className='mt-2 text-center text-sm leading-5'
						style={{
							color: colors.textSecondary,
						}}
					>
						{error ?? 'La información no está disponible en este momento.'}
					</Text>

					<View
						className='mt-6 overflow-hidden rounded-[20px]'
						style={{
							backgroundColor: colors.primary,
							...subtleShadow,
						}}
					>
						<Pressable
							onPress={loadSpecies}
							className='rounded-[20px] px-6 py-3.5'
							style={({ pressed }) => ({
								backgroundColor: pressed ? colors.primaryLight : colors.primary,
							})}
						>
							<Text
								className='font-bold'
								style={{
									color: colors.white,
								}}
							>
								Intentar nuevamente
							</Text>
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
				style={{
					backgroundColor: colors.background,
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
				<View
					className='relative'
					style={{
						backgroundColor: colors.background,
					}}
				>
					{/* =====================================================
                        HERO
                    ====================================================== */}

					<View
						className='h-[470px] w-full overflow-hidden'
						style={{
							backgroundColor: colors.card,
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
									backgroundColor: colors.card,
								}}
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
							style={{
								backgroundColor: 'rgba(7,92,59,0.08)',
							}}
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
								style={({ pressed }) => ({
									backgroundColor: pressed
										? colors.active
										: 'rgba(255,255,255,0.92)',
									...cardShadow,
								})}
							>
								<Text
									className='mr-1 text-xl font-bold'
									style={{
										color: colors.primary,
										lineHeight: 20,
									}}
								>
									‹
								</Text>

								<Text
									className='text-sm font-semibold'
									style={{
										color: colors.text,
									}}
								>
									Regresar
								</Text>
							</Pressable>
						</Animated.View>
					</View>

					{/* =====================================================
                        CARD PRINCIPAL
                    ====================================================== */}

					<Animated.View
						className='relative z-10 w-full overflow-hidden rounded-t-[30px]'
						style={{
							marginTop: cardMarginTop,
							backgroundColor: colors.cardLight,
							borderWidth: 1,
							borderColor: colors.border,
							...cardShadow,
						}}
					>
						{/* ZOO PATTERN DENTRO DE LA CARD */}

						<ImageBackground
							source={require('@/assets/images/zoo-pattern.png')}
							resizeMode='repeat'
							imageStyle={{
								opacity: 0.3,
							}}
							style={{
								backgroundColor: colors.background,
							}}
						>
							<View className='px-5 pb-8 pt-7'>
								{/* CATEGORÍA */}

								{species.category && (
									<View
										className='self-start rounded-full px-3.5 py-1.5'
										style={{
											backgroundColor: colors.active,
											borderWidth: 1,
											borderColor: colors.border,
										}}
									>
										<Text
											className='text-xs font-bold uppercase tracking-wide'
											style={{
												color: colors.primary,
											}}
										>
											{species.category.name}
										</Text>
									</View>
								)}

								{/* NOMBRE */}

								<Text
									className='mt-4 text-[30px] font-bold leading-9'
									style={{
										color: colors.text,
									}}
								>
									{species.common_name}
								</Text>

								{/* NOMBRE CIENTÍFICO */}

								{species.scientific_name && (
									<Text
										className='mt-1.5 text-base italic'
										style={{
											color: colors.textSecondary,
										}}
									>
										{species.scientific_name}
									</Text>
								)}

								{/* DESCRIPCIÓN */}

								{species.description && (
									<View className='mt-8'>
										<Text
											className='text-[21px] font-bold'
											style={{
												color: colors.primary,
											}}
										>
											Conoce a esta especie
										</Text>

										<Text
											className='mt-2 text-[15px] leading-7'
											style={{
												color: colors.textSecondary,
											}}
										>
											{species.description}
										</Text>
									</View>
								)}

								{/* DATOS */}

								<View className='mt-8'>
									<Text
										className='text-[21px] font-bold'
										style={{
											color: colors.primary,
										}}
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
											style={{
												color: colors.primary,
											}}
										>
											Etiquetas
										</Text>

										<View className='mt-4 flex-row flex-wrap gap-2'>
											{species.tags.map((tag) => (
												<View
													key={tag.id}
													className='rounded-full border px-4 py-2.5'
													style={{
														backgroundColor: colors.active,
														borderColor: colors.border,
													}}
												>
													<Text
														className='text-sm font-semibold'
														style={{
															color: colors.primary,
														}}
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
											style={{
												color: colors.primary,
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
													className='mr-3 overflow-hidden rounded-[22px]'
													style={{
														width: SCREEN_WIDTH * 0.68,
														height: SCREEN_WIDTH * 0.48,
														backgroundColor: colors.card,
														borderWidth: 1,
														borderColor: colors.border,
														...subtleShadow,
													}}
												>
													<Pressable
														onPress={() => setSelectedImage(image)}
														className='h-full w-full'
														style={({ pressed }) => ({
															opacity: pressed ? 0.88 : 1,
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

								<View className='h-2' />
							</View>
						</ImageBackground>
					</Animated.View>
				</View>
			</Animated.ScrollView>

			{/* =========================================================
                VISOR DE IMAGEN
            ========================================================== */}

			<Modal
				visible={selectedImage !== null}
				transparent
				animationType='fade'
				onRequestClose={() => setSelectedImage(null)}
			>
				<View
					className='flex-1 items-center justify-center'
					style={{
						backgroundColor: 'rgba(23,55,44,0.95)',
					}}
				>
					<View
						className='absolute right-5 top-14 z-10 overflow-hidden rounded-full'
						style={{
							backgroundColor: 'rgba(221,245,234,0.20)',
							borderWidth: 1,
							borderColor: 'rgba(189,238,217,0.35)',
						}}
					>
						<Pressable
							onPress={() => setSelectedImage(null)}
							className='rounded-full px-4 py-2.5'
							style={({ pressed }) => ({
								backgroundColor: pressed
									? 'rgba(189,238,217,0.30)'
									: 'rgba(221,245,234,0.20)',
							})}
						>
							<Text
								className='text-sm font-bold'
								style={{
									color: colors.white,
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
			style={{
				backgroundColor: accent ? colors.active : colors.white,
				borderColor: colors.border,
				...subtleShadow,
			}}
		>
			<Text
				className='text-[11px] font-bold uppercase tracking-wider'
				style={{
					color: accent ? colors.primary : colors.textSecondary,
				}}
			>
				{label}
			</Text>

			<Text
				className='mt-1.5 text-base font-medium leading-6'
				style={{
					color: colors.text,
				}}
			>
				{value}
			</Text>
		</View>
	)
}
