import { useSessionRedirect } from '@/hooks/useSessionRedirect'
import { useScrollBottomSpace } from '@/theme/layout'
import { useMyTickets } from '@/hooks/useTickets'

import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { ScrollView, View } from 'react-native'

import { ScreenHeader } from '@/components/ui/TabHeader'

import type { MyTicketsTab, Purchase } from '@/types/tickets'
import { ScreenBackground } from '@/components/ui/ScreenBackground'
import { TicketStatsRow } from '@/components/tickets/TicketStatsRow'
import { TicketTabs } from '@/components/tickets/TicketTabs'
import { PurchaseCard } from '@/components/tickets/PurchaseCard'
import { QueryView } from '@/components/ui/QueryView'
import { Ticket01Icon } from '@hugeicons/core-free-icons'
import { TicketQrModal } from '@/components/tickets/TicketQrModal'

export default function MyTicketsScreen() {
	const bottomSpace = useScrollBottomSpace(40)
	const router = useRouter()

	const myTickets = useMyTickets()
	const tickets = useMemo(() => myTickets.data ?? [], [myTickets.data])
	const [tab, setTab] = useState<MyTicketsTab>('active')
	const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(
		null,
	)

	useSessionRedirect()

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
		<ScreenBackground>
			<ScrollView
				className='flex-1'
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: bottomSpace }}
				contentContainerClassName='px-5 pt-2'
			>
				<ScreenHeader
					onBack={() => router.back()}
					title='Mis entradas'
					subtitle='Consulta tus compras y entradas.'
				/>

				{/* Counts and tabs only once there's data, never zeros from a failed load */}
				{myTickets.data && (
					<>
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
					</>
				)}

				<QueryView
					query={myTickets}
					loadingMessage='Cargando tus entradas…'
					errorTitle='No pudimos cargar tus entradas'
					isEmpty={() => visiblePurchases.length === 0}
					empty={
						tab === 'active'
							? {
									icon: Ticket01Icon,
									title: 'No tienes compras activas',
									message: 'Cuando compres una entrada aparecerá aquí.',
									action: {
										title: 'Comprar boletos',
										onPress: () => router.push('/tickets'),
									},
								}
							: {
									icon: Ticket01Icon,
									title: 'No tienes historial',
									message: 'Tus compras anteriores aparecerán aquí.',
								}
					}
				>
					{() => (
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
				</QueryView>

				<View className='h-10' />
			</ScrollView>

			<TicketQrModal
				selectedPurchase={selectedPurchase}
				onClose={() => setSelectedPurchase(null)}
			/>
		</ScreenBackground>
	)
}
