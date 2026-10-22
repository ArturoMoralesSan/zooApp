import { Search01Icon, UserGroupIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { router } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
	ActivityIndicator,
	ImageBackground,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import AppCard from '@/components/AppCard'
import BackButton from '@/components/BackButton'
import UserHeader from '@/components/UserHeader'
import { api } from '@/services/api'
import { getToken } from '@/services/auth'
import {
	backgroundImageStyle,
	backgroundStyle,
	colors,
	scrollContentStyle,
} from '@/styles/panel'
import styles from '@/styles/species'

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
			<SafeAreaView
				edges={['top', 'left', 'right']}
				style={{ flex: 1, backgroundColor: colors.background }}
			>
				<ImageBackground
					source={require('@/assets/images/zoo-pattern.png')}
					resizeMode='repeat'
					imageStyle={backgroundImageStyle}
					style={[backgroundStyle, { flex: 1 }]}
				>
					<View
						style={[
							styles.loadingContainer,
							{ flex: 1, backgroundColor: 'transparent' },
						]}
					>
						<ActivityIndicator size='large' color={colors.primary} />
						<Text style={[styles.loadingText, { color: colors.textSecondary }]}>
							Cargando especies...
						</Text>
					</View>
				</ImageBackground>
			</SafeAreaView>
		)
	}

	return (
		<SafeAreaView
			edges={['top', 'left', 'right']}
			style={{ flex: 1, backgroundColor: colors.background }}
		>
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				resizeMode='repeat'
				imageStyle={backgroundImageStyle}
				style={[backgroundStyle, { flex: 1 }]}
			>
				<ScrollView
					className='flex-1'
					contentContainerStyle={[scrollContentStyle, { flexGrow: 1 }]}
					keyboardShouldPersistTaps='handled'
					showsVerticalScrollIndicator={false}
				>
					<View style={{ marginBottom: 16 }}>
						<BackButton onPress={() => router.back()} position='relative' />
					</View>

					<UserHeader
						title='Especies'
						subtitle='Conoce a los habitantes del zoológico.'
						showRewards={false}
					/>

					{/* Buscador */}
					<View style={[styles.searchSection, { marginTop: 16 }]}>
						<Text style={[styles.searchLabel, { color: colors.text }]}>
							Buscar especie
						</Text>

						<View
							style={[
								styles.searchContainer,
								{
									backgroundColor: colors.white,
									borderColor: colors.border,
									borderWidth: 1,
								},
							]}
						>
							<View style={styles.searchIcon}>
								<HugeiconsIcon
									icon={Search01Icon}
									size={21}
									strokeWidth={1.8}
									color={colors.primary}
								/>
							</View>

							<TextInput
								value={search}
								onChangeText={setSearch}
								placeholder='Buscar especie...'
								placeholderTextColor={colors.textSecondary}
								autoCapitalize='none'
								autoCorrect={false}
								style={[styles.searchInput, { color: colors.text }]}
								selectionColor={colors.primary}
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
										{
											backgroundColor: active ? colors.primary : colors.white,
											borderColor: active ? colors.primary : colors.border,
										},
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
												{
													color: active ? colors.white : colors.text,
												},
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
						<Text
							style={[styles.resultsCount, { color: colors.textSecondary }]}
						>
							{filteredSpecies.length}{' '}
							{filteredSpecies.length === 1 ? 'especie' : 'especies'}
						</Text>

						{search.trim() !== '' && (
							<Pressable
								onPress={() => setSearch('')}
								style={({ pressed }) => [
									styles.clearButton,
									pressed && styles.clearButtonPressed,
								]}
							>
								<Text style={[styles.clearText, { color: colors.primary }]}>
									Limpiar
								</Text>
							</Pressable>
						)}
					</View>

					{/* Error de carga */}
					{error ? (
						<View
							style={[
								styles.errorCard,
								{
									backgroundColor: colors.errorBackground,
									borderColor: colors.errorBorder,
								},
							]}
						>
							<View
								style={[
									styles.errorIcon,
									{
										borderColor: colors.errorBorder,
									},
								]}
							>
								<Text
									style={[styles.errorIconText, { color: colors.errorText }]}
								>
									!
								</Text>
							</View>

							<Text style={[styles.errorTitle, { color: colors.errorText }]}>
								No fue posible cargar las especies.
							</Text>

							<Text style={[styles.errorText, { color: colors.textSecondary }]}>
								{error}
							</Text>

							<View
								style={[
									styles.retryButtonWrapper,
									{
										backgroundColor: colors.button,
										borderColor: colors.button,
									},
								]}
							>
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
						<View
							style={[
								styles.emptyCard,
								{
									backgroundColor: colors.card,
									borderColor: colors.border,
								},
							]}
						>
							<View
								style={[
									styles.emptyIcon,
									{
										backgroundColor: colors.active,
										borderColor: colors.border,
									},
								]}
							>
								<HugeiconsIcon
									icon={UserGroupIcon}
									size={30}
									strokeWidth={1.8}
									color={colors.primary}
								/>
							</View>

							<Text style={[styles.emptyTitle, { color: colors.text }]}>
								No encontramos especies
							</Text>

							<Text style={[styles.emptyText, { color: colors.textSecondary }]}>
								Intenta con otro nombre o cambia el filtro.
							</Text>
						</View>
					) : (
						/* Tarjetas de especies */
						<View style={styles.speciesList}>
							{filteredSpecies.map((item) => (
								<AppCard
									key={item.id}
									onPress={() => openSpecies(item.id)}
									image={item.image ? { uri: item.image } : undefined}
									imageHeight={210}
									title={item.common_name}
									description={[
										item.scientific_name,
										item.category?.name
											? `Categoría: ${item.category.name}`
											: null,
										item.description,
									]
										.filter(Boolean)
										.join('\n')}
									icon={!item.image ? UserGroupIcon : undefined}
									backgroundColor={colors.card}
									borderColor={colors.border}
									iconColor={colors.primary}
									iconBackgroundColor={colors.active}
									arrowColor={colors.white}
									arrowBackgroundColor={colors.primary}
									textColor={colors.text}
									descriptionColor={colors.textSecondary}
									showArrow
									style={{ marginBottom: 15 }}
								/>
							))}
						</View>
					)}

					<View style={styles.bottomSpace} />
				</ScrollView>
			</ImageBackground>
		</SafeAreaView>
	)
}
