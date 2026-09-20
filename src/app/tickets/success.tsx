import {
	CheckmarkCircle02Icon,
	Home01Icon,
	Ticket01Icon,
} from '@hugeicons/core-free-icons'

import { HugeiconsIcon } from '@hugeicons/react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useMemo } from 'react'
import {
	ImageBackground,
	Pressable,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native'

import QRCode from 'react-native-qrcode-svg'

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

type Ticket = {
	id: number
	ticket_type_id: number
	qr_token: string
	status: string
}

type Order = {
	id: number
	total: number | string
	subtotal?: number | string
	discount?: number | string
	tickets?: Ticket[]
}

export default function TicketSuccessScreen() {
	const router = useRouter()
	const params = useLocalSearchParams<{ order?: string }>()

	const order: Order | null = useMemo(() => {
		try {
			return params.order ? JSON.parse(params.order) : null
		} catch {
			return null
		}
	}, [params.order])

	const tickets = order?.tickets ?? []
	const total = Number(order?.total ?? 0)

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
						<Text style={styles.title}>¡Compra realizada!</Text>

						<Text style={styles.subtitle}>
							Tus boletos están listos para usar
						</Text>
					</View>
				</View>

				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.scrollContent}
				>
					<View style={[styles.successCard, cardShadow]}>
						<View style={styles.successIcon}>
							<HugeiconsIcon
								icon={CheckmarkCircle02Icon}
								size={56}
								strokeWidth={1.8}
								color={COLORS.primary}
							/>
						</View>

						<Text style={styles.successTitle}>¡Compra realizada!</Text>

						<Text style={styles.successText}>
							Tu compra se realizó correctamente. Guarda tus códigos QR para
							ingresar al zoológico.
						</Text>
					</View>

					<View style={[styles.orderCard, cardShadow]}>
						<View style={styles.orderHeader}>
							<View style={styles.orderIcon}>
								<HugeiconsIcon
									icon={Ticket01Icon}
									size={25}
									strokeWidth={1.8}
									color={COLORS.primary}
								/>
							</View>

							<View style={styles.orderHeaderInfo}>
								<Text style={styles.orderTitle}>Tus boletos</Text>

								<Text style={styles.orderSubtitle}>
									Presenta el código QR en la entrada
								</Text>
							</View>
						</View>

						{tickets.map((ticket, index) => (
							<View key={ticket.id ?? index} style={styles.ticketContainer}>
								<Text style={styles.ticketLabel}>Boleto {index + 1}</Text>

								<View style={styles.qrContainer}>
									<QRCode
										value={ticket.qr_token}
										size={190}
										backgroundColor={COLORS.white}
									/>
								</View>
							</View>
						))}

						{tickets.length === 0 ? (
							<View style={styles.noTickets}>
								<Text style={styles.noTicketsText}>
									No se encontraron boletos en esta compra.
								</Text>
							</View>
						) : null}
					</View>

					<View style={[styles.totalCard, cardShadow]}>
						<View>
							<Text style={styles.totalLabel}>Total pagado</Text>

							<Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
						</View>

						<View style={styles.folioContainer}>
							<Text style={styles.folioLabel}>Folio</Text>

							<Text style={styles.folio}>#{order?.id ?? '---'}</Text>
						</View>
					</View>

					<View style={styles.infoBox}>
						<View style={styles.infoIcon}>
							<Text style={styles.infoIconText}>✓</Text>
						</View>

						<View style={styles.infoContent}>
							<Text style={styles.infoTitle}>Importante</Text>

							<Text style={styles.infoText}>
								Los códigos QR son tus boletos de entrada. Puedes mostrarlos
								directamente desde tu celular al llegar al zoológico.
							</Text>
						</View>
					</View>

					<View style={styles.bottomSpace} />
				</ScrollView>

				<View style={styles.footer}>
					<View style={styles.footerInfo}>
						<View>
							<Text style={styles.footerLabel}>Compra confirmada</Text>

							<Text style={styles.footerTicketCount}>
								{tickets.length} {tickets.length === 1 ? 'boleto' : 'boletos'}
							</Text>
						</View>

						<Text style={styles.footerAmount}>${total.toFixed(2)}</Text>
					</View>

					<View style={styles.homeButtonWrapper}>
						<Pressable
							onPress={() => router.replace('/')}
							style={({ pressed }) => [
								styles.homeButton,
								pressed && styles.homeButtonPressed,
							]}
						>
							<View style={styles.homeButtonContent}>
								<HugeiconsIcon
									icon={Home01Icon}
									size={21}
									strokeWidth={1.8}
									color={COLORS.white}
								/>

								<Text style={styles.homeButtonText}>Ir al inicio</Text>
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
		paddingBottom: 190,
		alignItems: 'center',
	},

	successCard: {
		width: '100%',
		backgroundColor: COLORS.cardLight,
		borderRadius: 25,
		padding: 20,
		marginBottom: 15,
		borderWidth: 1,
		borderColor: COLORS.border,
		alignItems: 'center',
	},

	successIcon: {
		width: 82,
		height: 82,
		borderRadius: 28,
		backgroundColor: COLORS.active,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: COLORS.border,
		marginBottom: 14,
	},

	successTitle: {
		fontSize: 23,
		fontWeight: '900',
		color: COLORS.dark,
		textAlign: 'center',
	},

	successText: {
		marginTop: 7,
		fontSize: 13,
		lineHeight: 19,
		color: COLORS.muted,
		textAlign: 'center',
		maxWidth: 340,
	},

	orderCard: {
		width: '100%',
		backgroundColor: COLORS.cardLight,
		borderRadius: 25,
		padding: 18,
		marginBottom: 15,
		borderWidth: 1,
		borderColor: COLORS.border,
	},

	orderHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 18,
	},

	orderIcon: {
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

	orderHeaderInfo: {
		flex: 1,
	},

	orderTitle: {
		fontSize: 17,
		fontWeight: '900',
		color: COLORS.dark,
	},

	orderSubtitle: {
		marginTop: 3,
		fontSize: 12,
		lineHeight: 17,
		color: COLORS.muted,
	},

	ticketContainer: {
		alignItems: 'center',
		paddingTop: 15,
		paddingBottom: 20,
		borderTopWidth: 1,
		borderTopColor: COLORS.border,
	},

	ticketLabel: {
		fontSize: 14,
		fontWeight: '900',
		color: COLORS.dark,
		marginBottom: 12,
	},

	qrContainer: {
		padding: 14,
		backgroundColor: COLORS.white,
		borderRadius: 18,
		borderWidth: 1,
		borderColor: COLORS.border,
		...cardShadow,
	},

	noTickets: {
		paddingVertical: 20,
	},

	noTicketsText: {
		fontSize: 14,
		lineHeight: 19,
		color: COLORS.muted,
		textAlign: 'center',
	},

	totalCard: {
		width: '100%',
		backgroundColor: COLORS.cardLight,
		borderRadius: 25,
		padding: 18,
		marginBottom: 15,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		borderWidth: 1,
		borderColor: COLORS.border,
	},

	totalLabel: {
		fontSize: 13,
		fontWeight: '800',
		color: COLORS.muted,
	},

	totalAmount: {
		marginTop: 3,
		fontSize: 24,
		fontWeight: '900',
		color: COLORS.primary,
	},

	folioContainer: {
		alignItems: 'flex-end',
	},

	folioLabel: {
		fontSize: 12,
		color: COLORS.muted,
	},

	folio: {
		marginTop: 3,
		fontSize: 15,
		fontWeight: '900',
		color: COLORS.dark,
	},

	infoBox: {
		width: '100%',
		backgroundColor: '#F0F8F4',
		borderRadius: 20,
		padding: 16,
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: COLORS.border,
	},

	infoIcon: {
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

	infoIconText: {
		fontSize: 19,
		fontWeight: '900',
		color: COLORS.primary,
	},

	infoContent: {
		flex: 1,
	},

	infoTitle: {
		fontSize: 14,
		fontWeight: '900',
		color: COLORS.primary,
	},

	infoText: {
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

	footerInfo: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 12,
	},

	footerLabel: {
		fontSize: 14,
		fontWeight: '800',
		color: COLORS.muted,
	},

	footerTicketCount: {
		marginTop: 2,
		fontSize: 11,
		color: COLORS.muted,
	},

	footerAmount: {
		fontSize: 23,
		fontWeight: '900',
		color: COLORS.primary,
	},

	homeButtonWrapper: {
		width: '100%',
		height: 54,
		borderRadius: 17,
		backgroundColor: COLORS.button,
		borderWidth: 1,
		borderColor: COLORS.button,
		overflow: 'hidden',
		...cardShadow,
	},

	homeButton: {
		width: '100%',
		height: '100%',
		alignItems: 'center',
		justifyContent: 'center',
	},

	homeButtonContent: {
		width: '100%',
		height: '100%',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
	},

	homeButtonPressed: {
		backgroundColor: COLORS.buttonPressed,
	},

	homeButtonText: {
		color: COLORS.white,
		fontSize: 16,
		fontWeight: '900',
		textAlign: 'center',
	},
})
