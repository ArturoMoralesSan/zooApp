import {
	ArrowRight01Icon,
	Search01Icon,
	UserGroupIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { router } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
	ActivityIndicator,
	Image,
	ImageBackground,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from 'react-native'

import { api } from '@/services/api'
import { getToken } from '@/services/auth'

type SpeciesCategory = {
	id: number
	name: string
}

type Species = {
	id: number
	common_name: string
	scientific_name: string
	slug: string
	description: string | null
	category: SpeciesCategory | null
	image: string | null
}

type SpeciesResponse = {
	success: boolean
	data: {
		species: Species[]
	}
}

const FILTERS = ['Todas', 'Mamíferos', 'Aves', 'Reptiles'] as const

type Filter = (typeof FILTERS)[number]

const COLORS = {
	background: '#F7F9F8',

	primary: '#075C3B',
	primaryLight: '#16845D',
	dark: '#17372C',
	muted: '#557067',

	card: '#DDF5EA',
	cardLight: '#E8F7F0',
	active: '#BDEED9',
	border: '#B8E6D3',
	white: '#FFFFFF',

	coral: '#D95C4F',
	errorBackground: '#FFF3F1',
	errorBorder: '#F3D5D0',
	errorText: '#8C4037',

	mapBackground: '#F8E1DE',
	mapBorder: '#EFC2BC',

	button: '#246F4C',
	buttonPressed: '#1D5C3F',
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

export default function SpeciesScreen() {
	const [species, setSpecies] = useState<Species[]>([])
	const [search, setSearch] = useState('')
	const [filter, setFilter] = useState<Filter>('Todas')
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	const loadSpecies = useCallback(async () => {
		try {
			setLoading(true)
			setError('')

			const token = await getToken()

			if (!token) {
				router.replace('/login')
				return
			}

			const response = await api<SpeciesResponse>('/species', {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			setSpecies(response.data.species || [])
		} catch (error) {
			console.error('LOAD SPECIES ERROR:', error)

			setError(
				error instanceof Error
					? error.message
					: 'No fue posible cargar las especies.',
			)
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		void loadSpecies()
	}, [loadSpecies])

	const filteredSpecies = useMemo(() => {
		const normalizedSearch = search.trim().toLowerCase()

		return species.filter((item) => {
			const matchesSearch =
				!normalizedSearch ||
				item.common_name.toLowerCase().includes(normalizedSearch) ||
				item.scientific_name.toLowerCase().includes(normalizedSearch)

			const matchesFilter =
				filter === 'Todas' ||
				item.category?.name?.toLowerCase() === filter.toLowerCase()

			return matchesSearch && matchesFilter
		})
	}, [species, search, filter])

	const openSpecies = (speciesId: number) => {
		router.push(`/species/${speciesId}`)
	}

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ImageBackground
					source={require('@/assets/images/zoo-pattern.png')}
					style={styles.loadingBackground}
					resizeMode='repeat'
					imageStyle={{
						opacity: 0.3,
					}}
				>
					<View style={styles.loadingContent}>
						<ActivityIndicator size='large' color={COLORS.primary} />

						<Text style={styles.loadingText}>Cargando especies...</Text>
					</View>
				</ImageBackground>
			</View>
		)
	}

	return (
		<View style={styles.container}>
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				style={styles.background}
				resizeMode='repeat'
				imageStyle={{
					opacity: 0.3,
				}}
			>
				<ScrollView
					style={styles.scrollView}
					contentContainerStyle={styles.scrollContent}
					keyboardShouldPersistTaps='handled'
					showsVerticalScrollIndicator={false}
				>
					{/* Regresar */}
					<View style={styles.backButtonWrapper}>
						<Pressable
							onPress={() => router.back()}
							style={({ pressed }) => [
								styles.backButton,
								pressed && styles.backButtonPressed,
							]}
						>
							<Text style={styles.backText}>‹ Regresar</Text>
						</Pressable>
					</View>

					{/* Header */}
					<View style={styles.header}>
						<View style={styles.headerIcon}>
							<HugeiconsIcon
								icon={UserGroupIcon}
								size={26}
								strokeWidth={1.8}
								color={COLORS.primary}
							/>
						</View>

						<View style={styles.headerText}>
							<Text style={styles.title}>Especies</Text>

							<Text style={styles.subtitle}>
								Conoce a los habitantes del zoológico.
							</Text>
						</View>
					</View>

					{/* Buscador */}
					<View style={styles.searchSection}>
						<Text style={styles.searchLabel}>Buscar especie</Text>

						<View style={styles.searchContainer}>
							<View style={styles.searchIcon}>
								<HugeiconsIcon
									icon={Search01Icon}
									size={21}
									strokeWidth={1.8}
									color={COLORS.muted}
								/>
							</View>

							<TextInput
								value={search}
								onChangeText={setSearch}
								placeholder='Buscar especie...'
								placeholderTextColor={COLORS.muted}
								autoCapitalize='none'
								autoCorrect={false}
								style={styles.searchInput}
							/>
						</View>
					</View>

					{/* Filtros */}
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						style={styles.filtersScroll}
						contentContainerStyle={styles.filtersContent}
					>
						{FILTERS.map((item) => {
							const active = filter === item

							return (
								<View
									key={item}
									style={[
										styles.filterWrapper,
										active && styles.filterWrapperActive,
									]}
								>
									<Pressable
										onPress={() => setFilter(item)}
										style={({ pressed }) => [
											styles.filterButton,
											active && styles.filterButtonActive,
											pressed && styles.filterButtonPressed,
										]}
									>
										<Text
											style={[
												styles.filterText,
												active && styles.filterTextActive,
											]}
										>
											{item}
										</Text>
									</Pressable>
								</View>
							)
						})}
					</ScrollView>

					{/* Resultados */}
					<View style={styles.resultsHeader}>
						<Text style={styles.resultsCount}>
							{filteredSpecies.length}{' '}
							{filteredSpecies.length === 1 ? 'especie' : 'especies'}
						</Text>

						{search.trim() && (
							<Pressable
								onPress={() => setSearch('')}
								style={({ pressed }) => [
									styles.clearButton,
									pressed && styles.clearButtonPressed,
								]}
							>
								<Text style={styles.clearText}>Limpiar</Text>
							</Pressable>
						)}
					</View>

					{/* Error */}
					{error ? (
						<View style={styles.errorCard}>
							<View style={styles.errorIcon}>
								<Text style={styles.errorIconText}>!</Text>
							</View>

							<Text style={styles.errorTitle}>
								No fue posible cargar las especies.
							</Text>

							<Text style={styles.errorText}>{error}</Text>

							<View style={styles.retryButtonWrapper}>
								<Pressable
									onPress={() => void loadSpecies()}
									style={({ pressed }) => [
										styles.retryButton,
										pressed && styles.retryButtonPressed,
									]}
								>
									<View style={styles.retryButtonContent}>
										<Text style={styles.retryButtonText}>
											Intentar nuevamente
										</Text>
									</View>
								</Pressable>
							</View>
						</View>
					) : filteredSpecies.length === 0 ? (
						/* Sin resultados */
						<View style={[styles.emptyCard, cardShadow]}>
							<View style={styles.emptyIcon}>
								<HugeiconsIcon
									icon={UserGroupIcon}
									size={30}
									strokeWidth={1.8}
									color={COLORS.primary}
								/>
							</View>

							<Text style={styles.emptyTitle}>No encontramos especies</Text>

							<Text style={styles.emptyText}>
								Intenta con otro nombre o cambia el filtro.
							</Text>
						</View>
					) : (
						/* Lista */
						<View style={styles.speciesList}>
							{filteredSpecies.map((item) => (
								<View key={item.id} style={[styles.speciesCard, cardShadow]}>
									<Pressable
										onPress={() => openSpecies(item.id)}
										style={({ pressed }) => [
											styles.speciesPressable,
											pressed && styles.speciesPressed,
										]}
									>
										{item.image ? (
											<Image
												source={{
													uri: item.image,
												}}
												style={styles.speciesImage}
												resizeMode='cover'
											/>
										) : (
											<View style={styles.speciesImagePlaceholder}>
												<HugeiconsIcon
													icon={UserGroupIcon}
													size={48}
													strokeWidth={1.8}
													color={COLORS.primary}
												/>
											</View>
										)}

										<View style={styles.speciesContent}>
											<View style={styles.speciesTitleRow}>
												<View style={styles.speciesNameContainer}>
													<Text style={styles.speciesName} numberOfLines={2}>
														{item.common_name}
													</Text>

													<Text style={styles.scientificName} numberOfLines={1}>
														{item.scientific_name}
													</Text>
												</View>

												<View style={styles.arrowContainer}>
													<HugeiconsIcon
														icon={ArrowRight01Icon}
														size={20}
														strokeWidth={1.8}
														color={COLORS.primary}
													/>
												</View>
											</View>

											{/* Categoría */}
											{item.category?.name && (
												<View style={styles.categoryBadge}>
													<Text style={styles.categoryText}>
														{item.category.name}
													</Text>
												</View>
											)}

											{/* Descripción */}
											{item.description && (
												<Text style={styles.description} numberOfLines={3}>
													{item.description}
												</Text>
											)}

											<Text style={styles.viewInfo}>Ver información</Text>
										</View>
									</Pressable>
								</View>
							))}
						</View>
					)}

					<View style={styles.bottomSpace} />
				</ScrollView>
			</ImageBackground>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
	},

	background: {
		flex: 1,
	},

	scrollView: {
		flex: 1,
	},

	scrollContent: {
		paddingHorizontal: 20,
		paddingTop: 55,
		paddingBottom: 40,
	},

	loadingContainer: {
		flex: 1,
		backgroundColor: COLORS.background,
	},

	loadingBackground: {
		flex: 1,
	},

	loadingContent: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},

	loadingText: {
		marginTop: 12,
		fontSize: 15,
		fontWeight: '600',
		color: COLORS.muted,
	},

	/* ─────────────────────────
	   REGRESAR
	───────────────────────── */

	backButtonWrapper: {
		alignSelf: 'flex-start',
		marginBottom: 17,
	},

	backButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(247,249,248,0.94)',
		borderWidth: 1,
		borderColor: COLORS.border,
		borderRadius: 18,
		paddingHorizontal: 16,
		paddingVertical: 10,
		...cardShadow,
	},

	backButtonPressed: {
		opacity: 0.75,
		backgroundColor: COLORS.card,
	},

	backText: {
		fontSize: 15,
		fontWeight: '700',
		color: COLORS.dark,
	},

	/* ─────────────────────────
	   HEADER
	───────────────────────── */

	header: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 22,
	},

	headerIcon: {
		width: 52,
		height: 52,
		borderRadius: 17,
		backgroundColor: COLORS.active,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: COLORS.border,
	},

	headerText: {
		flex: 1,
		marginLeft: 13,
	},

	title: {
		fontSize: 27,
		fontWeight: '900',
		color: COLORS.dark,
	},

	subtitle: {
		marginTop: 4,
		fontSize: 14,
		lineHeight: 20,
		color: COLORS.muted,
	},

	/* ─────────────────────────
	   BUSCADOR
	───────────────────────── */

	searchSection: {
		marginBottom: 4,
	},

	searchLabel: {
		marginBottom: 8,
		fontSize: 14,
		fontWeight: '800',
		color: COLORS.dark,
	},

	searchContainer: {
		height: 54,
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: COLORS.cardLight,
		borderWidth: 1,
		borderColor: COLORS.border,
		borderRadius: 18,
	},

	searchIcon: {
		paddingLeft: 16,
		alignItems: 'center',
		justifyContent: 'center',
	},

	searchInput: {
		flex: 1,
		paddingHorizontal: 12,
		paddingVertical: 0,
		fontSize: 15,
		color: COLORS.dark,
	},

	/* ─────────────────────────
	   FILTROS / TAGS
	───────────────────────── */

	filtersScroll: {
		marginTop: 15,
		marginHorizontal: -2,
	},

	filtersContent: {
		paddingHorizontal: 2,
		paddingRight: 20,
		alignItems: 'center',
	},

	filterWrapper: {
		marginRight: 9,
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: 999,
		backgroundColor: COLORS.white,
		borderWidth: 1,
		borderColor: COLORS.border,
		overflow: 'hidden',
	},

	filterWrapperActive: {
		backgroundColor: COLORS.primary,
		borderColor: COLORS.primary,
	},

	filterButton: {
		alignItems: 'center',
		justifyContent: 'center',
	},

	filterButtonActive: {
		backgroundColor: 'transparent',
	},

	filterButtonPressed: {
		opacity: 0.72,
	},

	filterText: {
		fontSize: 13,
		fontWeight: '800',
		color: COLORS.dark,
	},

	filterTextActive: {
		color: COLORS.white,
	},

	/* ─────────────────────────
	   RESULTADOS
	───────────────────────── */

	resultsHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginTop: 19,
		marginBottom: 2,
	},

	resultsCount: {
		fontSize: 13,
		fontWeight: '800',
		color: COLORS.muted,
	},

	clearButton: {
		paddingHorizontal: 10,
		paddingVertical: 7,
		borderRadius: 14,
	},

	clearButtonPressed: {
		backgroundColor: COLORS.active,
	},

	clearText: {
		fontSize: 13,
		fontWeight: '800',
		color: COLORS.primary,
	},

	/* ─────────────────────────
	   ERROR
	───────────────────────── */

	errorCard: {
		marginTop: 15,
		padding: 18,
		backgroundColor: COLORS.errorBackground,
		borderWidth: 1,
		borderColor: COLORS.errorBorder,
		borderRadius: 22,
		alignItems: 'center',
	},

	errorIcon: {
		width: 44,
		height: 44,
		borderRadius: 15,
		backgroundColor: COLORS.white,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: COLORS.errorBorder,
	},

	errorIconText: {
		fontSize: 21,
		fontWeight: '900',
		color: COLORS.errorText,
	},

	errorTitle: {
		marginTop: 12,
		fontSize: 15,
		fontWeight: '900',
		color: COLORS.errorText,
		textAlign: 'center',
	},

	errorText: {
		marginTop: 6,
		fontSize: 12,
		lineHeight: 18,
		color: COLORS.muted,
		textAlign: 'center',
	},

	retryButtonWrapper: {
		width: '100%',
		height: 48,
		marginTop: 15,
		borderRadius: 16,
		backgroundColor: COLORS.button,
		borderWidth: 1,
		borderColor: COLORS.button,
		overflow: 'hidden',
	},

	retryButton: {
		width: '100%',
		height: '100%',
		alignItems: 'center',
		justifyContent: 'center',
	},

	retryButtonContent: {
		width: '100%',
		height: '100%',
		alignItems: 'center',
		justifyContent: 'center',
	},

	retryButtonPressed: {
		backgroundColor: COLORS.buttonPressed,
	},

	retryButtonText: {
		fontSize: 14,
		fontWeight: '900',
		color: COLORS.white,
		textAlign: 'center',
	},

	/* ─────────────────────────
	   SIN RESULTADOS
	───────────────────────── */

	emptyCard: {
		marginTop: 15,
		paddingHorizontal: 20,
		paddingVertical: 35,
		backgroundColor: COLORS.cardLight,
		borderWidth: 1,
		borderColor: COLORS.border,
		borderRadius: 25,
		alignItems: 'center',
	},

	emptyIcon: {
		width: 64,
		height: 64,
		borderRadius: 20,
		backgroundColor: COLORS.active,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: COLORS.border,
	},

	emptyTitle: {
		marginTop: 16,
		fontSize: 18,
		fontWeight: '900',
		color: COLORS.dark,
		textAlign: 'center',
	},

	emptyText: {
		marginTop: 6,
		fontSize: 13,
		lineHeight: 19,
		color: COLORS.muted,
		textAlign: 'center',
	},

	/* ─────────────────────────
	   ESPECIES
	───────────────────────── */

	speciesList: {
		marginTop: 15,
	},

	speciesCard: {
		width: '100%',
		marginBottom: 15,
		backgroundColor: COLORS.cardLight,
		borderRadius: 25,
		borderWidth: 1,
		borderColor: COLORS.border,
		overflow: 'hidden',
	},

	speciesPressable: {
		width: '100%',
		backgroundColor: COLORS.cardLight,
		borderRadius: 25,
		overflow: 'hidden',
	},

	speciesPressed: {
		opacity: 0.94,
	},

	speciesImage: {
		width: '100%',
		height: 210,
	},

	speciesImagePlaceholder: {
		width: '100%',
		height: 210,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: COLORS.active,
	},

	speciesContent: {
		padding: 18,
	},

	speciesTitleRow: {
		flexDirection: 'row',
		alignItems: 'flex-start',
	},

	speciesNameContainer: {
		flex: 1,
		paddingRight: 12,
	},

	speciesName: {
		fontSize: 20,
		lineHeight: 25,
		fontWeight: '900',
		color: COLORS.dark,
	},

	scientificName: {
		marginTop: 4,
		fontSize: 13,
		fontStyle: 'italic',
		color: COLORS.muted,
	},

	arrowContainer: {
		width: 42,
		height: 42,
		borderRadius: 15,
		backgroundColor: COLORS.active,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: COLORS.border,
	},

	categoryBadge: {
		alignSelf: 'flex-start',
		marginTop: 14,
		paddingHorizontal: 11,
		paddingVertical: 6,
		borderRadius: 13,
		backgroundColor: COLORS.active,
		borderWidth: 1,
		borderColor: COLORS.border,
	},

	categoryText: {
		fontSize: 11,
		fontWeight: '800',
		color: COLORS.dark,
	},

	description: {
		marginTop: 12,
		fontSize: 13,
		lineHeight: 19,
		color: COLORS.muted,
	},

	viewInfo: {
		marginTop: 14,
		fontSize: 13,
		fontWeight: '900',
		color: COLORS.primary,
	},

	bottomSpace: {
		height: 40,
	},
})
