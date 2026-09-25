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
	Text,
	TextInput,
	View,
} from 'react-native'

import { api } from '@/services/api'
import { getToken } from '@/services/auth'
import styles, { colors } from '@/styles/species'

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
					imageStyle={styles.patternImage}
				>
					<View style={styles.loadingContent}>
						<ActivityIndicator size='large' color={colors.primary} />

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
				imageStyle={styles.patternImage}
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
								color={colors.primary}
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
									color={colors.muted}
								/>
							</View>

							<TextInput
								value={search}
								onChangeText={setSearch}
								placeholder='Buscar especie...'
								placeholderTextColor={colors.muted}
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
						<View style={styles.emptyCard}>
							<View style={styles.emptyIcon}>
								<HugeiconsIcon
									icon={UserGroupIcon}
									size={30}
									strokeWidth={1.8}
									color={colors.primary}
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
								<View key={item.id} style={styles.speciesCard}>
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
													color={colors.primary}
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
														color={colors.primary}
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
