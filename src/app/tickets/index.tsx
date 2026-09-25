import {
	MinusSignIcon,
	PlusSignIcon,
	Ticket01Icon,
} from '@hugeicons/core-free-icons'

import { HugeiconsIcon } from '@hugeicons/react-native'

import { useRouter } from 'expo-router'

import { useEffect, useState } from 'react'

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

import { api } from '@/services/api'
import { getToken } from '@/services/auth'

import {
	backButtonPressedStyle,
	backButtonStyle,
	backgroundImageStyle,
	backgroundStyle,
	backTextStyle,
	bottomSpaceStyle,
	cardShadow,
	continueButtonContentStyle,
	continueButtonDisabledStyle,
	continueButtonPressedStyle,
	continueButtonStyle,
	continueButtonTextStyle,
	continueButtonWrapperStyle,
	footerStyle,
	loadingContentStyle,
	loadingTextStyle,
	quantityButtonDisabledStyle,
	quantityButtonStyle,
	quantityContainerStyle,
	quantityStyle,
	scrollContentStyle,
	subtitleStyle,
	ticketCardStyle,
	ticketCountStyle,
	ticketDescriptionStyle,
	ticketIconStyle,
	ticketInfoStyle,
	ticketNameStyle,
	ticketPriceStyle,
	titleStyle,
	totalContainerStyle,
	totalLabelStyle,
	totalStyle,
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

export default function TicketsScreen() {
	const router = useRouter()

	const [ticketTypes, setTicketTypes] = useState<TicketType[]>([])
	const [quantities, setQuantities] = useState<Record<number, number>>({})
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		void loadTicketTypes()
	}, [])

	const loadTicketTypes = async () => {
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

			const types: TicketType[] = response.data ?? response

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
	}

	const changeQuantity = (id: number, value: number) => {
		setQuantities((current) => ({
			...current,
			[id]: Math.max(0, Math.min(20, value)),
		}))
	}

	const selectedTickets: SelectedTicket[] = ticketTypes
		.filter((ticket) => (quantities[ticket.id] ?? 0) > 0)
		.map((ticket) => ({
			ticket_type_id: ticket.id,
			quantity: quantities[ticket.id] ?? 0,
		}))

	const total = ticketTypes.reduce((sum, ticket) => {
		const quantity = quantities[ticket.id] ?? 0

		return sum + Number(ticket.price) * quantity
	}, 0)

	const selectedQuantity = selectedTickets.reduce(
		(sum, ticket) => sum + ticket.quantity,
		0,
	)

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
				className='flex-1'
				edges={['top', 'left', 'right']}
				style={backgroundStyle}
			>
				<ImageBackground
					source={require('@/assets/images/zoo-pattern.png')}
					className='flex-1'
					resizeMode='repeat'
					imageStyle={backgroundImageStyle}
					style={backgroundStyle}
				>
					<View style={loadingContentStyle}>
						<ActivityIndicator size='large' color='#075C3B' />

						<Text style={loadingTextStyle}>Cargando boletos...</Text>
					</View>
				</ImageBackground>
			</SafeAreaView>
		)
	}

	return (
		<SafeAreaView
			className='flex-1'
			edges={['top', 'left', 'right']}
			style={backgroundStyle}
		>
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				className='flex-1'
				resizeMode='repeat'
				imageStyle={backgroundImageStyle}
				style={backgroundStyle}
			>
				{/* HEADER */}
				<View className='px-5 pt-0'>
					<Pressable
						onPress={() => router.back()}
						className='self-start'
						style={({ pressed }) => [
							backButtonStyle,
							pressed && backButtonPressedStyle,
						]}
					>
						<Text style={backTextStyle}>‹ Regresar</Text>
					</Pressable>

					<View className='mt-2'>
						<Text style={titleStyle}>Comprar boletos</Text>

						<Text style={subtitleStyle}>
							Selecciona los boletos que necesitas
						</Text>
					</View>
				</View>

				{/* BOLETOS */}
				<ScrollView
					className='flex-1'
					showsVerticalScrollIndicator={false}
					contentContainerStyle={scrollContentStyle}
				>
					{ticketTypes.map((ticket) => {
						const quantity = quantities[ticket.id] ?? 0

						return (
							<View key={ticket.id} style={[ticketCardStyle, cardShadow]}>
								<View style={ticketIconStyle}>
									<HugeiconsIcon
										icon={Ticket01Icon}
										size={27}
										strokeWidth={1.8}
										color='#075C3B'
									/>
								</View>

								<View style={ticketInfoStyle}>
									<Text style={ticketNameStyle}>{ticket.name}</Text>

									{ticket.description ? (
										<Text style={ticketDescriptionStyle}>
											{ticket.description}
										</Text>
									) : null}

									<Text style={ticketPriceStyle}>
										${Number(ticket.price).toFixed(2)}
									</Text>
								</View>

								<View style={quantityContainerStyle}>
									<Pressable
										onPress={() => changeQuantity(ticket.id, quantity - 1)}
										disabled={quantity === 0}
										style={[
											quantityButtonStyle,
											quantity === 0 && quantityButtonDisabledStyle,
										]}
									>
										<HugeiconsIcon
											icon={MinusSignIcon}
											size={18}
											strokeWidth={2}
											color={quantity === 0 ? '#557067' : '#075C3B'}
										/>
									</Pressable>

									<Text style={quantityStyle}>{quantity}</Text>

									<Pressable
										onPress={() => changeQuantity(ticket.id, quantity + 1)}
										disabled={quantity >= 20}
										style={[
											quantityButtonStyle,
											quantity >= 20 && quantityButtonDisabledStyle,
										]}
									>
										<HugeiconsIcon
											icon={PlusSignIcon}
											size={18}
											strokeWidth={2}
											color={quantity >= 20 ? '#557067' : '#075C3B'}
										/>
									</Pressable>
								</View>
							</View>
						)
					})}

					<View style={bottomSpaceStyle} />
				</ScrollView>

				{/* FOOTER */}
				<View style={footerStyle}>
					<View style={totalContainerStyle}>
						<View>
							<Text style={totalLabelStyle}>Total</Text>

							<Text style={ticketCountStyle}>
								{selectedQuantity}{' '}
								{selectedQuantity === 1 ? 'boleto' : 'boletos'}
							</Text>
						</View>

						<Text style={totalStyle}>${total.toFixed(2)}</Text>
					</View>

					<View style={continueButtonWrapperStyle}>
						<Pressable
							onPress={continuePurchase}
							disabled={selectedTickets.length === 0}
							style={({ pressed }) => [
								continueButtonStyle,
								pressed &&
									selectedTickets.length > 0 &&
									continueButtonPressedStyle,
								selectedTickets.length === 0 && continueButtonDisabledStyle,
							]}
						>
							<View style={continueButtonContentStyle}>
								<Text style={continueButtonTextStyle}>Continuar</Text>
							</View>
						</Pressable>
					</View>
				</View>
			</ImageBackground>
		</SafeAreaView>
	)
}
