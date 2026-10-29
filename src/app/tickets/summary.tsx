import { CreditCardIcon, Ticket01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	ImageBackground,
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
import type {
	CreateOrderResponse,
	TicketType,
	TicketTypesResponse,
} from '@/types/tickets'
import { formatCurrency } from '@/utils/format'

const ICON_COLOR = colors.esmeralda

const cardShadow: ViewStyle = {
	shadowColor: colors.bosque,
	shadowOffset: { width: 0, height: 2 },
	shadowOpacity: 0.05,
	shadowRadius: 8,
	elevation: 2,
}

type SelectedTicket = {
	ticket_type_id: number
	quantity: number
}

type TicketSummaryItem = {
	ticket_type_id: number
	quantity: number
	ticket: TicketType
	subtotal: number
}

export default function TicketSummaryScreen() {
	const router = useRouter()

	const params = useLocalSearchParams<{
		items?: string
	}>()

	const [ticketTypes, setTicketTypes] = useState<TicketType[]>([])
	const [loading, setLoading] = useState(true)
	const [purchasing, setPurchasing] = useState(false)

	const selectedTickets = useMemo<SelectedTicket[]>(() => {
		try {
			const parsed = params.items ? JSON.parse(params.items) : []
			return Array.isArray(parsed) ? parsed : []
		} catch {
			return []
		}
	}, [params.items])

	const loadTicketTypes = useCallback(async () => {
		try {
			setLoading(true)

			const token = await getToken()

			if (!token) {
				router.replace('/login')
				return
			}

			const response = await api<TicketTypesResponse>('/tickets/types', {
				method: 'GET',
			})

			const types: TicketType[] = Array.isArray(response)
				? response
				: Array.isArray(response?.data)
					? response.data
					: []

			setTicketTypes(types)
		} catch (error) {
			console.error('Error cargando tipos de boleto:', error)

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

	const summary = useMemo<TicketSummaryItem[]>(() => {
		return selectedTickets.flatMap((item) => {
			const ticket = ticketTypes.find((type) => type.id === item.ticket_type_id)

			if (!ticket) return []

			const price = Number(ticket.price)
			const quantity = Math.max(0, Number(item.quantity) || 0)

			return [
				{
					...item,
					quantity,
					ticket,
					subtotal: (Number.isFinite(price) ? price : 0) * quantity,
				},
			]
		})
	}, [selectedTickets, ticketTypes])

	const total = summary.reduce((sum, item) => sum + item.subtotal, 0)

	const totalTickets = summary.reduce((sum, item) => sum + item.quantity, 0)

	const confirmPurchase = async () => {
		if (purchasing) return

		if (summary.length === 0) {
			Alert.alert(
				'Sin boletos',
				'No hay boletos seleccionados para realizar la compra.',
			)
			return
		}

		try {
			setPurchasing(true)

			const token = await getToken()

			if (!token) {
				router.replace('/login')
				return
			}

			const response = await api<CreateOrderResponse>('/tickets/orders', {
				method: 'POST',
				body: JSON.stringify({
					items: summary.map((item) => ({
						ticket_type_id: item.ticket_type_id,
						quantity: item.quantity,
					})),
				}),
			})

			const order = response?.data ?? response

			router.replace({
				pathname: '/tickets/success',
				params: {
					order: JSON.stringify(order),
				},
			})
		} catch (error) {
			console.error('Error realizando compra:', error)

			Alert.alert(
				'No fue posible realizar la compra',
				error instanceof Error
					? error.message
					: 'Ocurrió un error al procesar la compra.',
			)
		} finally {
			setPurchasing(false)
		}
	}

	if (loading) {
		return (
			<SafeAreaView
				className='flex-1 bg-blanco'
				edges={['top', 'left', 'right']}
			>
				<ImageBackground
					source={require('@/assets/images/zoo-pattern.png')}
					className='flex-1 bg-blanco'
					resizeMode='repeat'
					imageClassName='opacity-[0.12]'
				>
					<View className='flex-1 items-center justify-center'>
						<ActivityIndicator size='large' color={ICON_COLOR} />
						<Text className='mt-3 text-[14px] font-medium text-tinta-2'>
							Cargando resumen...
						</Text>
					</View>
				</ImageBackground>
			</SafeAreaView>
		)
	}

	return (
		<SafeAreaView className='flex-1 bg-blanco' edges={['top', 'left', 'right']}>
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				className='flex-1 bg-blanco'
				resizeMode='repeat'
				imageClassName='opacity-[0.12]'
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
							title='Resumen de compra'
							subtitle='Revisa tus boletos antes de continuar.'
							showRewards={false}
						/>
					</View>

					{/* DETALLE DE BOLETOS */}
					<View
						className='mb-3.5 w-full rounded-[20px] border border-card-border bg-niebla p-4'
						style={cardShadow}
					>
						<View className='mb-4 flex-row items-center'>
							<View className='mr-3 h-[46px] w-[46px] items-center justify-center rounded-[14px] border border-card-border bg-hoja'>
								<HugeiconsIcon
									icon={Ticket01Icon}
									size={25}
									strokeWidth={1.8}
									color={ICON_COLOR}
								/>
							</View>

							<View className='flex-1'>
								<Text className='text-[16px] font-extrabold text-tinta'>
									Tus boletos
								</Text>
								<Text className='mt-[3px] text-[12px] text-tinta-2'>
									Detalle de la compra
								</Text>
							</View>
						</View>

						{summary.length === 0 ? (
							<Text className='mt-1 text-[12px] leading-[18px] text-tinta-2'>
								No hay boletos seleccionados.
							</Text>
						) : (
							summary.map((item) => (
								<View
									key={item.ticket_type_id}
									className='flex-row items-center justify-between border-b border-b-niebla py-3'
								>
									<View className='flex-1 pr-3'>
										<Text className='text-[14px] font-bold text-tinta'>
											{item.ticket.name}
										</Text>

										<Text className='mt-1 text-[12px] leading-[18px] text-tinta-2'>
											{item.quantity}{' '}
											{item.quantity === 1 ? 'boleto' : 'boletos'} ×{' '}
											{formatCurrency(Number(item.ticket.price) || 0)}
										</Text>
									</View>

									<Text className='text-[15px] font-extrabold text-bosque'>
										{formatCurrency(item.subtotal)}
									</Text>
								</View>
							))
						)}

						<View className='my-3 h-px bg-card-border' />

						<View className='flex-row items-center justify-between pt-1'>
							<Text className='text-[14px] font-bold text-tinta'>Total</Text>
							<Text className='text-[22px] font-extrabold text-bosque'>
								{formatCurrency(total)}
							</Text>
						</View>
					</View>

					{/* MÉTODO DE PAGO */}
					<View
						className='mb-3.5 w-full flex-row items-center rounded-[20px] border border-card-border bg-niebla p-4'
						style={cardShadow}
					>
						<View className='mr-3 h-[46px] w-[46px] items-center justify-center rounded-[14px] border border-card-border bg-hoja'>
							<HugeiconsIcon
								icon={CreditCardIcon}
								size={25}
								strokeWidth={1.8}
								color={ICON_COLOR}
							/>
						</View>

						<View className='flex-1'>
							<Text className='text-[15px] font-extrabold text-tinta'>
								Método de pago
							</Text>
							<Text className='mt-1 text-[13px] leading-[18px] text-tinta-2'>
								Tarjeta de crédito o débito
							</Text>
						</View>
					</View>

					{/* AVISO DE COMPRA SEGURA */}
					<View className='mb-3.5 w-full flex-row items-center rounded-2xl border border-card-border bg-niebla p-3.5'>
						<View className='mr-3 h-[34px] w-[34px] items-center justify-center rounded-[11px] bg-esmeralda'>
							<Text className='text-[18px] font-extrabold text-blanco'>✓</Text>
						</View>

						<View className='flex-1'>
							<Text className='text-[14px] font-bold text-tinta'>
								Compra segura
							</Text>
							<Text className='mt-1 text-[12px] leading-[18px] text-tinta-2'>
								Al confirmar recibirás tus boletos digitales con su código QR.
							</Text>
						</View>
					</View>

					<View className='h-6' />
				</ScrollView>

				{/* FOOTER FIJO */}
				{purchasing ? (
					<View
						className='absolute bottom-0 left-0 right-0 z-[999] flex-row items-center justify-center gap-2.5 border-t border-t-card-border bg-blanco px-5 pb-7 pt-5'
						style={{ elevation: 15 }}
					>
						<ActivityIndicator size='small' color={colors.esmeralda} />
						<Text className='font-extrabold text-esmeralda'>
							Procesando compra...
						</Text>
					</View>
				) : (
					<FixedFooter
						label='Total a pagar'
						description={`${totalTickets} ${
							totalTickets === 1
								? 'boleto seleccionado'
								: 'boletos seleccionados'
						}`}
						amount={formatCurrency(total)}
						buttonTitle='Aceptar y comprar'
						onButtonPress={confirmPurchase}
						disabled={summary.length === 0}
					/>
				)}
			</ImageBackground>
		</SafeAreaView>
	)
}
