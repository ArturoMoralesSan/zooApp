import { api } from '@/services/api'
import { getToken } from '@/services/auth'

import {
	Calendar03Icon,
	Clock01Icon,
	QrCodeIcon,
	Ticket01Icon,
} from '@hugeicons/core-free-icons'
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
	type ViewStyle,
} from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import { SafeAreaView } from 'react-native-safe-area-context'

import ActionButton from '@/components/ActionButton'
import BackButton from '@/components/BackButton'
import UserHeader from '@/components/UserHeader'

import colors from '@/theme/colors'

const ICON_COLORS = {
	primary: '#187744',
	muted: '#718477',
	coral: '#D95C4F',
} as const

const cardShadow: ViewStyle = {
	shadowColor: '#244334',
	shadowOffset: { width: 0, height: 3 },
	shadowOpacity: 0.055,
	shadowRadius: 8,
	elevation: 2,
}

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
		<SafeAreaView className='flex-1 bg-blanco' edges={['top', 'left', 'right']}>
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				className='flex-1 bg-blanco'
				resizeMode='repeat'
				imageClassName='opacity-[0.12]'
			>
				<ScrollView
					className='flex-1'
					showsVerticalScrollIndicator={false}
					contentContainerClassName='px-5 pb-10 pt-2.5'
				>
					<View className='mb-4'>
						<BackButton onPress={() => router.back()} position='relative' />
					</View>

					<UserHeader
						title='Mis entradas'
						subtitle='Consulta tus compras y entradas.'
						showRewards={false}
					/>

					<View className='mb-5 flex-row gap-3'>
						<View
							className='flex-1 flex-row items-center rounded-[20px] border border-[#DCE7DF] bg-[#F2F7F4] p-[13px]'
							style={cardShadow}
						>
							<View className='mr-2.5 h-10 w-10 items-center justify-center rounded-[14px] bg-[#E4F2E8]'>
								<HugeiconsIcon
									icon={Ticket01Icon}
									size={21}
									color={ICON_COLORS.primary}
								/>
							</View>

							<View>
								<Text className='text-[20px] font-extrabold text-[#244334]'>
									{activePurchases.length}
								</Text>
								<Text className='mt-[3px] text-[11px] font-medium text-[#718477]'>
									Compras activas
								</Text>
							</View>
						</View>

						<View
							className='flex-1 flex-row items-center rounded-[20px] border border-[#DCE7DF] bg-[#F2F7F4] p-[13px]'
							style={cardShadow}
						>
							<View className='mr-2.5 h-10 w-10 items-center justify-center rounded-[14px] bg-[#E4F2E8]'>
								<HugeiconsIcon
									icon={Ticket01Icon}
									size={21}
									color={ICON_COLORS.muted}
								/>
							</View>

							<View>
								<Text className='text-[20px] font-extrabold text-[#244334]'>
									{historyPurchases.length}
								</Text>
								<Text className='mt-[3px] text-[11px] font-medium text-[#718477]'>
									Historial
								</Text>
							</View>
						</View>
					</View>

					<View className='mb-[18px] flex-row rounded-2xl border border-[#DCE7DF] bg-[#F2F7F4] p-1'>
						<Pressable
							onPress={() => setTab('active')}
							className={`min-h-11 flex-1 flex-row items-center justify-center gap-[7px] rounded-xl ${tab === 'active' ? 'bg-[#187744]' : ''}`}
						>
							<Text
								className={`text-[13px] ${tab === 'active' ? 'font-extrabold text-blanco' : 'font-semibold text-[#718477]'}`}
							>
								Activas
							</Text>

							<View
								className={`h-[22px] min-w-[22px] items-center justify-center rounded-[11px] px-1.5 ${tab === 'active' ? 'bg-blanco' : 'bg-[#E4F2E8]'}`}
							>
								<Text
									className={`text-[11px] font-bold ${tab === 'active' ? 'text-[#187744]' : 'text-[#244334]'}`}
								>
									{activePurchases.length}
								</Text>
							</View>
						</Pressable>

						<Pressable
							onPress={() => setTab('history')}
							className={`min-h-11 flex-1 flex-row items-center justify-center gap-[7px] rounded-xl ${tab === 'history' ? 'bg-[#187744]' : ''}`}
						>
							<Text
								className={`text-[13px] ${tab === 'history' ? 'font-extrabold text-blanco' : 'font-semibold text-[#718477]'}`}
							>
								Historial
							</Text>

							<View
								className={`h-[22px] min-w-[22px] items-center justify-center rounded-[11px] px-1.5 ${tab === 'history' ? 'bg-blanco' : 'bg-[#E4F2E8]'}`}
							>
								<Text
									className={`text-[11px] font-bold ${tab === 'history' ? 'text-[#187744]' : 'text-[#244334]'}`}
								>
									{historyPurchases.length}
								</Text>
							</View>
						</Pressable>
					</View>

					{loading ? (
						<View className='items-center justify-center py-[60px]'>
							<ActivityIndicator size='large' color={ICON_COLORS.primary} />
							<Text className='mt-3 text-[14px] text-[#718477]'>
								Cargando tus entradas...
							</Text>
						</View>
					) : visiblePurchases.length === 0 ? (
						<View
							className='items-center rounded-3xl border border-[#DCE7DF] bg-[#F2F7F4] px-6 py-8'
							style={cardShadow}
						>
							<View className='mb-4 h-[66px] w-[66px] items-center justify-center rounded-[21px] bg-[#E4F2E8]'>
								<HugeiconsIcon
									icon={Ticket01Icon}
									size={32}
									color={ICON_COLORS.primary}
								/>
							</View>

							<Text className='text-center text-[18px] font-extrabold text-[#244334]'>
								{tab === 'active'
									? 'No tienes compras activas'
									: 'No tienes historial'}
							</Text>

							<Text className='mt-[7px] text-center text-[13px] leading-5 text-[#718477]'>
								{tab === 'active'
									? 'Cuando compres una entrada aparecerá aquí.'
									: 'Tus compras anteriores aparecerán aquí.'}
							</Text>

							{tab === 'active' && (
								<View className='mt-5 w-full'>
									<ActionButton
										title='Comprar boletos'
										onPress={() => router.push('/tickets')}
									/>
								</View>
							)}
						</View>
					) : (
						<View className='w-full'>
							{visiblePurchases.map((purchase) => (
								<View
									key={purchase.orderId}
									className='mb-3.5 w-full rounded-[22px] border border-[#DCE7DF] bg-[#F2F7F4] p-4'
									style={cardShadow}
								>
									<View className='flex-row items-center'>
										<View className='mr-3 h-[46px] w-[46px] items-center justify-center rounded-[15px] bg-[#E4F2E8]'>
											<HugeiconsIcon
												icon={Ticket01Icon}
												size={25}
												color={ICON_COLORS.primary}
											/>
										</View>

										<View className='min-w-0 flex-1'>
											<Text className='text-[15px] font-extrabold text-[#244334]'>
												Compra #{purchase.orderId}
											</Text>
											<Text className='mt-1 text-[12px] text-[#718477]'>
												{purchase.folio}
											</Text>
										</View>

										<View className='ml-2 rounded-[10px] bg-[#E4F2E8] px-[9px] py-[5px]'>
											<Text className='text-[11px] font-bold text-[#187744]'>
												{getActiveCount(purchase) > 0
													? 'Activa'
													: getTicketStatus(purchase.tickets[0])}
											</Text>
										</View>
									</View>

									<View className='my-[13px] h-px bg-[#DCE7DF]' />

									<View className='flex-row justify-between gap-3'>
										<View className='flex-1'>
											<Text className='text-[11px] text-[#718477]'>
												Fecha de compra
											</Text>

											<View className='mt-1 flex-row items-center gap-[5px]'>
												<HugeiconsIcon
													icon={Calendar03Icon}
													size={15}
													color={ICON_COLORS.muted}
												/>
												<Text className='mt-1 text-[13px] font-bold text-[#244334]'>
													{formatPurchaseDate(purchase.createdAt)}
												</Text>
											</View>

											{formatPurchaseTime(purchase.createdAt) ? (
												<View className='mt-[3px] flex-row items-center gap-[5px]'>
													<HugeiconsIcon
														icon={Clock01Icon}
														size={13}
														color={ICON_COLORS.muted}
													/>
													<Text className='mt-[3px] text-[11px] text-[#718477]'>
														{formatPurchaseTime(purchase.createdAt)}
													</Text>
												</View>
											) : null}
										</View>

										<View className='items-end'>
											<Text className='text-[11px] text-[#718477]'>Total</Text>
											<Text className='mt-1 text-[17px] font-extrabold text-[#187744]'>
												${purchase.total.toFixed(2)}
											</Text>
										</View>
									</View>

									<View className='mt-3.5 max-w-full flex-row items-center self-start rounded-xl border border-[#DCE7DF] bg-[#E4F2E8] px-3 py-2'>
										<HugeiconsIcon
											icon={Ticket01Icon}
											size={17}
											color={ICON_COLORS.primary}
										/>
										<Text className='ml-2 shrink text-[12px] font-bold text-[#187744]'>
											{getTicketSummary(purchase)}
										</Text>
									</View>

									<ActionButton
										title='VER CÓDIGOS QR'
										onPress={() => setSelectedPurchase(purchase)}
									/>
								</View>
							))}
						</View>
					)}

					<View className='h-10' />
				</ScrollView>

				<Modal
					visible={selectedPurchase !== null}
					transparent
					animationType='slide'
					onRequestClose={() => setSelectedPurchase(null)}
				>
					<View className='flex-1 justify-end bg-[rgba(24,40,30,0.48)]'>
						<ImageBackground
							source={require('@/assets/images/zoo-pattern.png')}
							className='max-h-[90%] overflow-hidden rounded-t-[26px] border-t border-[#DCE7DF] bg-blanco px-5 pb-[25px] pt-5'
							imageClassName='opacity-30'
							resizeMode='repeat'
						>
							<View className='flex-row items-center justify-between'>
								<View className='flex-1 flex-row items-center'>
									<View className='mr-[11px] h-11 w-11 items-center justify-center rounded-[14px] bg-[#E4F2E8]'>
										<HugeiconsIcon
											icon={QrCodeIcon}
											size={25}
											color={ICON_COLORS.primary}
										/>
									</View>

									<View className='flex-1'>
										<Text className='text-[19px] font-extrabold text-[#244334]'>
											Tus entradas
										</Text>
										<Text className='mt-1 text-[11px] text-[#718477]'>
											{selectedPurchase?.folio}
										</Text>
									</View>
								</View>

								<Pressable
									onPress={() => setSelectedPurchase(null)}
									className='ml-2.5 h-[38px] w-[38px] items-center justify-center rounded-[13px] border border-[#DCE7DF] bg-[#F2F7F4] active:bg-[#E4F2E8] active:opacity-[0.65]'
								>
									<Text className='text-[24px] leading-7 text-[#244334]'>
										×
									</Text>
								</Pressable>
							</View>

							{selectedPurchase && (
								<Text className='mb-2.5 mt-3 text-[12px] text-[#718477]'>
									Compra realizada el{' '}
									{formatPurchaseDate(selectedPurchase.createdAt)}
									{formatPurchaseTime(selectedPurchase.createdAt)
										? ` · ${formatPurchaseTime(selectedPurchase.createdAt)}`
										: ''}
								</Text>
							)}

							<ScrollView
								showsVerticalScrollIndicator={false}
								contentContainerClassName='pb-[5px]'
							>
								{selectedPurchase?.tickets.map((ticket, index) => (
									<View
										key={ticket.id}
										className='mb-3 rounded-[20px] border border-[#DCE7DF] bg-[#F2F7F4] p-3.5'
										style={cardShadow}
									>
										<View className='flex-row items-center justify-between gap-2.5'>
											<View>
												<Text className='text-[15px] font-extrabold text-[#244334]'>
													{ticket.ticket_type?.name ?? 'Entrada'}
												</Text>
												<Text className='mt-1 text-[11px] text-[#718477]'>
													Entrada {index + 1} de{' '}
													{selectedPurchase.tickets.length}
												</Text>
											</View>

											<View className='rounded-[9px] bg-[#E4F2E8] px-[9px] py-[5px]'>
												<Text className='text-[10px] font-bold text-[#187744]'>
													{getTicketStatus(ticket)}
												</Text>
											</View>
										</View>

										<View
											className='mt-3.5 min-h-[236px] min-w-[236px] items-center justify-center self-center rounded-[18px] border border-[#DCE7DF] bg-blanco p-3'
											style={cardShadow}
										>
											{ticket.qr_token && ticket.qr_token.trim() !== '' ? (
												<QRCode
													value={ticket.qr_token}
													size={210}
													backgroundColor={colors.blanco}
													color='#000000'
													quietZone={4}
												/>
											) : (
												<View className='h-[210px] w-[210px] items-center justify-center px-[15px]'>
													<HugeiconsIcon
														icon={QrCodeIcon}
														size={45}
														color={ICON_COLORS.coral}
													/>
													<Text className='mt-2.5 text-center text-[13px] font-bold text-[#D95C4F]'>
														Este boleto no tiene QR disponible.
													</Text>
													<Text className='mt-2 text-center text-[9px] text-[#718477]'>
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
