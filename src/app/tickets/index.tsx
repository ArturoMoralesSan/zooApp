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
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import BackButton from '@/components/BackButton'
import FixedFooter from '@/components/FixedFooter'
import UserHeader from '@/components/UserHeader'
import { api } from '@/services/api'
import { getToken } from '@/services/auth'

import {
	backButtonContainerStyle,
	backgroundImageStyle,
	backgroundStyle,
	colors,
	emptyStateDescriptionStyle,
	emptyStateIconContainerStyle,
	emptyStateStyle,
	emptyStateTitleStyle,
	loadingContentStyle,
	loadingTextStyle,
	quantityButtonDisabledStyle,
	quantityButtonStyle,
	quantityContainerStyle,
	quantityPlusButtonStyle,
	quantityPlusDisabledStyle,
	quantityPlusTextStyle,
	quantityStyle,
	quantityTextStyle,
	screenHeaderStyle,
	scrollContentStyle,
	ticketAmountStyle,
	ticketBottomStyle,
	ticketCardStyle,
	ticketDescriptionStyle,
	ticketDividerStyle,
	ticketHeaderStyle,
	ticketIconStyle,
	ticketInfoStyle,
	ticketNameStyle,
	ticketPriceContainerStyle,
	ticketPriceLabelStyle,
	ticketPriceStyle,
} from '@/styles/tickets'

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
			<SafeAreaView edges={['top', 'left', 'right']} style={backgroundStyle}>
				<ImageBackground
					source={require('@/assets/images/zoo-pattern.png')}
					resizeMode='repeat'
					imageStyle={backgroundImageStyle}
					style={{ flex: 1 }}
				>
					<View style={loadingContentStyle}>
						<ActivityIndicator size='large' color={colors.primary} />
						<Text style={loadingTextStyle}>Cargando boletos...</Text>
					</View>
				</ImageBackground>
			</SafeAreaView>
		)
	}

	return (
		<SafeAreaView edges={['top', 'left', 'right']} style={backgroundStyle}>
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				resizeMode='repeat'
				imageStyle={backgroundImageStyle}
				style={{ flex: 1 }}
			>
				<ScrollView
					style={{ flex: 1, minHeight: 0 }}
					contentContainerStyle={[
						scrollContentStyle,
						{
							paddingHorizontal: 20,
							paddingTop: 12,
							paddingBottom: 180,
						},
					]}
					showsVerticalScrollIndicator={false}
					bounces
					nestedScrollEnabled
					keyboardShouldPersistTaps='handled'
				>
					{/* ENCABEZADO */}
					<View style={screenHeaderStyle}>
						<View style={backButtonContainerStyle}>
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
						<View style={emptyStateStyle}>
							<View style={emptyStateIconContainerStyle}>
								<HugeiconsIcon
									icon={Ticket01Icon}
									size={30}
									color={colors.primary}
								/>
							</View>

							<Text style={emptyStateTitleStyle}>
								No hay boletos disponibles
							</Text>

							<Text style={emptyStateDescriptionStyle}>
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
								<View key={ticket.id} style={ticketCardStyle}>
									{/* INFORMACIÓN DEL BOLETO */}
									<View style={ticketHeaderStyle}>
										<View style={ticketIconStyle}>
											<HugeiconsIcon
												icon={Ticket01Icon}
												size={25}
												strokeWidth={1.8}
												color={colors.primary}
											/>
										</View>

										<View style={ticketInfoStyle}>
											<Text style={ticketNameStyle}>{ticket.name}</Text>

											{!!ticket.description && (
												<Text style={ticketDescriptionStyle}>
													{ticket.description}
												</Text>
											)}
										</View>
									</View>

									<View style={ticketDividerStyle} />

									{/* PRECIO Y CANTIDAD */}
									<View style={ticketBottomStyle}>
										<View style={ticketPriceContainerStyle}>
											<Text style={ticketPriceLabelStyle}>
												Precio por boleto
											</Text>

											<Text style={ticketPriceStyle}>
												{formatCurrency(price)}
											</Text>

											<Text style={ticketAmountStyle}>
												Monto: {formatCurrency(amount)}
											</Text>
										</View>

										<View style={quantityContainerStyle}>
											{/* RESTAR */}
											<Pressable
												accessibilityRole='button'
												accessibilityLabel={`Restar boleto de ${ticket.name}`}
												onPress={() => changeQuantity(ticket.id, quantity - 1)}
												disabled={!canDecrease}
												style={({ pressed }) => [
													quantityButtonStyle,
													!canDecrease && quantityButtonDisabledStyle,
													pressed && canDecrease && { opacity: 0.7 },
												]}
											>
												<HugeiconsIcon
													icon={MinusSignIcon}
													size={18}
													strokeWidth={2}
													color={canDecrease ? colors.primary : colors.muted}
												/>
											</Pressable>

											{/* CANTIDAD */}
											<View style={quantityStyle}>
												<Text style={quantityTextStyle}>{quantity}</Text>
											</View>

											{/* SUMAR */}
											<Pressable
												accessibilityRole='button'
												accessibilityLabel={`Agregar boleto de ${ticket.name}`}
												onPress={() => changeQuantity(ticket.id, quantity + 1)}
												disabled={!canIncrease}
												style={[
													quantityPlusButtonStyle,
													!canIncrease && quantityPlusDisabledStyle,
												]}
											>
												<Text style={quantityPlusTextStyle}>+</Text>
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
