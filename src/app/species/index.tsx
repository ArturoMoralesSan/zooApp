import { UserGroupIcon } from '@hugeicons/core-free-icons'
import { router } from 'expo-router'
import { useMemo, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'

import { SpeciesCard } from '@/components/species/SpeciesCard'
import { QueryView } from '@/components/ui/QueryView'
import { ScreenHeader } from '@/components/ui/TabHeader'
import { useSessionRedirect } from '@/hooks/useSessionRedirect'
import { useSpecies } from '@/hooks/useSpecies'
import { KeyboardScrollView } from '@/components/ui/KeyboardScrollView'
import { Chip } from '@/components/ui/Chip'
import { TextLink } from '@/components/ui/TextLink'
import { SearchField } from '@/components/ui/SearchField'
import { ScreenBackground } from '@/components/ui/ScreenBackground'
import { useScrolled } from '@/hooks/useScrolled'

const FILTERS = ['Todas', 'Mamíferos', 'Aves', 'Reptiles'] as const

type Filter = (typeof FILTERS)[number]

export default function SpeciesScreen() {
	const { scrolled, onScroll } = useScrolled()
	const speciesQuery = useSpecies()
	const species = useMemo(() => speciesQuery.data ?? [], [speciesQuery.data])
	const [search, setSearch] = useState('')
	const [filter, setFilter] = useState<Filter>('Todas')

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

	return (
		<ScreenBackground>
			{/* ENCABEZADO FIJO */}
			<ScreenHeader
				scrolled={scrolled}
				onBack={() => router.back()}
				title='Especies'
				subtitle='Conoce a los habitantes del zoológico.'
			/>

			<KeyboardScrollView
				onScroll={onScroll}
				scrollEventThrottle={16}
				className='flex-1'
				contentContainerClassName='grow px-5 pb-[120px] pt-4'
			>
				{/* Buscador */}
				<SearchField
					label='Buscar especie'
					className='mb-1'
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
				{speciesQuery.data && (
					<View className='mt-4 h-10 flex-row items-center justify-between'>
						<Text className='text-meta text-tinta'>
							{filteredSpecies.length}{' '}
							{filteredSpecies.length === 1 ? 'especie' : 'especies'}
						</Text>

						{search.trim() !== '' && (
							<TextLink label='Limpiar' onPress={() => setSearch('')} />
						)}
					</View>
				)}

				<QueryView
					query={speciesQuery}
					loadingMessage='Cargando especies…'
					errorTitle='No pudimos cargar las especies'
					isEmpty={() => filteredSpecies.length === 0}
					empty={
						species.length === 0
							? {
									icon: UserGroupIcon,
									title: 'Aún no hay especies',
									message:
										'Pronto podrás conocer a los habitantes del zoológico.',
								}
							: {
									icon: UserGroupIcon,
									title: 'No encontramos especies',
									message: 'Intenta con otro nombre o cambia el filtro.',
								}
					}
					className='mt-4'
				>
					{/* Tarjetas de especies */}
					{() => (
						<View className='mt-4'>
							{filteredSpecies.map((item) => (
								<SpeciesCard
									key={item.id}
									species={item}
									onPress={() => openSpecies(item.id)}
									className='mb-3'
								/>
							))}
						</View>
					)}
				</QueryView>

				<View className='h-10' />
			</KeyboardScrollView>
		</ScreenBackground>
	)
}
