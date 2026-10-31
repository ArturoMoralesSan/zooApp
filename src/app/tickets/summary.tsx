import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import { ScrollView, View } from 'react-native'

import FixedFooter from '@/components/FixedFooter'
import { ScreenHeader } from '@/components/ui/TabHeader'

import { useDataRefresh } from '@/hooks/useDataRefresh'
import { checkOffline } from '@/hooks/useNetworkStatus'
import {
	redirectIfSignedOut,
	useSessionRedirect,
} from '@/hooks/useSessionRedirect'
import { useTicketTypes } from '@/hooks/useTickets'
import type { TicketSummaryItem, TicketType } from '@/types/tickets'
import { formatCurrency } from '@/utils/format'
import { createOrder } from '@/services/tickets'
import { ApiValidationError, isNetworkError } from '@/services/api'
import { notifyOffline } from '@/services/offline-notice'
import { useFixedFooterSpace } from '@/theme/layout'
import { ScreenBackground } from '@/components/ui/ScreenBackground'
import { FooterLoadingBar } from '@/components/ui/FooterLoadingBar'
import { QueryView } from '@/components/ui/QueryView'
import Toast from '@/components/ui/Toast'
import { PaymentMethodCard } from '@/components/tickets/PaymentMethodCard'
import { SecurePurchaseNotice } from '@/components/tickets/SecurePurchaseNotice'
import { TicketLinesCard } from '@/components/tickets/TicketLinesCard'
import { useScrolled } from '@/hooks/useScrolled'
import { TopBar } from '@/components/ui/TopBar'

type SelectedTicket = {
	ticket_type_id: number
	quantity: number
}

const NO_TICKET_TYPES: TicketType[] = []

const OFFLINE_PURCHASE =
	'No enviamos tu compra. Conéctate a internet e inténtalo de nuevo.'

export default function TicketSummaryScreen() {
	const { scrolled, pastTitle, onScroll, onTitleLayout } = useScrolled()
	const footerSpace = useFixedFooterSpace()
	const router = useRouter()

	const params = useLocalSearchParams<{
		items?: string
	}>()

	const ticketTypesQuery = useTicketTypes()
	const ticketTypes = ticketTypesQuery.data ?? NO_TICKET_TYPES
	const { refreshMyTickets } = useDataRefresh()
	const [purchasing, setPurchasing] = useState(false)
	const [paymentError, setPaymentError] = useState<string | null>(null)
	const hidePaymentError = useCallback(() => setPaymentError(null), [])

	useSessionRedirect()

	const selectedTickets = useMemo<SelectedTicket[]>(() => {
		try {
			const parsed = params.items ? JSON.parse(params.items) : []
			return Array.isArray(parsed) ? parsed : []
		} catch {
			return []
		}
	}, [params.items])

	const summary = useMemo<TicketSummaryItem[]>(() => {
		return selectedTickets.flatMap((item) => {
			const ticket = ticketTypes.find((type) => type.id === item.ticket_type_id)

			if (!ticket) return []

			const price = Number(ticket.price)
			const quantity = Math.max(0, Number(item.quantity) || 0)

			return [
				{
					...item,
					quantity,
					ticket,
					subtotal: (Number.isFinite(price) ? price : 0) * quantity,
				},
			]
		})
	}, [selectedTickets, ticketTypes])

	const total = summary.reduce((sum, item) => sum + item.subtotal, 0)

	const totalTickets = summary.reduce((sum, item) => sum + item.quantity, 0)

	const confirmPurchase = async () => {
		if (purchasing) return

		// The footer button is disabled while there are no tickets.
		if (summary.length === 0) return

		if (await checkOffline()) {
			notifyOffline(OFFLINE_PURCHASE)
			return
		}

		try {
			setPurchasing(true)

			if (await redirectIfSignedOut()) return

			const order = await createOrder({
				items: summary.map((item) => ({
					ticket_type_id: item.ticket_type_id,
					quantity: item.quantity,
				})),
			})

			void refreshMyTickets()

			router.replace({
				pathname: '/tickets/success',
				params: {
					order: JSON.stringify(order),
				},
			})
		} catch (error) {
			if (isNetworkError(error)) {
				notifyOffline(OFFLINE_PURCHASE)
				return
			}

			setPaymentError(
				error instanceof ApiValidationError
					? error.message
					: 'Verifica los datos de tu tarjeta e intenta de nuevo.',
			)
		} finally {
			setPurchasing(false)
		}
	}

	return (
		<ScreenBackground>
			{/* BARRA SUPERIOR FIJA */}
			<TopBar
				onBack={() => router.back()}
				title='Resumen de compra'
				showTitle={pastTitle}
				scrolled={scrolled}
			/>

			<ScrollView
				onScroll={onScroll}
				scrollEventThrottle={16}
				className='min-h-0 flex-1'
				contentContainerClassName='grow px-5 pt-2'
				contentContainerStyle={{ paddingBottom: footerSpace }}
				showsVerticalScrollIndicator={false}
				bounces
				nestedScrollEnabled
				keyboardShouldPersistTaps='handled'
			>
				<ScreenHeader
					title='Resumen de compra'
					subtitle='Revisa tus boletos antes de continuar.'
					onLayout={onTitleLayout}
				/>

				<QueryView
					query={ticketTypesQuery}
					loadingMessage='Cargando resumen…'
					errorTitle='No pudimos cargar el resumen'
				>
					{() => (
						<>
							{/* DETALLE DE BOLETOS */}
							<TicketLinesCard summary={summary} total={total} />

							{/* MÉTODO DE PAGO */}
							<PaymentMethodCard />

							{/* AVISO DE COMPRA SEGURA */}
							<SecurePurchaseNotice />
						</>
					)}
				</QueryView>

				<View className='h-6' />
			</ScrollView>

			{/* FOOTER FIJO */}
			{purchasing ? (
				<FooterLoadingBar message='Procesando compra...' />
			) : (
				<FixedFooter
					label='Total a pagar'
					description={`${totalTickets} ${
						totalTickets === 1 ? 'boleto seleccionado' : 'boletos seleccionados'
					}`}
					amount={formatCurrency(total)}
					buttonTitle='Aceptar y comprar'
					onButtonPress={confirmPurchase}
					disabled={summary.length === 0}
				/>
			)}

			<Toast
				visible={paymentError !== null}
				type='error'
				title='No se pudo completar el pago'
				message={paymentError ?? ''}
				onHide={hidePaymentError}
			/>
		</ScreenBackground>
	)
}
