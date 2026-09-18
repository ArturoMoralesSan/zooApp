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
	Pressable,
	ScrollView,
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
					Cargando especies...
				</Text>
			</View>
		)
	}

	return (
		<View
			className='flex-1'
			style={{
				backgroundColor: '#F7F8F3',
			}}
		>
			<ScrollView
				className='flex-1'
				contentContainerStyle={{
					paddingHorizontal: 20,
					paddingTop: 55,
					paddingBottom: 130,
				}}
				keyboardShouldPersistTaps='handled'
				showsVerticalScrollIndicator={false}
			>
				{/* Regresar */}
				<View
					className='mb-5 self-start rounded-2xl'
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

				{/* Header */}
				<View className='flex-row items-center'>
					<View
						className='h-12 w-12 items-center justify-center rounded-2xl'
						style={{
							backgroundColor: '#DCEFE5',
						}}
					>
						<HugeiconsIcon
							icon={UserGroupIcon}
							size={26}
							strokeWidth={1.8}
							color='#087A5A'
						/>
					</View>

					<View className='ml-4 flex-1'>
						<Text
							className='text-3xl font-bold'
							style={{
								color: '#123C32',
							}}
						>
							Especies
						</Text>

						<Text
							className='mt-1 text-base'
							style={{
								color: '#6F8A7D',
							}}
						>
							Conoce a los habitantes del zoológico.
						</Text>
					</View>
				</View>

				{/* Buscador */}
				{/* Buscador */}
				<View className='mt-5'>
					<Text
						className='mb-2 text-sm font-semibold'
						style={{
							color: '#123C32',
						}}
					>
						Buscar especie
					</Text>

					<View
						className='flex-row items-center rounded-2xl border'
						style={{
							backgroundColor: '#FFFFFF',
							borderColor: '#B8DCCA',
							shadowColor: '#064D36',
							shadowOffset: {
								width: 0,
								height: 1,
							},
							shadowOpacity: 0.04,
							shadowRadius: 4,
							elevation: 1,
						}}
					>
						<View className='pl-4'>
							<HugeiconsIcon
								icon={Search01Icon}
								size={21}
								strokeWidth={1.8}
								color='#6F8A7D'
							/>
						</View>

						<TextInput
							value={search}
							onChangeText={setSearch}
							placeholder='Buscar especie...'
							placeholderTextColor='#6F8A7D'
							autoCapitalize='none'
							autoCorrect={false}
							className='flex-1 px-3 py-4 text-base'
							style={{
								color: '#123C32',
							}}
						/>
					</View>
				</View>

				{/* Filtros */}
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					className='mt-4'
					contentContainerStyle={{
						paddingRight: 20,
					}}
				>
					{FILTERS.map((item) => {
						const active = filter === item

						return (
							<View
								key={item}
								className='mr-2 rounded-2xl'
								style={{
									backgroundColor: active ? '#087A5A' : '#FFFFFF',
									...cardShadow,
								}}
							>
								<Pressable
									onPress={() => setFilter(item)}
									className='rounded-2xl px-5 py-2.5'
									style={({ pressed }) => ({
										backgroundColor: active ? '#087A5A' : '#FFFFFF',
										opacity: pressed ? 0.75 : 1,
									})}
								>
									<Text
										className='text-sm font-semibold'
										style={{
											color: active ? '#FFFFFF' : '#123C32',
										}}
									>
										{item}
									</Text>
								</Pressable>
							</View>
						)
					})}
				</ScrollView>

				{/* Resultados */}
				<View className='mt-6 flex-row items-center justify-between'>
					<Text
						className='text-sm font-semibold'
						style={{
							color: '#6F8A7D',
						}}
					>
						{filteredSpecies.length}{' '}
						{filteredSpecies.length === 1 ? 'especie' : 'especies'}
					</Text>

					{search.trim() && (
						<Pressable
							onPress={() => setSearch('')}
							className='rounded-2xl px-3 py-2'
							style={({ pressed }) => ({
								opacity: pressed ? 0.6 : 1,
							})}
						>
							<Text
								className='text-sm font-semibold'
								style={{
									color: '#087A5A',
								}}
							>
								Limpiar
							</Text>
						</Pressable>
					)}
				</View>

				{/* Error */}
				{error ? (
					<View
						className='mt-5 rounded-3xl p-6'
						style={{
							backgroundColor: '#FFF1F0',
							borderWidth: 1,
							borderColor: '#FFE3E1',
						}}
					>
						<Text
							className='text-center text-base font-semibold'
							style={{
								color: '#C24141',
							}}
						>
							No fue posible cargar las especies.
						</Text>

						<Text
							className='mt-2 text-center text-sm leading-5'
							style={{
								color: '#6F8A7D',
							}}
						>
							{error}
						</Text>

						<Pressable
							onPress={() => void loadSpecies()}
							className='mt-5 items-center overflow-hidden rounded-2xl'
							style={({ pressed }) => ({
								backgroundColor: pressed ? '#064D36' : '#087A5A',
							})}
						>
							<View className='px-5 py-3.5'>
								<Text
									className='font-bold'
									style={{
										color: '#FFFFFF',
									}}
								>
									Intentar nuevamente
								</Text>
							</View>
						</Pressable>
					</View>
				) : filteredSpecies.length === 0 ? (
					<View
						className='mt-5 items-center rounded-3xl px-6 py-10'
						style={{
							backgroundColor: '#F7F7EE',
							...cardShadow,
						}}
					>
						<View
							className='h-16 w-16 items-center justify-center rounded-2xl'
							style={{
								backgroundColor: '#DCEFE5',
							}}
						>
							<HugeiconsIcon
								icon={UserGroupIcon}
								size={30}
								strokeWidth={1.8}
								color='#087A5A'
							/>
						</View>

						<Text
							className='mt-5 text-lg font-bold'
							style={{
								color: '#123C32',
							}}
						>
							No encontramos especies
						</Text>

						<Text
							className='mt-2 text-center text-sm leading-5'
							style={{
								color: '#6F8A7D',
							}}
						>
							Intenta con otro nombre o cambia el filtro.
						</Text>
					</View>
				) : (
					<View className='mt-4'>
						{filteredSpecies.map((item) => (
							<View
								key={item.id}
								className='mb-4 overflow-hidden rounded-3xl'
								style={{
									backgroundColor: '#FFFFFF',
									...cardShadow,
								}}
							>
								<Pressable
									onPress={() => openSpecies(item.id)}
									className='overflow-hidden rounded-3xl'
									style={({ pressed }) => ({
										backgroundColor: '#FFFFFF',
										opacity: pressed ? 0.94 : 1,
									})}
								>
									{item.image ? (
										<Image
											source={{
												uri: item.image,
											}}
											className='h-52 w-full'
											resizeMode='cover'
										/>
									) : (
										<View
											className='h-52 w-full items-center justify-center'
											style={{
												backgroundColor: '#DCEFE5',
											}}
										>
											<HugeiconsIcon
												icon={UserGroupIcon}
												size={48}
												strokeWidth={1.8}
												color='#087A5A'
											/>
										</View>
									)}

									<View className='p-5'>
										<View className='flex-row items-start'>
											<View className='flex-1 pr-3'>
												<Text
													className='text-xl font-bold'
													style={{
														color: '#123C32',
													}}
													numberOfLines={2}
												>
													{item.common_name}
												</Text>

												<Text
													className='mt-1 text-sm italic'
													style={{
														color: '#6F8A7D',
													}}
													numberOfLines={1}
												>
													{item.scientific_name}
												</Text>
											</View>

											{/* Indicador de navegación */}
											<View
												className='h-10 w-10 items-center justify-center rounded-full'
												style={{
													backgroundColor: '#DCEFE5',
												}}
											>
												<HugeiconsIcon
													icon={ArrowRight01Icon}
													size={20}
													strokeWidth={1.8}
													color='#087A5A'
												/>
											</View>
										</View>

										{/* Categoría */}
										{item.category?.name && (
											<View
												className='mt-4 self-start rounded-2xl px-3 py-1.5'
												style={{
													backgroundColor: '#EEF4F0',
												}}
											>
												<Text
													className='text-xs font-semibold'
													style={{
														color: '#123C32',
													}}
												>
													{item.category.name}
												</Text>
											</View>
										)}

										{/* Descripción */}
										{item.description && (
											<Text
												className='mt-3 text-sm leading-5'
												style={{
													color: '#6F8A7D',
												}}
												numberOfLines={3}
											>
												{item.description}
											</Text>
										)}

										<Text
											className='mt-4 text-sm font-bold'
											style={{
												color: '#087A5A',
											}}
										>
											Ver información
										</Text>
									</View>
								</Pressable>
							</View>
						))}
					</View>
				)}
			</ScrollView>
		</View>
	)
}
