import { MinusSignIcon, Ticket01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	ImageBackground,
	Pressable,
	ScrollView,
	Text,
	View,
	type ViewStyle,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import BackButton from '@/components/BackButton'
import FixedFooter from '@/components/FixedFooter'
import UserHeader from '@/components/UserHeader'
import { api } from '@/services/api'
import { getToken } from '@/services/auth'
import colors from '@/theme/colors'

const ICON_COLORS = {
	primary: colors.esmeralda,
	muted: colors.apagado,
} as const

const cardShadow: ViewStyle = {
	shadowColor: colors.bosque,
	shadowOffset: { width: 0, height: 2 },
	shadowOpacity: 0.04,
	shadowRadius: 4,
	elevation: 1,
}

type TicketType = {
	id: number
	name: string
	price: number | string
	description?: string | null
}

type SelectedTicket = {
	ticket_type_id: number
	quantity: number
}

const MAX_QUANTITY = 20

export default function TicketsScreen() {
	const router = useRouter()

	const [ticketTypes, setTicketTypes] = useState<TicketType[]>([])
	const [quantities, setQuantities] = useState<Record<number, number>>({})
	const [loading, setLoading] = useState(true)

	const loadTicketTypes = useCallback(async () => {
		try {
			setLoading(true)

			const token = await getToken()

			if (!token) {
				router.replace('/login')
				return
			}

			const response = await api<unknown>('/tickets/types', {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			const data = response as {
				data?: TicketType[]
			}

			const types: TicketType[] = Array.isArray(response)
				? response
				: Array.isArray(data?.data)
					? data.data
					: []

			setTicketTypes(types)

			const initialQuantities: Record<number, number> = {}

			types.forEach((ticket) => {
				initialQuantities[ticket.id] = 0
			})

			setQuantities(initialQuantities)
		} catch (error) {
			console.error('Error cargando boletos:', error)

			Alert.alert(
				'Error',
				error instanceof Error
					? error.message
					: 'No fue posible cargar los tipos de boleto.',
			)
		} finally {
			setLoading(false)
		}
	}, [router])

	useEffect(() => {
		void loadTicketTypes()
	}, [loadTicketTypes])

	const changeQuantity = (id: number, value: number) => {
		setQuantities((current) => ({
			...current,
			[id]: Math.max(0, Math.min(MAX_QUANTITY, value)),
		}))
	}

	const selectedTickets: SelectedTicket[] = ticketTypes
		.filter((ticket) => (quantities[ticket.id] ?? 0) > 0)
		.map((ticket) => ({
			ticket_type_id: ticket.id,
			quantity: quantities[ticket.id] ?? 0,
		}))

	const selectedQuantity = selectedTickets.reduce(
		(sum, ticket) => sum + ticket.quantity,
		0,
	)

	const total = ticketTypes.reduce((sum, ticket) => {
		const quantity = quantities[ticket.id] ?? 0
		const parsedPrice = Number(ticket.price)
		const price = Number.isFinite(parsedPrice) ? parsedPrice : 0

		return sum + price * quantity
	}, 0)

	const formatCurrency = (value: number) =>
		new Intl.NumberFormat('es-MX', {
			style: 'currency',
			currency: 'MXN',
			minimumFractionDigits: 2,
		}).format(value)

	const continuePurchase = () => {
		if (selectedTickets.length === 0) {
			Alert.alert(
				'Selecciona boletos',
				'Selecciona al menos un boleto para continuar.',
			)
			return
		}

		router.push({
			pathname: '/tickets/summary',
			params: {
				items: JSON.stringify(selectedTickets),
			},
		})
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
					className='flex-1'
				>
					<View className='flex-1 items-center justify-center'>
						<ActivityIndicator size='large' color={ICON_COLORS.primary} />
						<Text className='mt-3 text-[15px] font-semibold text-tinta-2'>
							Cargando boletos...
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
				className='flex-1'
			>
				<ScrollView
					className='min-h-0 flex-1'
					contentContainerClassName='grow px-5 pb-[180px] pt-3'
					showsVerticalScrollIndicator={false}
					bounces
					nestedScrollEnabled
					keyboardShouldPersistTaps='handled'
				>
					{/* ENCABEZADO */}
					<View className='pb-3'>
						<View className='mb-3'>
							<BackButton onPress={() => router.back()} position='relative' />
						</View>

						<UserHeader
							title='Comprar boletos'
							subtitle='Selecciona los boletos que necesitas.'
							showRewards={false}
						/>
					</View>

					{/* ESTADO VACÍO */}
					{ticketTypes.length === 0 ? (
						<View
							className='items-center justify-center rounded-[18px] border border-card-border bg-niebla px-6 py-8'
							style={cardShadow}
						>
							<View className='mb-3.5 h-[58px] w-[58px] items-center justify-center rounded-2xl border border-card-border bg-hoja'>
								<HugeiconsIcon
									icon={Ticket01Icon}
									size={30}
									color={ICON_COLORS.primary}
								/>
							</View>

							<Text className='text-center text-[17px] font-extrabold text-tinta'>
								No hay boletos disponibles
							</Text>

							<Text className='mt-1.5 text-center text-[13px] leading-[19px] text-tinta-2'>
								Por el momento no hay tipos de boleto para mostrar.
							</Text>
						</View>
					) : (
						ticketTypes.map((ticket) => {
							const quantity = quantities[ticket.id] ?? 0
							const parsedPrice = Number(ticket.price)
							const price = Number.isFinite(parsedPrice) ? parsedPrice : 0
							const amount = price * quantity
							const canDecrease = quantity > 0
							const canIncrease = quantity < MAX_QUANTITY

							return (
								<View
									key={ticket.id}
									className='mb-[13px] w-full rounded-[18px] border border-card-border bg-niebla p-[15px]'
									style={cardShadow}
								>
									{/* INFORMACIÓN DEL BOLETO */}
									<View className='w-full flex-row items-start'>
										<View className='mr-3 h-12 w-12 shrink-0 items-center justify-center rounded-[14px] border border-card-border bg-hoja'>
											<HugeiconsIcon
												icon={Ticket01Icon}
												size={25}
												strokeWidth={1.8}
												color={ICON_COLORS.primary}
											/>
										</View>

										<View className='min-w-0 flex-1 justify-center'>
											<Text className='text-[15px] font-extrabold leading-5 text-tinta'>
												{ticket.name}
											</Text>

											{!!ticket.description && (
												<Text className='mt-[3px] text-[12px] leading-4 text-tinta-2'>
													{ticket.description}
												</Text>
											)}
										</View>
									</View>

									<View className='mb-[13px] mt-[15px] h-px bg-card-border' />

									{/* PRECIO Y CANTIDAD */}
									<View className='w-full flex-row items-center justify-between'>
										<View className='min-w-0 flex-1 justify-center pr-2'>
											<Text className='text-[11px] font-semibold text-tinta-2'>
												Precio por boleto
											</Text>

											<Text className='mt-0.5 text-[20px] font-black text-bosque'>
												{formatCurrency(price)}
											</Text>

											<Text className='mt-[3px] text-[12px] font-semibold text-tinta-2'>
												Monto: {formatCurrency(amount)}
											</Text>
										</View>

										<View className='ml-1 shrink-0 flex-row items-center justify-end gap-2'>
											{/* RESTAR */}
											<Pressable
												accessibilityRole='button'
												accessibilityLabel={`Restar boleto de ${ticket.name}`}
												onPress={() => changeQuantity(ticket.id, quantity - 1)}
												disabled={!canDecrease}
												className={`h-10 min-h-10 w-10 min-w-10 shrink-0 items-center justify-center rounded-xl border border-card-border p-0 ${canDecrease ? 'bg-blanco active:opacity-70' : 'bg-niebla opacity-70'}`}
											>
												<HugeiconsIcon
													icon={MinusSignIcon}
													size={18}
													strokeWidth={2}
													color={
														canDecrease
															? ICON_COLORS.primary
															: ICON_COLORS.muted
													}
												/>
											</Pressable>

											{/* CANTIDAD */}
											<View className='h-10 w-[34px] min-w-[34px] shrink-0 items-center justify-center'>
												<Text
													className='text-center text-[15px] font-extrabold text-tinta'
													style={{ includeFontPadding: false }}
												>
													{quantity}
												</Text>
											</View>

											{/* SUMAR */}
											<Pressable
												accessibilityRole='button'
												accessibilityLabel={`Agregar boleto de ${ticket.name}`}
												onPress={() => changeQuantity(ticket.id, quantity + 1)}
												disabled={!canIncrease}
												className={`h-10 min-h-10 w-10 min-w-10 shrink-0 grow-0 items-center justify-center rounded-xl border-0 p-0 ${canIncrease ? 'bg-esmeralda' : 'bg-card-border'}`}
											>
												<Text
													className='text-center text-[28px] font-semibold leading-8 text-blanco'
													style={{ includeFontPadding: false }}
												>
													+
												</Text>
											</Pressable>
										</View>
									</View>
								</View>
							)
						})
					)}
				</ScrollView>

				{/* FOOTER FIJO */}
				<FixedFooter
					label='Total a pagar'
					description={`${selectedQuantity} ${
						selectedQuantity === 1
							? 'boleto seleccionado'
							: 'boletos seleccionados'
					}`}
					amount={formatCurrency(total)}
					buttonTitle='Continuar'
					onButtonPress={continuePurchase}
					disabled={selectedTickets.length === 0}
				/>
			</ImageBackground>
		</SafeAreaView>
	)
}
