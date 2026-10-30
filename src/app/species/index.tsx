import { Alert02Icon, UserGroupIcon } from '@hugeicons/core-free-icons'
import { router } from 'expo-router'
import { useMemo, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'

import { ListCard } from '@/components/ui/ListCard'
import BackButton from '@/components/ui/BackButton'
import { ScreenHeader } from '@/components/ui/TabHeader'
import { useSessionRedirect } from '@/hooks/useSessionRedirect'
import { useSpecies } from '@/hooks/useSpecies'
import colors from '@/theme/colors'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { KeyboardScrollView } from '@/components/ui/KeyboardScrollView'
import { Chip } from '@/components/ui/Chip'
import { IconBox } from '@/components/ui/IconBox'
import { TextLink } from '@/components/ui/TextLink'
import { SearchField } from '@/components/ui/SearchField'
import { ScreenBackground } from '@/components/ui/ScreenBackground'

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
					<ActivityIndicator size='large' color={colors.esmeralda} />
					<Text className='text-body mt-3 text-tinta'>
						Cargando especies...
					</Text>
				</View>
			</ScreenBackground>
		)
	}

	return (
		<ScreenBackground>
			<KeyboardScrollView
				className='flex-1'
				contentContainerClassName='grow px-3 pb-[120px] pt-2'
			>
				<View className='mb-4'>
					<BackButton onPress={() => router.back()} position='relative' />
				</View>

				<ScreenHeader
					title='Especies'
					subtitle='Conoce a los habitantes del zoológico.'
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
					className='-mx-0.5 mt-4 grow-0'
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
				<View className='mt-4 h-10 flex-row items-center justify-between'>
					<Text className='text-meta text-tinta'>
						{filteredSpecies.length}{' '}
						{filteredSpecies.length === 1 ? 'especie' : 'especies'}
					</Text>

					{search.trim() !== '' && (
						<TextLink label='Limpiar' onPress={() => setSearch('')} />
					)}
				</View>

				{/* Error de carga */}
				{error ? (
					<Card className='mt-4 items-center'>
						<IconBox icon={Alert02Icon} size='lg' tone='danger' />

						<Text className='text-h3 mt-3 text-center text-tinta'>
							No fue posible cargar las especies.
						</Text>

						<Text className='text-meta mt-1.5 text-center'>{error}</Text>

						<Button
							title='Intentar nuevamente'
							variant='secondary'
							onPress={() => void refresh()}
							className='mt-4'
						/>
					</Card>
				) : filteredSpecies.length === 0 ? (
					/* Sin resultados */
					<Card className='mt-4 items-center py-8'>
						<IconBox icon={UserGroupIcon} size='lg' />

						<Text className='text-h2 mt-4 text-center text-tinta'>
							No encontramos especies
						</Text>

						<Text className='text-body mt-1.5 text-center text-tinta-2'>
							Intenta con otro nombre o cambia el filtro.
						</Text>
					</Card>
				) : (
					/* Tarjetas de especies */
					<View className='mt-4'>
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
			</KeyboardScrollView>
		</ScreenBackground>
	)
}
