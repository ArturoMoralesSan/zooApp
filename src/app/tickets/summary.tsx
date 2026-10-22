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
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import BackButton from '@/components/BackButton'
import FixedFooter from '@/components/FixedFooter'
import UserHeader from '@/components/UserHeader'

import { api } from '@/services/api'
import { getToken } from '@/services/auth'

import {
	backgroundImageStyle,
	backgroundStyle,
	bottomSpaceStyle,
	cardHeaderStyle,
	cardHeaderTextStyle,
	cardShadow,
	cardStyle,
	cardSubtitleStyle,
	cardTitleStyle,
	containerStyle,
	dividerStyle,
	iconContainerStyle,
	loadingContainerStyle,
	loadingContentStyle,
	loadingTextStyle,
	noticeContentStyle,
	noticeIconStyle,
	noticeIconTextStyle,
	noticeStyle,
	noticeTextStyle,
	noticeTitleStyle,
	paymentCardStyle,
	paymentIconStyle,
	paymentInfoStyle,
	paymentTextStyle,
	paymentTitleStyle,
	scrollContentStyle,
	ticketNameStyle,
	ticketQuantityStyle,
	ticketRowInfoStyle,
	ticketRowStyle,
	ticketSubtotalStyle,
	totalLabelStyle,
	totalRowStyle,
	totalStyle,
} from '@/styles/ticket-summary'

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

			const response = await api<any>('/tickets/types', {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`,
				},
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

	const formatCurrency = (value: number) =>
		new Intl.NumberFormat('es-MX', {
			style: 'currency',
			currency: 'MXN',
			minimumFractionDigits: 2,
		}).format(value)

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

			const response = await api<any>('/tickets/orders', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
				},
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
				style={[loadingContainerStyle, { flex: 1 }]}
				edges={['top', 'left', 'right']}
			>
				<ImageBackground
					source={require('@/assets/images/zoo-pattern.png')}
					style={[backgroundStyle, { flex: 1 }]}
					resizeMode='repeat'
					imageStyle={backgroundImageStyle}
				>
					<View style={loadingContentStyle}>
						<ActivityIndicator size='large' color='#187744' />
						<Text style={loadingTextStyle}>Cargando resumen...</Text>
					</View>
				</ImageBackground>
			</SafeAreaView>
		)
	}

	return (
		<SafeAreaView
			style={[containerStyle, { flex: 1 }]}
			edges={['top', 'left', 'right']}
		>
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				style={[backgroundStyle, { flex: 1 }]}
				resizeMode='repeat'
				imageStyle={backgroundImageStyle}
			>
				<ScrollView
					style={{ flex: 1, minHeight: 0 }}
					contentContainerStyle={[
						scrollContentStyle,
						{
							paddingHorizontal: 20,
							paddingTop: 12,
							paddingBottom: 180,
							flexGrow: 1,
						},
					]}
					showsVerticalScrollIndicator={false}
					bounces
					nestedScrollEnabled
					keyboardShouldPersistTaps='handled'
				>
					{/* ENCABEZADO */}
					<View style={{ paddingBottom: 12 }}>
						<View style={{ marginBottom: 12 }}>
							<BackButton onPress={() => router.back()} position='relative' />
						</View>

						<UserHeader
							title='Resumen de compra'
							subtitle='Revisa tus boletos antes de continuar.'
							showRewards={false}
						/>
					</View>

					{/* DETALLE DE BOLETOS */}
					<View style={[cardStyle, cardShadow]}>
						<View style={cardHeaderStyle}>
							<View style={iconContainerStyle}>
								<HugeiconsIcon
									icon={Ticket01Icon}
									size={25}
									strokeWidth={1.8}
									color='#187744'
								/>
							</View>

							<View style={cardHeaderTextStyle}>
								<Text style={cardTitleStyle}>Tus boletos</Text>
								<Text style={cardSubtitleStyle}>Detalle de la compra</Text>
							</View>
						</View>

						{summary.length === 0 ? (
							<Text style={ticketQuantityStyle}>
								No hay boletos seleccionados.
							</Text>
						) : (
							summary.map((item) => (
								<View key={item.ticket_type_id} style={ticketRowStyle}>
									<View style={ticketRowInfoStyle}>
										<Text style={ticketNameStyle}>{item.ticket.name}</Text>

										<Text style={ticketQuantityStyle}>
											{item.quantity}{' '}
											{item.quantity === 1 ? 'boleto' : 'boletos'} ×{' '}
											{formatCurrency(Number(item.ticket.price) || 0)}
										</Text>
									</View>

									<Text style={ticketSubtotalStyle}>
										{formatCurrency(item.subtotal)}
									</Text>
								</View>
							))
						)}

						<View style={dividerStyle} />

						<View style={totalRowStyle}>
							<Text style={totalLabelStyle}>Total</Text>
							<Text style={totalStyle}>{formatCurrency(total)}</Text>
						</View>
					</View>

					{/* MÉTODO DE PAGO */}
					<View style={[paymentCardStyle, cardShadow]}>
						<View style={paymentIconStyle}>
							<HugeiconsIcon
								icon={CreditCardIcon}
								size={25}
								strokeWidth={1.8}
								color='#187744'
							/>
						</View>

						<View style={paymentInfoStyle}>
							<Text style={paymentTitleStyle}>Método de pago</Text>
							<Text style={paymentTextStyle}>Tarjeta de crédito o débito</Text>
						</View>
					</View>

					{/* AVISO DE COMPRA SEGURA */}
					<View style={noticeStyle}>
						<View style={noticeIconStyle}>
							<Text style={noticeIconTextStyle}>✓</Text>
						</View>

						<View style={noticeContentStyle}>
							<Text style={noticeTitleStyle}>Compra segura</Text>
							<Text style={noticeTextStyle}>
								Al confirmar recibirás tus boletos digitales con su código QR.
							</Text>
						</View>
					</View>

					<View style={bottomSpaceStyle} />
				</ScrollView>

				{/* FOOTER FIJO */}
				{purchasing ? (
					<View
						style={{
							position: 'absolute',
							bottom: 0,
							left: 0,
							right: 0,
							backgroundColor: '#FFFFFF',
							borderTopWidth: 1,
							borderTopColor: '#BDCCC3',
							paddingHorizontal: 20,
							paddingTop: 20,
							paddingBottom: 28,
							alignItems: 'center',
							justifyContent: 'center',
							flexDirection: 'row',
							gap: 10,
							elevation: 15,
							zIndex: 999,
						}}
					>
						<ActivityIndicator size='small' color='#08783F' />
						<Text style={{ color: '#08783F', fontWeight: '800' }}>
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
