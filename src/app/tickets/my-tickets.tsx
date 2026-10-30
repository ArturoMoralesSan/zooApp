import { useSessionRedirect } from '@/hooks/useSessionRedirect'
import { useScrollBottomSpace } from '@/theme/layout'
import { useMyTickets } from '@/hooks/useTickets'

import { useRouter } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native'

import BackButton from '@/components/BackButton'
import UserHeader from '@/components/UserHeader'

import type { MyTicketsTab, Purchase } from '@/types/tickets'
import { ScreenBackground } from '@/components/ui/ScreenBackground'
import { TicketStatsRow } from '@/components/tickets/TicketStatsRow'
import { TicketTabs } from '@/components/tickets/TicketTabs'
import { PurchaseCard } from '@/components/tickets/PurchaseCard'
import { MyTicketsEmptyState } from '@/components/tickets/MyTicketsEmptyState'
import { TicketQrModal } from '@/components/tickets/TicketQrModal'
import { ICON_COLORS } from '@/components/tickets/myTicketsStyles'

export default function MyTicketsScreen() {
	const bottomSpace = useScrollBottomSpace(40)
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
				contentContainerStyle={{ paddingBottom: bottomSpace }}
				contentContainerClassName='px-5 pt-2.5'
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
						<Text className='text-body mt-3 text-tinta-2'>
							Cargando tus entradas...
						</Text>
					</View>
				) : visiblePurchases.length === 0 ? (
					<MyTicketsEmptyState
						tab={tab}
						onBuyTickets={() => router.push('/tickets')}
					/>
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

			<TicketQrModal
				selectedPurchase={selectedPurchase}
				onClose={() => setSelectedPurchase(null)}
			/>
		</ScreenBackground>
	)
}
