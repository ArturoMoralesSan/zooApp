import { api } from '@/services/api'
import { getToken } from '@/services/auth'

import { CreditCardIcon, Ticket01Icon } from '@hugeicons/core-free-icons'

import { HugeiconsIcon } from '@hugeicons/react-native'

import { useLocalSearchParams, useRouter } from 'expo-router'

import { useEffect, useMemo, useState } from 'react'

import {
	ActivityIndicator,
	Alert,
	ImageBackground,
	Pressable,
	ScrollView,
	Text,
	View,
} from 'react-native'

import { SafeAreaView } from 'react-native-safe-area-context'

import {
	backButtonPressedStyle,
	backButtonStyle,
	backgroundImageStyle,
	backgroundStyle,
	backTextStyle,
	bottomSpaceStyle,
	cardHeaderStyle,
	cardHeaderTextStyle,
	cardShadow,
	cardStyle,
	cardSubtitleStyle,
	cardTitleStyle,
	confirmButtonContentStyle,
	confirmButtonDisabledStyle,
	confirmButtonPressedStyle,
	confirmButtonStyle,
	confirmButtonTextStyle,
	confirmButtonWrapperStyle,
	containerStyle,
	dividerStyle,
	footerStyle,
	footerTicketCountStyle,
	footerTotalAmountStyle,
	footerTotalLabelStyle,
	footerTotalStyle,
	headerStyle,
	headerTextStyle,
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
	subtitleStyle,
	ticketNameStyle,
	ticketQuantityStyle,
	ticketRowInfoStyle,
	ticketRowStyle,
	ticketSubtotalStyle,
	titleStyle,
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

	const selectedTickets: SelectedTicket[] = useMemo(() => {
		try {
			return params.items ? JSON.parse(params.items) : []
		} catch {
			return []
		}
	}, [params.items])

	useEffect(() => {
		void loadTicketTypes()
	}, [])

	const loadTicketTypes = async () => {
		try {
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

			const types: TicketType[] = response.data ?? response

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
	}

	const summary = useMemo(() => {
		return selectedTickets
			.map((item) => {
				const ticket = ticketTypes.find(
					(type) => type.id === item.ticket_type_id,
				)

				if (!ticket) {
					return null
				}

				return {
					...item,
					ticket,
					subtotal: Number(ticket.price) * item.quantity,
				}
			})
			.filter(Boolean) as TicketSummaryItem[]
	}, [selectedTickets, ticketTypes])

	const total = summary.reduce((sum, item) => sum + item.subtotal, 0)

	const totalTickets = selectedTickets.reduce(
		(sum, item) => sum + item.quantity,
		0,
	)

	const confirmPurchase = async () => {
		if (selectedTickets.length === 0) {
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
					items: selectedTickets,
				}),
			})

			const order = response.data ?? response

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
				style={loadingContainerStyle}
				edges={['top', 'left', 'right']}
			>
				<ImageBackground
					source={require('@/assets/images/zoo-pattern.png')}
					style={backgroundStyle}
					className='flex-1'
					resizeMode='repeat'
					imageStyle={backgroundImageStyle}
				>
					<View style={loadingContentStyle}>
						<ActivityIndicator size='large' color='#075C3B' />

						<Text style={loadingTextStyle}>Cargando resumen...</Text>
					</View>
				</ImageBackground>
			</SafeAreaView>
		)
	}

	return (
		<SafeAreaView style={containerStyle} edges={['top', 'left', 'right']}>
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				style={backgroundStyle}
				className='flex-1'
				resizeMode='repeat'
				imageStyle={backgroundImageStyle}
			>
				{/* HEADER */}
				<View style={headerStyle}>
					<Pressable
						onPress={() => router.back()}
						style={({ pressed }) => [
							backButtonStyle,
							pressed && backButtonPressedStyle,
						]}
					>
						<Text style={backTextStyle}>‹ Regresar</Text>
					</Pressable>

					<View style={headerTextStyle}>
						<Text style={titleStyle}>Resumen de compra</Text>

						<Text style={subtitleStyle}>
							Revisa tus boletos antes de continuar
						</Text>
					</View>
				</View>

				{/* CONTENIDO */}
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={scrollContentStyle}
				>
					{/* BOLETOS */}
					<View style={[cardStyle, cardShadow]}>
						<View style={cardHeaderStyle}>
							<View style={iconContainerStyle}>
								<HugeiconsIcon
									icon={Ticket01Icon}
									size={25}
									strokeWidth={1.8}
									color='#075C3B'
								/>
							</View>

							<View style={cardHeaderTextStyle}>
								<Text style={cardTitleStyle}>Tus boletos</Text>

								<Text style={cardSubtitleStyle}>Detalle de la compra</Text>
							</View>
						</View>

						{summary.map((item) => (
							<View key={item.ticket_type_id} style={ticketRowStyle}>
								<View style={ticketRowInfoStyle}>
									<Text style={ticketNameStyle}>{item.ticket.name}</Text>

									<Text style={ticketQuantityStyle}>
										{item.quantity} boleto
										{item.quantity !== 1 ? 's' : ''} × $
										{Number(item.ticket.price).toFixed(2)}
									</Text>
								</View>

								<Text style={ticketSubtotalStyle}>
									${item.subtotal.toFixed(2)}
								</Text>
							</View>
						))}

						<View style={dividerStyle} />

						<View style={totalRowStyle}>
							<Text style={totalLabelStyle}>Total</Text>

							<Text style={totalStyle}>${total.toFixed(2)}</Text>
						</View>
					</View>

					{/* MÉTODO DE PAGO */}
					<View style={[paymentCardStyle, cardShadow]}>
						<View style={paymentIconStyle}>
							<HugeiconsIcon
								icon={CreditCardIcon}
								size={25}
								strokeWidth={1.8}
								color='#075C3B'
							/>
						</View>

						<View style={paymentInfoStyle}>
							<Text style={paymentTitleStyle}>Método de pago</Text>

							<Text style={paymentTextStyle}>Tarjeta de crédito o débito</Text>
						</View>
					</View>

					{/* AVISO */}
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

				{/* FOOTER */}
				<View style={footerStyle}>
					<View style={footerTotalStyle}>
						<View>
							<Text style={footerTotalLabelStyle}>Total a pagar</Text>

							<Text style={footerTicketCountStyle}>
								{totalTickets} {totalTickets === 1 ? 'boleto' : 'boletos'}
							</Text>
						</View>

						<Text style={footerTotalAmountStyle}>${total.toFixed(2)}</Text>
					</View>

					<View style={confirmButtonWrapperStyle}>
						<Pressable
							onPress={confirmPurchase}
							disabled={purchasing}
							style={({ pressed }) => [
								confirmButtonStyle,
								pressed && !purchasing && confirmButtonPressedStyle,
								purchasing && confirmButtonDisabledStyle,
							]}
						>
							<View style={confirmButtonContentStyle}>
								{purchasing ? (
									<ActivityIndicator size='small' color='#FFFFFF' />
								) : (
									<Text style={confirmButtonTextStyle}>Aceptar y comprar</Text>
								)}
							</View>
						</Pressable>
					</View>
				</View>
			</ImageBackground>
		</SafeAreaView>
	)
}
