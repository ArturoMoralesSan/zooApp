import { api } from '@/services/api'
import { getToken } from '@/services/auth'

import { QrCodeIcon, Ticket01Icon } from '@hugeicons/core-free-icons'

import { HugeiconsIcon } from '@hugeicons/react-native'
import { useRouter } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	ImageBackground,
	Modal,
	Pressable,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native'
import QRCode from 'react-native-qrcode-svg'

type Ticket = {
	id: number
	qr_token?: string | null
	status?: string | null
	used_at?: string | null
	ticket_type?: {
		id: number
		name: string
		price?: number | string
	}
	order?: {
		id?: number
		user_id?: number
		folio?: string | null
		status?: string | null
		subtotal?: number | string | null
		discount?: number | string | null
		total?: number | string | null
		paid_at?: string | null
		created_at?: string | null
	}
}

type Purchase = {
	orderId: number
	folio: string
	status: string
	total: number
	createdAt: string | null
	tickets: Ticket[]
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

	orange: '#B76E00',
	orangeLight: '#FFF0D4',

	button: '#246F4C',
	buttonPressed: '#1D5C3F',

	modalBackground: '#F7F9F8',

	overlay: 'rgba(0,0,0,0.45)',
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

const getTicketStatus = (ticket?: Ticket) => {
	if (!ticket) {
		return 'Sin estado'
	}

	const status = String(ticket.status ?? '').toLowerCase()

	switch (status) {
		case 'active':
		case 'activo':
			return 'Activa'

		case 'used':
		case 'usado':
			return 'Usada'

		case 'expired':
		case 'expirado':
			return 'Expirada'

		case 'cancelled':
		case 'canceled':
		case 'cancelado':
			return 'Cancelada'

		default:
			return ticket.status ?? 'Sin estado'
	}
}

export default function MyTicketsScreen() {
	const router = useRouter()

	const [tickets, setTickets] = useState<Ticket[]>([])
	const [loading, setLoading] = useState(true)
	const [tab, setTab] = useState<'active' | 'history'>('active')
	const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(
		null,
	)

	useEffect(() => {
		void loadTickets()
	}, [])

	const loadTickets = async () => {
		try {
			setLoading(true)

			const token = await getToken()

			if (!token) {
				router.replace('/login')
				return
			}

			const response = await api<any>('/tickets', {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			const data = response.data ?? response

			if (!Array.isArray(data)) {
				setTickets([])
				return
			}

			setTickets(data)
		} catch (error) {
			console.error('Error cargando entradas:', error)

			Alert.alert(
				'Mis entradas',
				error instanceof Error
					? error.message
					: 'No fue posible cargar tus entradas.',
			)
		} finally {
			setLoading(false)
		}
	}

	const purchases = useMemo<Purchase[]>(() => {
		const groups = new Map<number, Purchase>()

		for (const ticket of tickets) {
			const orderId = ticket.order?.id ?? ticket.id

			if (!groups.has(orderId)) {
				groups.set(orderId, {
					orderId,
					folio: ticket.order?.folio ?? `Boleto #${ticket.id}`,
					status: ticket.order?.status ?? '',
					total: Number(ticket.order?.total ?? 0),
					createdAt: ticket.order?.created_at ?? ticket.order?.paid_at ?? null,
					tickets: [],
				})
			}

			groups.get(orderId)!.tickets.push(ticket)
		}

		return Array.from(groups.values()).sort((a, b) => {
			const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0

			const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0

			return dateB - dateA
		})
	}, [tickets])

	const activePurchases = useMemo(() => {
		return purchases.filter((purchase) =>
			purchase.tickets.some((ticket) => {
				const status = String(ticket.status ?? '').toLowerCase()

				return status === 'active' || status === 'activo'
			}),
		)
	}, [purchases])

	const historyPurchases = useMemo(() => {
		return purchases.filter((purchase) =>
			purchase.tickets.every((ticket) => {
				const status = String(ticket.status ?? '').toLowerCase()

				return status !== 'active' && status !== 'activo'
			}),
		)
	}, [purchases])

	const visiblePurchases = tab === 'active' ? activePurchases : historyPurchases

	const formatPurchaseDate = (date?: string | null) => {
		if (!date) {
			return 'Fecha no disponible'
		}

		const parsedDate = new Date(date)

		if (Number.isNaN(parsedDate.getTime())) {
			return 'Fecha no disponible'
		}

		return parsedDate.toLocaleDateString('es-MX', {
			day: '2-digit',
			month: 'long',
			year: 'numeric',
		})
	}

	const formatPurchaseTime = (date?: string | null) => {
		if (!date) {
			return ''
		}

		const parsedDate = new Date(date)

		if (Number.isNaN(parsedDate.getTime())) {
			return ''
		}

		return parsedDate.toLocaleTimeString('es-MX', {
			hour: '2-digit',
			minute: '2-digit',
		})
	}

	const getTicketSummary = (purchase: Purchase) => {
		const quantities = new Map<string, number>()

		for (const ticket of purchase.tickets) {
			const name = ticket.ticket_type?.name ?? 'Entrada'

			quantities.set(name, (quantities.get(name) ?? 0) + 1)
		}

		return Array.from(quantities.entries())
			.map(([name, quantity]) => `${quantity} ${name}`)
			.join(' · ')
	}

	const getActiveCount = (purchase: Purchase) => {
		return purchase.tickets.filter((ticket) => {
			const status = String(ticket.status ?? '').toLowerCase()

			return status === 'active' || status === 'activo'
		}).length
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
				<View style={styles.backButtonWrapper}>
					<Pressable
						onPress={() => router.back()}
						className='flex-row items-center rounded-[18px] px-4 py-2.5'
						style={({ pressed }) => ({
							backgroundColor: pressed ? COLORS.card : COLORS.cardLight,
							borderWidth: 1,
							borderColor: COLORS.border,
							shadowColor: COLORS.primary,
							shadowOffset: {
								width: 0,
								height: 3,
							},
							shadowOpacity: 0.1,
							shadowRadius: 7,
							elevation: 3,
							opacity: pressed ? 0.75 : 1,
						})}
					>
						<Text
							className='mr-1 text-lg font-bold'
							style={{
								color: COLORS.primary,
							}}
						>
							‹
						</Text>

						<Text
							className='text-base font-semibold'
							style={{
								color: COLORS.dark,
							}}
						>
							Regresar
						</Text>
					</Pressable>
				</View>

				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.scrollContent}
				>
					<View style={styles.header}>
						<Text style={styles.title}>Mis entradas</Text>

						<Text style={styles.subtitle}>
							Consulta tus compras y entradas.
						</Text>
					</View>

					<View style={styles.statsContainer}>
						<View style={styles.statCard}>
							<View style={styles.statIcon}>
								<HugeiconsIcon
									icon={Ticket01Icon}
									size={21}
									strokeWidth={1.8}
									color={COLORS.primary}
								/>
							</View>

							<View>
								<Text style={styles.statNumber}>{activePurchases.length}</Text>

								<Text style={styles.statLabel}>Compras activas</Text>
							</View>
						</View>

						<View style={styles.statCard}>
							<View style={styles.statIcon}>
								<HugeiconsIcon
									icon={Ticket01Icon}
									size={21}
									strokeWidth={1.8}
									color={COLORS.muted}
								/>
							</View>

							<View>
								<Text style={styles.statNumber}>{historyPurchases.length}</Text>

								<Text style={styles.statLabel}>Historial</Text>
							</View>
						</View>
					</View>

					<View style={styles.tabsContainer}>
						<Pressable
							onPress={() => setTab('active')}
							style={[styles.tab, tab === 'active' && styles.tabActive]}
						>
							<Text
								style={[
									styles.tabText,
									tab === 'active' && styles.tabTextActive,
								]}
							>
								Activas
							</Text>

							<View
								style={[
									styles.tabCount,
									tab === 'active' && styles.tabCountActive,
								]}
							>
								<Text
									style={[
										styles.tabCountText,
										tab === 'active' && styles.tabCountTextActive,
									]}
								>
									{activePurchases.length}
								</Text>
							</View>
						</Pressable>

						<Pressable
							onPress={() => setTab('history')}
							style={[styles.tab, tab === 'history' && styles.tabActive]}
						>
							<Text
								style={[
									styles.tabText,
									tab === 'history' && styles.tabTextActive,
								]}
							>
								Historial
							</Text>

							<View
								style={[
									styles.tabCount,
									tab === 'history' && styles.tabCountActive,
								]}
							>
								<Text
									style={[
										styles.tabCountText,
										tab === 'history' && styles.tabCountTextActive,
									]}
								>
									{historyPurchases.length}
								</Text>
							</View>
						</Pressable>
					</View>

					{loading ? (
						<View style={styles.loadingContainer}>
							<ActivityIndicator size='large' color={COLORS.primary} />

							<Text style={styles.loadingText}>Cargando tus entradas...</Text>
						</View>
					) : visiblePurchases.length === 0 ? (
						<View style={styles.emptyCard}>
							<View style={styles.emptyIcon}>
								<HugeiconsIcon
									icon={Ticket01Icon}
									size={32}
									strokeWidth={1.8}
									color={COLORS.primary}
								/>
							</View>

							<Text style={styles.emptyTitle}>
								{tab === 'active'
									? 'No tienes compras activas'
									: 'No tienes historial'}
							</Text>

							<Text style={styles.emptyText}>
								{tab === 'active'
									? 'Cuando compres una entrada aparecerá aquí.'
									: 'Tus compras anteriores aparecerán aquí.'}
							</Text>

							{tab === 'active' && (
								<View style={styles.buyButtonWrapper}>
									<Pressable
										onPress={() => router.push('/tickets')}
										style={({ pressed }) => ({
											...styles.buyButton,
											backgroundColor: pressed
												? COLORS.buttonPressed
												: COLORS.button,
										})}
									>
										<Text style={styles.buyButtonText}>Comprar boletos</Text>
									</Pressable>
								</View>
							)}
						</View>
					) : (
						<View style={styles.purchasesList}>
							{visiblePurchases.map((purchase) => (
								<View key={purchase.orderId} style={styles.purchaseCard}>
									<View style={styles.purchaseHeader}>
										<View style={styles.purchaseIcon}>
											<HugeiconsIcon
												icon={Ticket01Icon}
												size={25}
												strokeWidth={1.8}
												color={COLORS.primary}
											/>
										</View>

										<View style={styles.purchaseInfo}>
											<Text style={styles.purchaseTitle}>
												Compra #{purchase.orderId}
											</Text>

											<Text style={styles.folio}>{purchase.folio}</Text>
										</View>

										<View style={styles.statusBadge}>
											<Text style={styles.statusText}>
												{getActiveCount(purchase) > 0
													? 'Activa'
													: getTicketStatus(purchase.tickets[0])}
											</Text>
										</View>
									</View>

									<View style={styles.divider} />

									<View style={styles.infoRow}>
										<View style={styles.infoBlock}>
											<Text style={styles.infoLabel}>Fecha de compra</Text>

											<Text style={styles.infoValue}>
												{formatPurchaseDate(purchase.createdAt)}
											</Text>

											{formatPurchaseTime(purchase.createdAt) ? (
												<Text style={styles.infoTime}>
													{formatPurchaseTime(purchase.createdAt)}
												</Text>
											) : null}
										</View>

										<View style={styles.infoBlockRight}>
											<Text style={styles.infoLabel}>Total</Text>

											<Text style={styles.totalValue}>
												${purchase.total.toFixed(2)}
											</Text>
										</View>
									</View>

									<View style={styles.ticketSummary}>
										<HugeiconsIcon
											icon={Ticket01Icon}
											size={17}
											strokeWidth={1.8}
											color={COLORS.primary}
										/>

										<Text style={styles.ticketSummaryText}>
											{getTicketSummary(purchase)}
										</Text>
									</View>

									<View style={styles.qrButtonWrapper}>
										<Pressable
											onPress={() => setSelectedPurchase(purchase)}
											style={({ pressed }) => ({
												...styles.qrButton,
												backgroundColor: pressed
													? COLORS.buttonPressed
													: COLORS.button,
											})}
										>
											<View style={styles.qrButtonContent}>
												<HugeiconsIcon
													icon={QrCodeIcon}
													size={19}
													strokeWidth={1.8}
													color={COLORS.white}
												/>

												<Text style={styles.qrButtonText}>VER CÓDIGOS QR</Text>
											</View>
										</Pressable>
									</View>
								</View>
							))}
						</View>
					)}

					<View style={{ height: 40 }} />
				</ScrollView>

				<Modal
					visible={selectedPurchase !== null}
					transparent
					animationType='slide'
					onRequestClose={() => setSelectedPurchase(null)}
				>
					<View style={styles.modalOverlay}>
						<ImageBackground
							source={require('@/assets/images/zoo-pattern.png')}
							style={styles.qrModalCard}
							imageStyle={styles.qrModalPattern}
							resizeMode='repeat'
						>
							<View style={styles.modalHeader}>
								<View style={styles.modalTitleContainer}>
									<View style={styles.modalIcon}>
										<HugeiconsIcon
											icon={QrCodeIcon}
											size={25}
											strokeWidth={1.8}
											color={COLORS.primary}
										/>
									</View>

									<View style={styles.modalTitleInfo}>
										<Text style={styles.modalTitle}>Tus entradas</Text>

										<Text style={styles.modalSubtitle}>
											{selectedPurchase?.folio}
										</Text>
									</View>
								</View>

								<Pressable
									onPress={() => setSelectedPurchase(null)}
									style={({ pressed }) => [
										styles.closeButton,
										pressed && {
											opacity: 0.7,
										},
									]}
								>
									<Text style={styles.closeText}>×</Text>
								</Pressable>
							</View>

							{selectedPurchase && (
								<Text style={styles.modalDate}>
									Compra realizada el{' '}
									{formatPurchaseDate(selectedPurchase.createdAt)}
									{formatPurchaseTime(selectedPurchase.createdAt)
										? ` · ${formatPurchaseTime(selectedPurchase.createdAt)}`
										: ''}
								</Text>
							)}

							<ScrollView
								showsVerticalScrollIndicator={false}
								contentContainerStyle={styles.qrList}
							>
								{selectedPurchase?.tickets.map((ticket, index) => (
									<View key={ticket.id} style={styles.qrTicketCard}>
										<View style={styles.qrTicketHeader}>
											<View>
												<Text style={styles.qrTicketName}>
													{ticket.ticket_type?.name ?? 'Entrada'}
												</Text>

												<Text style={styles.qrTicketNumber}>
													Entrada {index + 1} de{' '}
													{selectedPurchase.tickets.length}
												</Text>
											</View>

											<View style={styles.qrTicketStatus}>
												<Text style={styles.qrTicketStatusText}>
													{getTicketStatus(ticket)}
												</Text>
											</View>
										</View>

										<View style={styles.qrWrapper}>
											{ticket.qr_token && ticket.qr_token.trim() !== '' ? (
												<QRCode
													value={ticket.qr_token}
													size={210}
													backgroundColor={COLORS.white}
													color='#000000'
													quietZone={4}
												/>
											) : (
												<View style={styles.qrError}>
													<HugeiconsIcon
														icon={QrCodeIcon}
														size={45}
														strokeWidth={1.8}
														color={COLORS.coral}
													/>

													<Text style={styles.qrErrorText}>
														Este boleto no tiene QR disponible.
													</Text>

													<Text style={styles.qrTokenDebug}>
														Token: {String(ticket.qr_token ?? 'NULL')}
													</Text>
												</View>
											)}
										</View>
									</View>
								))}
							</ScrollView>
						</ImageBackground>
					</View>
				</Modal>
			</ImageBackground>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	background: {
		flex: 1,
	},

	container: {
		flex: 1,
		backgroundColor: COLORS.background,
	},

	backButtonWrapper: {
		position: 'absolute',
		left: 20,
		top: 56,
		zIndex: 20,
	},

	scrollContent: {
		paddingHorizontal: 20,
		paddingTop: 125,
		paddingBottom: 40,
	},

	header: {
		marginBottom: 20,
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

	statsContainer: {
		flexDirection: 'row',
		gap: 12,
		marginBottom: 18,
	},

	statCard: {
		flex: 1,
		backgroundColor: COLORS.card,
		borderRadius: 22,
		padding: 14,
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: COLORS.border,
		...cardShadow,
	},

	statIcon: {
		width: 42,
		height: 42,
		borderRadius: 15,
		backgroundColor: COLORS.active,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 10,
		borderWidth: 1,
		borderColor: COLORS.border,
	},

	statNumber: {
		fontSize: 20,
		fontWeight: '900',
		color: COLORS.dark,
	},

	statLabel: {
		marginTop: 1,
		fontSize: 11,
		color: COLORS.muted,
	},

	tabsContainer: {
		flexDirection: 'row',
		backgroundColor: COLORS.card,
		borderRadius: 18,
		padding: 4,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: COLORS.border,
	},

	tab: {
		flex: 1,
		height: 45,
		borderRadius: 14,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 7,
	},

	tabActive: {
		backgroundColor: COLORS.white,
		...cardShadow,
	},

	tabText: {
		fontSize: 14,
		fontWeight: '700',
		color: COLORS.muted,
	},

	tabTextActive: {
		color: COLORS.primary,
	},

	tabCount: {
		minWidth: 22,
		height: 22,
		paddingHorizontal: 6,
		borderRadius: 11,
		backgroundColor: COLORS.active,
		alignItems: 'center',
		justifyContent: 'center',
	},

	tabCountActive: {
		backgroundColor: COLORS.primary,
	},

	tabCountText: {
		fontSize: 11,
		fontWeight: '800',
		color: COLORS.muted,
	},

	tabCountTextActive: {
		color: COLORS.white,
	},

	loadingContainer: {
		paddingVertical: 60,
		alignItems: 'center',
		justifyContent: 'center',
	},

	loadingText: {
		marginTop: 12,
		fontSize: 14,
		color: COLORS.muted,
	},

	emptyCard: {
		backgroundColor: COLORS.cardLight,
		borderRadius: 28,
		paddingHorizontal: 25,
		paddingVertical: 35,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: COLORS.border,
		...cardShadow,
	},

	emptyIcon: {
		width: 68,
		height: 68,
		borderRadius: 22,
		backgroundColor: COLORS.active,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 16,
		borderWidth: 1,
		borderColor: COLORS.border,
	},

	emptyTitle: {
		fontSize: 18,
		fontWeight: '900',
		color: COLORS.dark,
		textAlign: 'center',
	},

	emptyText: {
		marginTop: 7,
		fontSize: 13,
		lineHeight: 19,
		color: COLORS.muted,
		textAlign: 'center',
	},

	buyButtonWrapper: {
		width: '100%',
		marginTop: 20,
		borderRadius: 17,
		overflow: 'hidden',
		backgroundColor: COLORS.button,
		...cardShadow,
	},

	buyButton: {
		width: '100%',
		height: 48,
		alignItems: 'center',
		justifyContent: 'center',
	},

	buyButtonText: {
		color: COLORS.white,
		fontSize: 14,
		fontWeight: '800',
	},

	purchasesList: {
		width: '100%',
	},

	purchaseCard: {
		width: '100%',
		backgroundColor: COLORS.cardLight,
		borderRadius: 28,
		padding: 17,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: COLORS.border,
		...cardShadow,
	},

	purchaseHeader: {
		flexDirection: 'row',
		alignItems: 'center',
	},

	purchaseIcon: {
		width: 50,
		height: 50,
		borderRadius: 17,
		backgroundColor: COLORS.active,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 12,
		borderWidth: 1,
		borderColor: COLORS.border,
	},

	purchaseInfo: {
		flex: 1,
		minWidth: 0,
	},

	purchaseTitle: {
		fontSize: 16,
		fontWeight: '800',
		color: COLORS.dark,
	},

	folio: {
		marginTop: 4,
		fontSize: 12,
		color: COLORS.muted,
	},

	statusBadge: {
		borderRadius: 12,
		paddingHorizontal: 10,
		paddingVertical: 6,
		marginLeft: 8,
		backgroundColor: COLORS.active,
		borderWidth: 1,
		borderColor: COLORS.border,
	},

	statusText: {
		fontSize: 11,
		fontWeight: '800',
		color: COLORS.primary,
	},

	divider: {
		height: 1,
		backgroundColor: COLORS.border,
		marginVertical: 14,
	},

	infoRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},

	infoBlock: {
		flex: 1,
	},

	infoBlockRight: {
		alignItems: 'flex-end',
	},

	infoLabel: {
		fontSize: 11,
		color: COLORS.muted,
	},

	infoValue: {
		marginTop: 3,
		fontSize: 13,
		fontWeight: '700',
		color: COLORS.dark,
	},

	infoTime: {
		marginTop: 2,
		fontSize: 11,
		color: COLORS.muted,
	},

	totalValue: {
		marginTop: 3,
		fontSize: 17,
		fontWeight: '900',
		color: COLORS.primary,
	},

	ticketSummary: {
		width: '100%',
		marginTop: 15,
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderRadius: 16,
		backgroundColor: COLORS.active,
		borderWidth: 1,
		borderColor: COLORS.border,
	},

	ticketSummaryText: {
		flex: 1,
		marginLeft: 8,
		fontSize: 12,
		fontWeight: '700',
		color: COLORS.dark,
	},

	qrButtonWrapper: {
		width: '100%',
		height: 50,
		marginTop: 14,
		borderRadius: 17,
		overflow: 'hidden',
		backgroundColor: COLORS.button,
		borderWidth: 1,
		borderColor: COLORS.button,
		...cardShadow,
	},

	qrButton: {
		width: '100%',
		height: '100%',
		alignItems: 'center',
		justifyContent: 'center',
	},

	qrButtonContent: {
		width: '100%',
		height: '100%',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},

	qrButtonText: {
		marginLeft: 8,
		fontSize: 13,
		fontWeight: '800',
		color: COLORS.white,
		textAlign: 'center',
	},

	modalOverlay: {
		flex: 1,
		backgroundColor: COLORS.overlay,
		justifyContent: 'flex-end',
	},

	qrModalCard: {
		maxHeight: '90%',
		backgroundColor: COLORS.modalBackground,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		paddingHorizontal: 20,
		paddingTop: 20,
		paddingBottom: 25,
		borderTopWidth: 1,
		borderColor: COLORS.border,
		overflow: 'hidden',
	},

	qrModalPattern: {
		opacity: 0.6,
	},

	modalHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},

	modalTitleContainer: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
	},

	modalIcon: {
		width: 46,
		height: 46,
		borderRadius: 16,
		backgroundColor: COLORS.active,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 11,
		borderWidth: 1,
		borderColor: COLORS.border,
	},

	modalTitleInfo: {
		flex: 1,
	},

	modalTitle: {
		fontSize: 19,
		fontWeight: '900',
		color: COLORS.dark,
	},

	modalSubtitle: {
		marginTop: 3,
		fontSize: 11,
		color: COLORS.muted,
	},

	closeButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: COLORS.card,
		alignItems: 'center',
		justifyContent: 'center',
		marginLeft: 10,
		borderWidth: 1,
		borderColor: COLORS.border,
	},

	closeText: {
		fontSize: 25,
		lineHeight: 28,
		color: COLORS.dark,
	},

	modalDate: {
		marginTop: 12,
		marginBottom: 10,
		fontSize: 12,
		color: COLORS.muted,
	},

	qrList: {
		paddingBottom: 5,
	},

	qrTicketCard: {
		backgroundColor: COLORS.cardLight,
		borderRadius: 24,
		padding: 15,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: COLORS.border,
		...cardShadow,
	},

	qrTicketHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},

	qrTicketName: {
		fontSize: 15,
		fontWeight: '800',
		color: COLORS.dark,
	},

	qrTicketNumber: {
		marginTop: 3,
		fontSize: 11,
		color: COLORS.muted,
	},

	qrTicketStatus: {
		paddingHorizontal: 9,
		paddingVertical: 5,
		borderRadius: 10,
		backgroundColor: COLORS.active,
		borderWidth: 1,
		borderColor: COLORS.border,
	},

	qrTicketStatusText: {
		fontSize: 10,
		fontWeight: '800',
		color: COLORS.primary,
	},

	qrWrapper: {
		alignSelf: 'center',
		marginTop: 14,
		padding: 12,
		borderRadius: 20,
		backgroundColor: COLORS.white,
		borderWidth: 1,
		borderColor: COLORS.border,
		minWidth: 236,
		minHeight: 236,
		alignItems: 'center',
		justifyContent: 'center',
		...cardShadow,
	},

	qrError: {
		width: 210,
		height: 210,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 15,
	},

	qrErrorText: {
		marginTop: 10,
		fontSize: 13,
		textAlign: 'center',
		color: COLORS.coral,
		fontWeight: '700',
	},

	qrTokenDebug: {
		marginTop: 8,
		fontSize: 9,
		textAlign: 'center',
		color: COLORS.muted,
	},

	closeModalButtonWrapper: {
		width: '100%',
		height: 52,
		marginTop: 14,
		borderRadius: 18,
		overflow: 'hidden',
		backgroundColor: COLORS.button,
		...cardShadow,
		alignItems: 'center',
		justifyContent: 'center',
	},

	closeModalButton: {
		width: '100%',
		height: '100%',
		alignItems: 'center',
		justifyContent: 'center',
	},

	closeModalButtonText: {
		color: COLORS.white,
		fontSize: 15,
		fontWeight: '800',
		textAlign: 'center',
	},
})
