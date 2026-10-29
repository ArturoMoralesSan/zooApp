import { useSessionRedirect } from '@/hooks/useSessionRedirect'
import { useMyTickets } from '@/hooks/useTickets'

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

import ActionButton from '@/components/ActionButton'
import BackButton from '@/components/BackButton'
import UserHeader from '@/components/UserHeader'

import colors from '@/theme/colors'
import type { MyTicketsTab, Purchase } from '@/types/tickets'
import { formatDate, formatTime } from '@/utils/format'
import { ScreenBackground } from '@/components/ui/ScreenBackground'
import { TicketStatsRow } from '@/components/tickets/TicketStatsRow'
import { TicketTabs } from '@/components/tickets/TicketTabs'
import { PurchaseCard } from '@/components/tickets/PurchaseCard'
import { cardShadow, ICON_COLORS } from '@/components/tickets/myTicketsStyles'
import { getTicketStatus } from '@/utils/tickets'

export default function MyTicketsScreen() {
	const router = useRouter()

	const { data: tickets = [], error, isLoading: loading } = useMyTickets()
	const [tab, setTab] = useState<MyTicketsTab>('active')
	const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(
		null,
	)

	useSessionRedirect()

	useEffect(() => {
		if (!error) return

		console.error('Error cargando entradas:', error)

		Alert.alert(
			'Mis entradas',
			error.message || 'No fue posible cargar tus entradas.',
		)
	}, [error])

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

	return (
		<ScreenBackground patternClassName='opacity-[0.12]'>
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

				<TicketStatsRow
					activePurchases={activePurchases}
					historyPurchases={historyPurchases}
				/>

				<TicketTabs
					tab={tab}
					activePurchases={activePurchases}
					historyPurchases={historyPurchases}
					onChangeTab={setTab}
				/>

				{loading ? (
					<View className='items-center justify-center py-[60px]'>
						<ActivityIndicator size='large' color={ICON_COLORS.primary} />
						<Text className='mt-3 text-[14px] text-tinta-2'>
							Cargando tus entradas...
						</Text>
					</View>
				) : visiblePurchases.length === 0 ? (
					<View
						className='items-center rounded-3xl border border-card-border bg-niebla px-6 py-8'
						style={cardShadow}
					>
						<View className='mb-4 h-[66px] w-[66px] items-center justify-center rounded-[21px] bg-hoja'>
							<HugeiconsIcon
								icon={Ticket01Icon}
								size={32}
								color={ICON_COLORS.primary}
							/>
						</View>

						<Text className='text-center text-[18px] font-extrabold text-tinta'>
							{tab === 'active'
								? 'No tienes compras activas'
								: 'No tienes historial'}
						</Text>

						<Text className='mt-[7px] text-center text-[13px] leading-5 text-tinta-2'>
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
							<PurchaseCard
								key={purchase.orderId}
								purchase={purchase}
								onShowQr={() => setSelectedPurchase(purchase)}
							/>
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
				<View className='flex-1 justify-end bg-tinta/[0.48]'>
					<ImageBackground
						source={require('@/assets/images/zoo-pattern.png')}
						className='max-h-[90%] overflow-hidden rounded-t-[26px] border-t border-card-border bg-blanco px-5 pb-[25px] pt-5'
						imageClassName='opacity-30'
						resizeMode='repeat'
					>
						<View className='flex-row items-center justify-between'>
							<View className='flex-1 flex-row items-center'>
								<View className='mr-[11px] h-11 w-11 items-center justify-center rounded-[14px] bg-hoja'>
									<HugeiconsIcon
										icon={QrCodeIcon}
										size={25}
										color={ICON_COLORS.primary}
									/>
								</View>

								<View className='flex-1'>
									<Text className='text-[19px] font-extrabold text-tinta'>
										Tus entradas
									</Text>
									<Text className='mt-1 text-[11px] text-tinta-2'>
										{selectedPurchase?.folio}
									</Text>
								</View>
							</View>

							<Pressable
								onPress={() => setSelectedPurchase(null)}
								className='ml-2.5 h-[38px] w-[38px] items-center justify-center rounded-[13px] border border-card-border bg-niebla active:bg-hoja active:opacity-[0.65]'
							>
								<Text className='text-[24px] leading-7 text-tinta'>×</Text>
							</Pressable>
						</View>

						{selectedPurchase && (
							<Text className='mb-2.5 mt-3 text-[12px] text-tinta-2'>
								Compra realizada el {formatDate(selectedPurchase.createdAt)}
								{formatTime(selectedPurchase.createdAt)
									? ` · ${formatTime(selectedPurchase.createdAt)}`
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
									className='mb-3 rounded-[20px] border border-card-border bg-niebla p-3.5'
									style={cardShadow}
								>
									<View className='flex-row items-center justify-between gap-2.5'>
										<View>
											<Text className='text-[15px] font-extrabold text-tinta'>
												{ticket.ticket_type?.name ?? 'Entrada'}
											</Text>
											<Text className='mt-1 text-[11px] text-tinta-2'>
												Entrada {index + 1} de {selectedPurchase.tickets.length}
											</Text>
										</View>

										<View className='rounded-[9px] bg-hoja px-[9px] py-[5px]'>
											<Text className='text-[10px] font-bold text-esmeralda'>
												{getTicketStatus(ticket)}
											</Text>
										</View>
									</View>

									<View
										className='mt-3.5 min-h-[236px] min-w-[236px] items-center justify-center self-center rounded-[18px] border border-card-border bg-blanco p-3'
										style={cardShadow}
									>
										{ticket.qr_token && ticket.qr_token.trim() !== '' ? (
											<QRCode
												value={ticket.qr_token}
												size={210}
												backgroundColor={colors.blanco}
												// eslint-disable-next-line no-restricted-syntax -- black QR modules for reliable scanning
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
												<Text className='mt-2.5 text-center text-[13px] font-bold text-error'>
													Este boleto no tiene QR disponible.
												</Text>
												<Text className='mt-2 text-center text-[9px] text-tinta-2'>
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
		</ScreenBackground>
	)
}
