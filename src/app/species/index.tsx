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
	type ViewStyle,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import AppCard from '@/components/AppCard'
import BackButton from '@/components/BackButton'
import UserHeader from '@/components/UserHeader'
import { api } from '@/services/api'
import { getToken } from '@/services/auth'
import colors from '@/theme/colors'

const PROP_COLORS = {
	primary: '#08783F',
	text: '#06371c',
} as const

const cardShadow: ViewStyle = {
	shadowColor: '#08783F',
	shadowOffset: { width: 0, height: 5 },
	shadowOpacity: 0.12,
	shadowRadius: 10,
	elevation: 4,
}

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
				className='flex-1 bg-blanco'
			>
				<ImageBackground
					source={require('@/assets/images/zoo-pattern.png')}
					resizeMode='repeat'
					imageClassName='opacity-[0.025]'
					className='flex-1 bg-blanco'
				>
					<View className='flex-1 items-center justify-center bg-transparent'>
						<ActivityIndicator size='large' color={PROP_COLORS.primary} />
						<Text className='mt-3 text-[15px] font-semibold text-[#06371c]'>
							Cargando especies...
						</Text>
					</View>
				</ImageBackground>
			</SafeAreaView>
		)
	}

	return (
		<SafeAreaView edges={['top', 'left', 'right']} className='flex-1 bg-blanco'>
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				resizeMode='repeat'
				imageClassName='opacity-[0.025]'
				className='flex-1 bg-blanco'
			>
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
					<View className='mb-1 mt-4'>
						<Text className='mb-2 text-[14px] font-extrabold text-[#06371c]'>
							Buscar especie
						</Text>

						<View className='h-[54px] flex-row items-center rounded-[18px] border border-[#a6c1b3] bg-blanco'>
							<View className='items-center justify-center pl-4'>
								<HugeiconsIcon
									icon={Search01Icon}
									size={21}
									strokeWidth={1.8}
									color={PROP_COLORS.primary}
								/>
							</View>

							<TextInput
								value={search}
								onChangeText={setSearch}
								placeholder='Buscar especie...'
								placeholderTextColor={PROP_COLORS.text}
								autoCapitalize='none'
								autoCorrect={false}
								className='flex-1 px-3 py-0 text-[15px] text-[#06371c]'
								selectionColor={PROP_COLORS.primary}
							/>
						</View>
					</View>

					{/* Filtros */}
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						className='-mx-0.5 mt-[15px]'
						contentContainerClassName='items-center pl-0.5 pr-5'
					>
						{FILTERS.map((item) => {
							const active = filter === item

							return (
								<View
									key={item}
									className={`mr-[9px] overflow-hidden rounded-full border px-4 py-2.5 ${active ? 'border-[#08783F] bg-[#08783F]' : 'border-[#a6c1b3] bg-blanco'}`}
								>
									<Pressable
										onPress={() => setFilter(item)}
										className='items-center justify-center active:opacity-[0.72]'
									>
										<Text
											className={`text-[13px] font-extrabold ${active ? 'text-blanco' : 'text-[#06371c]'}`}
										>
											{item}
										</Text>
									</Pressable>
								</View>
							)
						})}
					</ScrollView>

					{/* Resultados */}
					<View className='mb-0.5 mt-[19px] flex-row items-center justify-between'>
						<Text className='text-[13px] font-extrabold text-[#06371c]'>
							{filteredSpecies.length}{' '}
							{filteredSpecies.length === 1 ? 'especie' : 'especies'}
						</Text>

						{search.trim() !== '' && (
							<Pressable
								onPress={() => setSearch('')}
								className='rounded-[14px] px-2.5 py-[7px] active:bg-[#d5ead9]'
							>
								<Text className='text-[13px] font-extrabold text-[#08783F]'>
									Limpiar
								</Text>
							</Pressable>
						)}
					</View>

					{/* Error de carga */}
					{error ? (
						<View className='mt-[15px] items-center rounded-[22px] border border-[#a6c1b3] bg-niebla p-[18px]'>
							<View className='h-11 w-11 items-center justify-center rounded-[15px] border border-[#a6c1b3] bg-blanco'>
								<Text className='text-[21px] font-black text-[#06371c]'>!</Text>
							</View>

							<Text className='mt-3 text-center text-[15px] font-black text-[#06371c]'>
								No fue posible cargar las especies.
							</Text>

							<Text className='mt-1.5 text-center text-[12px] leading-[18px] text-[#06371c]'>
								{error}
							</Text>

							<View className='mt-[15px] h-12 w-full overflow-hidden rounded-2xl border border-[#08783F] bg-[#08783F]'>
								<Pressable
									onPress={() => void loadSpecies()}
									className='h-full w-full items-center justify-center active:bg-[#063D22]'
								>
									<View className='h-full w-full items-center justify-center'>
										<Text className='text-center text-[14px] font-black text-blanco'>
											Intentar nuevamente
										</Text>
									</View>
								</Pressable>
							</View>
						</View>
					) : filteredSpecies.length === 0 ? (
						/* Sin resultados */
						<View
							className='mt-[15px] items-center rounded-[25px] border border-[#a6c1b3] bg-niebla px-5 py-[35px]'
							style={cardShadow}
						>
							<View className='h-16 w-16 items-center justify-center rounded-[20px] border border-[#a6c1b3] bg-[#d5ead9]'>
								<HugeiconsIcon
									icon={UserGroupIcon}
									size={30}
									strokeWidth={1.8}
									color={PROP_COLORS.primary}
								/>
							</View>

							<Text className='mt-4 text-center text-[18px] font-black text-[#06371c]'>
								No encontramos especies
							</Text>

							<Text className='mt-1.5 text-center text-[13px] leading-[19px] text-[#06371c]'>
								Intenta con otro nombre o cambia el filtro.
							</Text>
						</View>
					) : (
						/* Tarjetas de especies */
						<View className='mt-[15px]'>
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
									backgroundColor={colors.niebla}
									borderColor='#a6c1b3'
									iconColor={PROP_COLORS.primary}
									iconBackgroundColor='#d5ead9'
									arrowColor={colors.blanco}
									arrowBackgroundColor={PROP_COLORS.primary}
									textColor={PROP_COLORS.text}
									descriptionColor={PROP_COLORS.text}
									showArrow
									style={{ marginBottom: 15 }}
								/>
							))}
						</View>
					)}

					<View className='h-10' />
				</ScrollView>
			</ImageBackground>
		</SafeAreaView>
	)
}
