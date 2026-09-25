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
	ScrollView,
	Text,
	View,
} from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import { SafeAreaView } from 'react-native-safe-area-context'

import {
	backButtonPressedStyle,
	backButtonStyle,
	backgroundImageStyle,
	backgroundStyle,
	backTextStyle,
	bottomSpaceStyle,
	buyButtonPressedStyle,
	buyButtonStyle,
	buyButtonTextStyle,
	buyButtonWrapperStyle,
	closeButtonPressedStyle,
	closeButtonStyle,
	closeTextStyle,
	colors,
	containerStyle,
	dividerStyle,
	emptyCardStyle,
	emptyIconStyle,
	emptyTextStyle,
	emptyTitleStyle,
	folioStyle,
	headerStyle,
	infoBlockRightStyle,
	infoBlockStyle,
	infoLabelStyle,
	infoRowStyle,
	infoTimeStyle,
	infoValueStyle,
	loadingContainerStyle,
	loadingTextStyle,
	modalDateStyle,
	modalHeaderStyle,
	modalIconStyle,
	modalOverlayStyle,
	modalSubtitleStyle,
	modalTitleContainerStyle,
	modalTitleInfoStyle,
	modalTitleStyle,
	purchaseCardStyle,
	purchaseHeaderStyle,
	purchaseIconStyle,
	purchaseInfoStyle,
	purchasesListStyle,
	purchaseTitleStyle,
	qrButtonContentStyle,
	qrButtonPressedStyle,
	qrButtonStyle,
	qrButtonTextStyle,
	qrButtonWrapperStyle,
	qrErrorStyle,
	qrErrorTextStyle,
	qrListStyle,
	qrModalCardStyle,
	qrModalPatternStyle,
	qrTicketCardStyle,
	qrTicketHeaderStyle,
	qrTicketNameStyle,
	qrTicketNumberStyle,
	qrTicketStatusStyle,
	qrTicketStatusTextStyle,
	qrTokenDebugStyle,
	qrWrapperStyle,
	scrollContentStyle,
	statCardStyle,
	statIconStyle,
	statLabelStyle,
	statNumberStyle,
	statsContainerStyle,
	statusBadgeStyle,
	statusTextStyle,
	subtitleStyle,
	tabActiveStyle,
	tabCountActiveStyle,
	tabCountStyle,
	tabCountTextActiveStyle,
	tabCountTextStyle,
	tabsContainerStyle,
	tabStyle,
	tabTextActiveStyle,
	tabTextStyle,
	ticketSummaryStyle,
	ticketSummaryTextStyle,
	titleStyle,
	totalValueStyle,
} from '@/styles/my-tickets'

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
		<SafeAreaView style={containerStyle} edges={['top', 'left', 'right']}>
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				style={backgroundStyle}
				resizeMode='repeat'
				imageStyle={backgroundImageStyle}
			>
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={scrollContentStyle}
				>
					<Pressable
						onPress={() => router.back()}
						style={({ pressed }) => [
							backButtonStyle,
							pressed && backButtonPressedStyle,
						]}
					>
						<Text style={backTextStyle}>‹</Text>

						<Text style={backTextStyle}>Regresar</Text>
					</Pressable>

					<View style={headerStyle}>
						<Text style={titleStyle}>Mis entradas</Text>

						<Text style={subtitleStyle}>Consulta tus compras y entradas.</Text>
					</View>

					<View style={statsContainerStyle}>
						<View style={statCardStyle}>
							<View style={statIconStyle}>
								<HugeiconsIcon
									icon={Ticket01Icon}
									size={21}
									strokeWidth={1.8}
									color={colors.primary}
								/>
							</View>

							<View>
								<Text style={statNumberStyle}>{activePurchases.length}</Text>

								<Text style={statLabelStyle}>Compras activas</Text>
							</View>
						</View>

						<View style={statCardStyle}>
							<View style={statIconStyle}>
								<HugeiconsIcon
									icon={Ticket01Icon}
									size={21}
									strokeWidth={1.8}
									color={colors.muted}
								/>
							</View>

							<View>
								<Text style={statNumberStyle}>{historyPurchases.length}</Text>

								<Text style={statLabelStyle}>Historial</Text>
							</View>
						</View>
					</View>

					<View style={tabsContainerStyle}>
						<Pressable
							onPress={() => setTab('active')}
							style={[tabStyle, tab === 'active' && tabActiveStyle]}
						>
							<Text
								style={[tabTextStyle, tab === 'active' && tabTextActiveStyle]}
							>
								Activas
							</Text>

							<View
								style={[tabCountStyle, tab === 'active' && tabCountActiveStyle]}
							>
								<Text
									style={[
										tabCountTextStyle,
										tab === 'active' && tabCountTextActiveStyle,
									]}
								>
									{activePurchases.length}
								</Text>
							</View>
						</Pressable>

						<Pressable
							onPress={() => setTab('history')}
							style={[tabStyle, tab === 'history' && tabActiveStyle]}
						>
							<Text
								style={[tabTextStyle, tab === 'history' && tabTextActiveStyle]}
							>
								Historial
							</Text>

							<View
								style={[
									tabCountStyle,
									tab === 'history' && tabCountActiveStyle,
								]}
							>
								<Text
									style={[
										tabCountTextStyle,
										tab === 'history' && tabCountTextActiveStyle,
									]}
								>
									{historyPurchases.length}
								</Text>
							</View>
						</Pressable>
					</View>

					{loading ? (
						<View style={loadingContainerStyle}>
							<ActivityIndicator size='large' color={colors.primary} />

							<Text style={loadingTextStyle}>Cargando tus entradas...</Text>
						</View>
					) : visiblePurchases.length === 0 ? (
						<View style={emptyCardStyle}>
							<View style={emptyIconStyle}>
								<HugeiconsIcon
									icon={Ticket01Icon}
									size={32}
									strokeWidth={1.8}
									color={colors.primary}
								/>
							</View>

							<Text style={emptyTitleStyle}>
								{tab === 'active'
									? 'No tienes compras activas'
									: 'No tienes historial'}
							</Text>

							<Text style={emptyTextStyle}>
								{tab === 'active'
									? 'Cuando compres una entrada aparecerá aquí.'
									: 'Tus compras anteriores aparecerán aquí.'}
							</Text>

							{tab === 'active' && (
								<View style={buyButtonWrapperStyle}>
									<Pressable
										onPress={() => router.push('/tickets')}
										style={({ pressed }) => [
											buyButtonStyle,
											pressed && buyButtonPressedStyle,
										]}
									>
										<Text style={buyButtonTextStyle}>Comprar boletos</Text>
									</Pressable>
								</View>
							)}
						</View>
					) : (
						<View style={purchasesListStyle}>
							{visiblePurchases.map((purchase) => (
								<View key={purchase.orderId} style={purchaseCardStyle}>
									<View style={purchaseHeaderStyle}>
										<View style={purchaseIconStyle}>
											<HugeiconsIcon
												icon={Ticket01Icon}
												size={25}
												strokeWidth={1.8}
												color={colors.primary}
											/>
										</View>

										<View style={purchaseInfoStyle}>
											<Text style={purchaseTitleStyle}>
												Compra #{purchase.orderId}
											</Text>

											<Text style={folioStyle}>{purchase.folio}</Text>
										</View>

										<View style={statusBadgeStyle}>
											<Text style={statusTextStyle}>
												{getActiveCount(purchase) > 0
													? 'Activa'
													: getTicketStatus(purchase.tickets[0])}
											</Text>
										</View>
									</View>

									<View style={dividerStyle} />

									<View style={infoRowStyle}>
										<View style={infoBlockStyle}>
											<Text style={infoLabelStyle}>Fecha de compra</Text>

											<Text style={infoValueStyle}>
												{formatPurchaseDate(purchase.createdAt)}
											</Text>

											{formatPurchaseTime(purchase.createdAt) ? (
												<Text style={infoTimeStyle}>
													{formatPurchaseTime(purchase.createdAt)}
												</Text>
											) : null}
										</View>

										<View style={infoBlockRightStyle}>
											<Text style={infoLabelStyle}>Total</Text>

											<Text style={totalValueStyle}>
												${purchase.total.toFixed(2)}
											</Text>
										</View>
									</View>

									<View style={ticketSummaryStyle}>
										<HugeiconsIcon
											icon={Ticket01Icon}
											size={17}
											strokeWidth={1.8}
											color={colors.primary}
										/>

										<Text style={ticketSummaryTextStyle}>
											{getTicketSummary(purchase)}
										</Text>
									</View>

									<View style={qrButtonWrapperStyle}>
										<Pressable
											onPress={() => setSelectedPurchase(purchase)}
											style={({ pressed }) => [
												qrButtonStyle,
												pressed && qrButtonPressedStyle,
											]}
										>
											<View style={qrButtonContentStyle}>
												<HugeiconsIcon
													icon={QrCodeIcon}
													size={19}
													strokeWidth={1.8}
													color={colors.white}
												/>

												<Text style={qrButtonTextStyle}>VER CÓDIGOS QR</Text>
											</View>
										</Pressable>
									</View>
								</View>
							))}
						</View>
					)}

					<View style={bottomSpaceStyle} />
				</ScrollView>

				<Modal
					visible={selectedPurchase !== null}
					transparent
					animationType='slide'
					onRequestClose={() => setSelectedPurchase(null)}
				>
					<View style={modalOverlayStyle}>
						<ImageBackground
							source={require('@/assets/images/zoo-pattern.png')}
							style={qrModalCardStyle}
							imageStyle={qrModalPatternStyle}
							resizeMode='repeat'
						>
							<View style={modalHeaderStyle}>
								<View style={modalTitleContainerStyle}>
									<View style={modalIconStyle}>
										<HugeiconsIcon
											icon={QrCodeIcon}
											size={25}
											strokeWidth={1.8}
											color={colors.primary}
										/>
									</View>

									<View style={modalTitleInfoStyle}>
										<Text style={modalTitleStyle}>Tus entradas</Text>

										<Text style={modalSubtitleStyle}>
											{selectedPurchase?.folio}
										</Text>
									</View>
								</View>

								<Pressable
									onPress={() => setSelectedPurchase(null)}
									style={({ pressed }) => [
										closeButtonStyle,
										pressed && closeButtonPressedStyle,
									]}
								>
									<Text style={closeTextStyle}>×</Text>
								</Pressable>
							</View>

							{selectedPurchase && (
								<Text style={modalDateStyle}>
									Compra realizada el{' '}
									{formatPurchaseDate(selectedPurchase.createdAt)}
									{formatPurchaseTime(selectedPurchase.createdAt)
										? ` · ${formatPurchaseTime(selectedPurchase.createdAt)}`
										: ''}
								</Text>
							)}

							<ScrollView
								showsVerticalScrollIndicator={false}
								contentContainerStyle={qrListStyle}
							>
								{selectedPurchase?.tickets.map((ticket, index) => (
									<View key={ticket.id} style={qrTicketCardStyle}>
										<View style={qrTicketHeaderStyle}>
											<View>
												<Text style={qrTicketNameStyle}>
													{ticket.ticket_type?.name ?? 'Entrada'}
												</Text>

												<Text style={qrTicketNumberStyle}>
													Entrada {index + 1} de{' '}
													{selectedPurchase.tickets.length}
												</Text>
											</View>

											<View style={qrTicketStatusStyle}>
												<Text style={qrTicketStatusTextStyle}>
													{getTicketStatus(ticket)}
												</Text>
											</View>
										</View>

										<View style={qrWrapperStyle}>
											{ticket.qr_token && ticket.qr_token.trim() !== '' ? (
												<QRCode
													value={ticket.qr_token}
													size={210}
													backgroundColor={colors.white}
													color='#000000'
													quietZone={4}
												/>
											) : (
												<View style={qrErrorStyle}>
													<HugeiconsIcon
														icon={QrCodeIcon}
														size={45}
														strokeWidth={1.8}
														color={colors.coral}
													/>

													<Text style={qrErrorTextStyle}>
														Este boleto no tiene QR disponible.
													</Text>

													<Text style={qrTokenDebugStyle}>
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
