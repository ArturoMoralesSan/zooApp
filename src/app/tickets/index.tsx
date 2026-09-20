import { api } from '@/services/api'
import { getToken } from '@/services/auth'

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
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native'

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

const COLORS = {
	background: '#F7F9F8',
	primary: '#075C3B',
	primaryLight: '#16845D',
	dark: '#17372C',
	muted: '#557067',
	card: '#DDF5EA',
	cardLight: '#E8F7F0',
	active: '#BDEED9',
	border: '#B8E6D3',
	white: '#FFFFFF',

	coral: '#D95C4F',
	coralLight: '#F8E1DE',

	button: '#246F4C',
	buttonPressed: '#1D5C3F',

	footerBackground: '#F7F9F8',
}

const cardShadow = {
	shadowColor: '#075C3B',
	shadowOffset: {
		width: 0,
		height: 5,
	},
	shadowOpacity: 0.12,
	shadowRadius: 10,
	elevation: 4,
}

export default function TicketsScreen() {
	const router = useRouter()

	const [ticketTypes, setTicketTypes] = useState<TicketType[]>([])
	const [quantities, setQuantities] = useState<Record<number, number>>({})
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		loadTicketTypes()
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
			quantity: quantities[ticket.id],
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
			<SafeAreaView style={styles.loadingContainer}>
				<ImageBackground
					source={require('@/assets/images/zoo-pattern.png')}
					style={styles.loadingBackground}
					className='flex-1'
					resizeMode='repeat'
					imageStyle={{
						opacity: 0.3,
					}}
				>
					<View style={styles.loadingContent}>
						<ActivityIndicator size='large' color={COLORS.primary} />

						<Text style={styles.loadingText}>Cargando boletos...</Text>
					</View>
				</ImageBackground>
			</SafeAreaView>
		)
	}

	return (
		<SafeAreaView style={styles.container}>
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				style={styles.background}
				className='flex-1'
				resizeMode='repeat'
				imageStyle={{
					opacity: 0.3,
				}}
			>
				<View style={styles.header}>
					<View style={styles.backButtonWrapper}>
						<Pressable
							onPress={() => router.back()}
							style={({ pressed }) => [
								styles.backButton,
								pressed && styles.backButtonPressed,
							]}
						>
							<Text style={styles.backText}>‹ Regresar</Text>
						</Pressable>
					</View>

					<View style={styles.headerTextContainer}>
						<Text style={styles.title}>Comprar boletos</Text>

						<Text style={styles.subtitle}>
							Selecciona los boletos que necesitas
						</Text>
					</View>
				</View>

				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.scrollContent}
				>
					{ticketTypes.map((ticket) => {
						const quantity = quantities[ticket.id] ?? 0

						return (
							<View key={ticket.id} style={[styles.ticketCard, cardShadow]}>
								<View style={styles.ticketIcon}>
									<HugeiconsIcon
										icon={Ticket01Icon}
										size={27}
										strokeWidth={1.8}
										color={COLORS.primary}
									/>
								</View>

								<View style={styles.ticketInfo}>
									<Text style={styles.ticketName}>{ticket.name}</Text>

									{ticket.description ? (
										<Text style={styles.ticketDescription}>
											{ticket.description}
										</Text>
									) : null}

									<Text style={styles.ticketPrice}>
										${Number(ticket.price).toFixed(2)}
									</Text>
								</View>

								<View style={styles.quantityContainer}>
									<Pressable
										onPress={() => changeQuantity(ticket.id, quantity - 1)}
										disabled={quantity === 0}
										style={[
											styles.quantityButton,
											quantity === 0 && styles.quantityButtonDisabled,
										]}
									>
										<HugeiconsIcon
											icon={MinusSignIcon}
											size={18}
											strokeWidth={2}
											color={quantity === 0 ? COLORS.muted : COLORS.primary}
										/>
									</Pressable>

									<Text style={styles.quantity}>{quantity}</Text>

									<Pressable
										onPress={() => changeQuantity(ticket.id, quantity + 1)}
										disabled={quantity >= 20}
										style={[
											styles.quantityButton,
											quantity >= 20 && styles.quantityButtonDisabled,
										]}
									>
										<HugeiconsIcon
											icon={PlusSignIcon}
											size={18}
											strokeWidth={2}
											color={quantity >= 20 ? COLORS.muted : COLORS.primary}
										/>
									</Pressable>
								</View>
							</View>
						)
					})}

					<View style={styles.bottomSpace} />
				</ScrollView>

				<View style={styles.footer}>
					<View style={styles.totalContainer}>
						<View>
							<Text style={styles.totalLabel}>Total</Text>

							<Text style={styles.ticketCount}>
								{selectedQuantity}{' '}
								{selectedQuantity === 1 ? 'boleto' : 'boletos'}
							</Text>
						</View>

						<Text style={styles.total}>${total.toFixed(2)}</Text>
					</View>

					<View style={styles.continueButtonWrapper}>
						<Pressable
							onPress={continuePurchase}
							disabled={selectedTickets.length === 0}
							style={({ pressed }) => [
								styles.continueButton,
								pressed &&
									selectedTickets.length > 0 &&
									styles.continueButtonPressed,
								selectedTickets.length === 0 && styles.continueButtonDisabled,
							]}
						>
							<View style={styles.continueButtonContent}>
								<Text style={styles.continueButtonText}>Continuar</Text>
							</View>
						</Pressable>
					</View>
				</View>
			</ImageBackground>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
	},

	background: {
		flex: 1,
	},

	loadingContainer: {
		flex: 1,
		backgroundColor: COLORS.background,
	},

	loadingBackground: {
		flex: 1,
	},

	loadingContent: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},

	loadingText: {
		marginTop: 12,
		color: COLORS.muted,
		fontSize: 15,
		fontWeight: '600',
	},

	header: {
		paddingHorizontal: 20,
		paddingTop: 55,
		paddingBottom: 16,
		alignItems: 'flex-start',
	},

	backButtonWrapper: {
		alignSelf: 'flex-start',
	},

	backButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(247,249,248,0.94)',
		borderWidth: 1,
		borderColor: COLORS.border,
		borderRadius: 18,
		paddingHorizontal: 16,
		paddingVertical: 10,
		...cardShadow,
	},

	backButtonPressed: {
		opacity: 0.75,
		backgroundColor: COLORS.card,
	},

	backArrow: {
		marginRight: 4,
		fontSize: 22,
		lineHeight: 22,
		fontWeight: '800',
		color: COLORS.primary,
	},

	backText: {
		fontSize: 15,
		fontWeight: '700',
		color: COLORS.dark,
	},

	headerTextContainer: {
		width: '100%',
		marginTop: 17,
	},

	title: {
		fontSize: 27,
		fontWeight: '900',
		color: COLORS.dark,
	},

	subtitle: {
		marginTop: 4,
		fontSize: 14,
		lineHeight: 20,
		color: COLORS.muted,
	},

	scrollContent: {
		paddingHorizontal: 20,
		paddingBottom: 180,
	},

	ticketCard: {
		width: '100%',
		backgroundColor: COLORS.cardLight,
		borderRadius: 25,
		padding: 16,
		marginBottom: 15,
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: COLORS.border,
	},

	ticketIcon: {
		width: 52,
		height: 52,
		borderRadius: 17,
		backgroundColor: COLORS.active,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 13,
		borderWidth: 1,
		borderColor: COLORS.border,
	},

	ticketInfo: {
		flex: 1,
		minWidth: 0,
	},

	ticketName: {
		fontSize: 16,
		fontWeight: '900',
		color: COLORS.dark,
	},

	ticketDescription: {
		marginTop: 3,
		fontSize: 12,
		color: COLORS.muted,
		lineHeight: 16,
	},

	ticketPrice: {
		marginTop: 6,
		fontSize: 17,
		fontWeight: '900',
		color: COLORS.primary,
	},

	quantityContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginLeft: 9,
	},

	quantityButton: {
		width: 34,
		height: 34,
		borderRadius: 11,
		backgroundColor: COLORS.active,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: COLORS.border,
	},

	quantityButtonDisabled: {
		backgroundColor: '#EEF3F0',
		borderColor: COLORS.border,
	},

	quantity: {
		marginHorizontal: 9,
		fontSize: 16,
		fontWeight: '900',
		color: COLORS.dark,
		minWidth: 18,
		textAlign: 'center',
	},

	bottomSpace: {
		height: 40,
	},

	footer: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: COLORS.footerBackground,
		paddingHorizontal: 20,
		paddingTop: 14,
		paddingBottom: 25,
		borderTopWidth: 1,
		borderTopColor: COLORS.border,
		...cardShadow,
	},

	totalContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},

	totalLabel: {
		fontSize: 14,
		fontWeight: '800',
		color: COLORS.muted,
	},

	ticketCount: {
		marginTop: 2,
		fontSize: 11,
		color: COLORS.muted,
	},

	total: {
		fontSize: 23,
		fontWeight: '900',
		color: COLORS.primary,
	},

	continueButtonWrapper: {
		width: '100%',
		height: 54,
		borderRadius: 17,
		backgroundColor: COLORS.button,
		borderWidth: 1,
		borderColor: COLORS.button,
		overflow: 'hidden',
		...cardShadow,
	},

	continueButton: {
		width: '100%',
		height: '100%',
		alignItems: 'center',
		justifyContent: 'center',
	},

	continueButtonContent: {
		width: '100%',
		height: '100%',
		alignItems: 'center',
		justifyContent: 'center',
	},

	continueButtonPressed: {
		backgroundColor: COLORS.buttonPressed,
	},

	continueButtonDisabled: {
		opacity: 0.45,
	},

	continueButtonText: {
		color: COLORS.white,
		fontSize: 16,
		fontWeight: '900',
		textAlign: 'center',
	},
})
