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
	errorBackground: '#FFF3F1',
	errorBorder: '#F3D5D0',
	errorText: '#8C4037',

	mapBackground: '#F8E1DE',
	mapBorder: '#EFC2BC',

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

export default function TicketSummaryScreen() {
	const router = useRouter()
	const params = useLocalSearchParams<{ items?: string }>()

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
			.filter(Boolean) as {
			ticket_type_id: number
			quantity: number
			ticket: TicketType
			subtotal: number
		}[]
	}, [selectedTickets, ticketTypes])

	const total = summary.reduce((sum, item) => sum + item.subtotal, 0)

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

						<Text style={styles.loadingText}>Cargando resumen...</Text>
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

					<View style={styles.headerText}>
						<Text style={styles.title}>Resumen de compra</Text>

						<Text style={styles.subtitle}>
							Revisa tus boletos antes de continuar
						</Text>
					</View>
				</View>

				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.scrollContent}
				>
					<View style={[styles.card, cardShadow]}>
						<View style={styles.cardHeader}>
							<View style={styles.iconContainer}>
								<HugeiconsIcon
									icon={Ticket01Icon}
									size={25}
									strokeWidth={1.8}
									color={COLORS.primary}
								/>
							</View>

							<View style={styles.cardHeaderText}>
								<Text style={styles.cardTitle}>Tus boletos</Text>

								<Text style={styles.cardSubtitle}>Detalle de la compra</Text>
							</View>
						</View>

						{summary.map((item) => (
							<View key={item.ticket_type_id} style={styles.ticketRow}>
								<View style={styles.ticketRowInfo}>
									<Text style={styles.ticketName}>{item.ticket.name}</Text>

									<Text style={styles.ticketQuantity}>
										{item.quantity} boleto
										{item.quantity !== 1 ? 's' : ''} × $
										{Number(item.ticket.price).toFixed(2)}
									</Text>
								</View>

								<Text style={styles.ticketSubtotal}>
									${item.subtotal.toFixed(2)}
								</Text>
							</View>
						))}

						<View style={styles.divider} />

						<View style={styles.totalRow}>
							<Text style={styles.totalLabel}>Total</Text>

							<Text style={styles.total}>${total.toFixed(2)}</Text>
						</View>
					</View>

					<View style={[styles.paymentCard, cardShadow]}>
						<View style={styles.paymentIcon}>
							<HugeiconsIcon
								icon={CreditCardIcon}
								size={25}
								strokeWidth={1.8}
								color={COLORS.primary}
							/>
						</View>

						<View style={styles.paymentInfo}>
							<Text style={styles.paymentTitle}>Método de pago</Text>

							<Text style={styles.paymentText}>
								Tarjeta de crédito o débito
							</Text>
						</View>
					</View>

					<View style={styles.notice}>
						<View style={styles.noticeIcon}>
							<Text style={styles.noticeIconText}>✓</Text>
						</View>

						<View style={styles.noticeContent}>
							<Text style={styles.noticeTitle}>Compra segura</Text>

							<Text style={styles.noticeText}>
								Al confirmar recibirás tus boletos digitales con su código QR.
							</Text>
						</View>
					</View>

					<View style={styles.bottomSpace} />
				</ScrollView>

				<View style={styles.footer}>
					<View style={styles.footerTotal}>
						<View>
							<Text style={styles.footerTotalLabel}>Total a pagar</Text>

							<Text style={styles.footerTicketCount}>
								{selectedTickets.reduce((sum, item) => sum + item.quantity, 0)}{' '}
								{selectedTickets.reduce(
									(sum, item) => sum + item.quantity,
									0,
								) === 1
									? 'boleto'
									: 'boletos'}
							</Text>
						</View>

						<Text style={styles.footerTotalAmount}>${total.toFixed(2)}</Text>
					</View>

					<View style={styles.confirmButtonWrapper}>
						<Pressable
							onPress={confirmPurchase}
							disabled={purchasing}
							style={({ pressed }) => [
								styles.confirmButton,
								pressed && !purchasing && styles.confirmButtonPressed,
								purchasing && styles.confirmButtonDisabled,
							]}
						>
							<View style={styles.confirmButtonContent}>
								{purchasing ? (
									<ActivityIndicator size='small' color={COLORS.white} />
								) : (
									<Text style={styles.confirmButtonText}>
										Aceptar y comprar
									</Text>
								)}
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
		backgroundColor: 'rgba(248,244,234,0.94)',
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

	backText: {
		fontSize: 15,
		fontWeight: '700',
		color: COLORS.dark,
	},

	headerText: {
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
		paddingBottom: 185,
	},

	card: {
		width: '100%',
		backgroundColor: COLORS.cardLight,
		borderRadius: 25,
		padding: 18,
		marginBottom: 15,
		borderWidth: 1,
		borderColor: COLORS.border,
	},

	cardHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 18,
	},

	cardHeaderText: {
		flex: 1,
	},

	iconContainer: {
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

	cardTitle: {
		fontSize: 17,
		fontWeight: '900',
		color: COLORS.dark,
	},

	cardSubtitle: {
		marginTop: 3,
		fontSize: 12,
		color: COLORS.muted,
	},

	ticketRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 11,
	},

	ticketRowInfo: {
		flex: 1,
		paddingRight: 12,
	},

	ticketName: {
		fontSize: 15,
		fontWeight: '800',
		color: COLORS.dark,
	},

	ticketQuantity: {
		marginTop: 4,
		fontSize: 12,
		lineHeight: 17,
		color: COLORS.muted,
	},

	ticketSubtotal: {
		fontSize: 15,
		fontWeight: '900',
		color: COLORS.dark,
	},

	divider: {
		height: 1,
		backgroundColor: COLORS.border,
		marginVertical: 7,
	},

	totalRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingTop: 9,
	},

	totalLabel: {
		fontSize: 16,
		fontWeight: '800',
		color: COLORS.muted,
	},

	total: {
		fontSize: 23,
		fontWeight: '900',
		color: COLORS.primary,
	},

	paymentCard: {
		width: '100%',
		backgroundColor: COLORS.cardLight,
		borderRadius: 25,
		padding: 18,
		marginBottom: 15,
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: COLORS.border,
	},

	paymentIcon: {
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

	paymentInfo: {
		flex: 1,
	},

	paymentTitle: {
		fontSize: 16,
		fontWeight: '900',
		color: COLORS.dark,
	},

	paymentText: {
		marginTop: 4,
		fontSize: 13,
		lineHeight: 18,
		color: COLORS.muted,
	},

	notice: {
		width: '100%',
		backgroundColor: '#F0F8F4',
		borderRadius: 20,
		padding: 16,
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: COLORS.border,
	},

	noticeIcon: {
		width: 38,
		height: 38,
		borderRadius: 13,
		backgroundColor: COLORS.white,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 12,
		borderWidth: 1,
		borderColor: COLORS.border,
	},

	noticeIconText: {
		fontSize: 19,
		fontWeight: '900',
		color: COLORS.primary,
	},

	noticeContent: {
		flex: 1,
	},

	noticeTitle: {
		fontSize: 14,
		fontWeight: '900',
		color: COLORS.primary,
	},

	noticeText: {
		marginTop: 4,
		fontSize: 12,
		lineHeight: 17,
		color: COLORS.muted,
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

	footerTotal: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 12,
	},

	footerTotalLabel: {
		fontSize: 14,
		fontWeight: '800',
		color: COLORS.muted,
	},

	footerTicketCount: {
		marginTop: 2,
		fontSize: 11,
		color: COLORS.muted,
	},

	footerTotalAmount: {
		fontSize: 23,
		fontWeight: '900',
		color: COLORS.primary,
	},

	confirmButtonWrapper: {
		width: '100%',
		height: 54,
		borderRadius: 17,
		backgroundColor: COLORS.button,
		borderWidth: 1,
		borderColor: COLORS.button,
		overflow: 'hidden',
		...cardShadow,
	},

	confirmButton: {
		width: '100%',
		height: '100%',
		alignItems: 'center',
		justifyContent: 'center',
	},

	confirmButtonContent: {
		width: '100%',
		height: '100%',
		alignItems: 'center',
		justifyContent: 'center',
	},

	confirmButtonPressed: {
		backgroundColor: COLORS.buttonPressed,
	},

	confirmButtonDisabled: {
		opacity: 0.55,
	},

	confirmButtonText: {
		color: COLORS.white,
		fontSize: 16,
		fontWeight: '900',
		textAlign: 'center',
	},
})
