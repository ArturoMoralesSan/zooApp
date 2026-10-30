import { UserGroupIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { router } from 'expo-router'
import { useMemo, useState } from 'react'
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	Text,
	View,
	type ViewStyle,
} from 'react-native'

import { ListCard } from '@/components/ui/ListCard'
import BackButton from '@/components/ui/BackButton'
import UserHeader from '@/components/UserHeader'
import { useSessionRedirect } from '@/hooks/useSessionRedirect'
import { useSpecies } from '@/hooks/useSpecies'
import colors from '@/theme/colors'
import { Chip } from '@/components/ui/Chip'
import { SearchField } from '@/components/ui/SearchField'
import { ScreenBackground } from '@/components/ui/ScreenBackground'

const PROP_COLORS = {
	primary: colors.esmeralda,
	text: colors.tinta,
} as const

const cardShadow: ViewStyle = {
	shadowColor: colors.esmeralda,
	shadowOffset: { width: 0, height: 5 },
	shadowOpacity: 0.12,
	shadowRadius: 10,
	elevation: 4,
}

const FILTERS = ['Todas', 'Mamíferos', 'Aves', 'Reptiles'] as const

type Filter = (typeof FILTERS)[number]

export default function SpeciesScreen() {
	const {
		data: species = [],
		error: loadError,
		isLoading: loading,
		refresh,
	} = useSpecies()
	const [search, setSearch] = useState('')
	const [filter, setFilter] = useState<Filter>('Todas')

	const error = loadError
		? loadError.message || 'No fue posible cargar las especies.'
		: ''

	useSessionRedirect()

	const filteredSpecies = useMemo(() => {
		const normalizedSearch = search.trim().toLowerCase()

		return species.filter((item) => {
			const matchesSearch =
				!normalizedSearch ||
				item.common_name.toLowerCase().includes(normalizedSearch) ||
				(item.scientific_name ?? '').toLowerCase().includes(normalizedSearch)

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
			<ScreenBackground>
				<View className='flex-1 items-center justify-center bg-transparent'>
					<ActivityIndicator size='large' color={PROP_COLORS.primary} />
					<Text className='text-body mt-3 text-tinta'>
						Cargando especies...
					</Text>
				</View>
			</ScreenBackground>
		)
	}

	return (
		<ScreenBackground>
			<ScrollView
				className='flex-1'
				contentContainerClassName='grow px-3 pb-[120px] pt-2'
				keyboardShouldPersistTaps='handled'
				showsVerticalScrollIndicator={false}
			>
				<View className='mb-4'>
					<BackButton onPress={() => router.back()} position='relative' />
				</View>

				<UserHeader
					title='Especies'
					subtitle='Conoce a los habitantes del zoológico.'
					showRewards={false}
				/>

				{/* Buscador */}
				<SearchField
					label='Buscar especie'
					className='mb-1 mt-4'
					value={search}
					onChangeText={setSearch}
					placeholder='Buscar especie...'
				/>

				{/* Filtros */}
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					className='-mx-0.5 mt-[15px] grow-0'
					contentContainerClassName='items-center pl-0.5 pr-5'
				>
					{FILTERS.map((item) => (
						<Chip
							key={item}
							label={item}
							selected={filter === item}
							onPress={() => setFilter(item)}
							className='mr-2'
						/>
					))}
				</ScrollView>

				{/* Resultados */}
				<View className='mb-0.5 mt-[19px] flex-row items-center justify-between'>
					<Text className='text-meta text-tinta'>
						{filteredSpecies.length}{' '}
						{filteredSpecies.length === 1 ? 'especie' : 'especies'}
					</Text>

					{search.trim() !== '' && (
						<Pressable
							onPress={() => setSearch('')}
							className='rounded-[14px] px-2.5 py-[7px] active:bg-hoja'
						>
							<Text className='font-sans-bold text-[13px] text-esmeralda'>
								Limpiar
							</Text>
						</Pressable>
					)}
				</View>

				{/* Error de carga */}
				{error ? (
					<View className='mt-[15px] items-center rounded-[22px] border border-card-border bg-niebla p-[18px]'>
						<View className='h-11 w-11 items-center justify-center rounded-[15px] border border-card-border bg-blanco'>
							<Text className='font-display-x text-[21px] text-tinta'>!</Text>
						</View>

						<Text className='text-h3 mt-3 text-center text-tinta'>
							No fue posible cargar las especies.
						</Text>

						<Text className='text-meta mt-1.5 text-center text-tinta'>
							{error}
						</Text>

						<View className='mt-[15px] h-12 w-full overflow-hidden rounded-2xl border border-esmeralda bg-esmeralda'>
							<Pressable
								onPress={() => void refresh()}
								className='h-full w-full items-center justify-center active:bg-bosque'
							>
								<View className='h-full w-full items-center justify-center'>
									<Text className='text-button text-center text-blanco'>
										Intentar nuevamente
									</Text>
								</View>
							</Pressable>
						</View>
					</View>
				) : filteredSpecies.length === 0 ? (
					/* Sin resultados */
					<View
						className='mt-[15px] items-center rounded-[25px] border border-card-border bg-niebla px-5 py-[35px]'
						style={cardShadow}
					>
						<View className='h-16 w-16 items-center justify-center rounded-[20px] border border-card-border bg-hoja'>
							<HugeiconsIcon
								icon={UserGroupIcon}
								size={30}
								strokeWidth={1.8}
								color={PROP_COLORS.primary}
							/>
						</View>

						<Text className='text-h2 mt-4 text-center text-tinta'>
							No encontramos especies
						</Text>

						<Text className='text-body mt-1.5 text-center text-tinta'>
							Intenta con otro nombre o cambia el filtro.
						</Text>
					</View>
				) : (
					/* Tarjetas de especies */
					<View className='mt-[15px]'>
						{filteredSpecies.map((item) => (
							<ListCard
								className='mb-3'
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
								showChevron
							/>
						))}
					</View>
				)}

				<View className='h-10' />
			</ScrollView>
		</ScreenBackground>
	)
}
