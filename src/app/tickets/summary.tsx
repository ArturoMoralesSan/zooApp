import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native'

import BackButton from '@/components/BackButton'
import FixedFooter from '@/components/FixedFooter'
import UserHeader from '@/components/UserHeader'

import { useDataRefresh } from '@/hooks/useDataRefresh'
import {
	redirectIfSignedOut,
	useSessionRedirect,
} from '@/hooks/useSessionRedirect'
import { useTicketTypes } from '@/hooks/useTickets'
import type { TicketSummaryItem, TicketType } from '@/types/tickets'
import { formatCurrency } from '@/utils/format'
import { createOrder } from '@/services/tickets'
import { useFixedFooterSpace } from '@/theme/layout'
import { ScreenBackground } from '@/components/ui/ScreenBackground'
import { FooterLoadingBar } from '@/components/ui/FooterLoadingBar'
import { PaymentMethodCard } from '@/components/tickets/PaymentMethodCard'
import { SecurePurchaseNotice } from '@/components/tickets/SecurePurchaseNotice'
import { TicketLinesCard } from '@/components/tickets/TicketLinesCard'
import { ICON_COLOR } from '@/components/tickets/summaryStyles'

type SelectedTicket = {
	ticket_type_id: number
	quantity: number
}

const NO_TICKET_TYPES: TicketType[] = []

export default function TicketSummaryScreen() {
	const footerSpace = useFixedFooterSpace()
	const router = useRouter()

	const params = useLocalSearchParams<{
		items?: string
	}>()

	const {
		data: ticketTypes = NO_TICKET_TYPES,
		error,
		isLoading: loading,
	} = useTicketTypes()
	const { refreshMyTickets } = useDataRefresh()
	const [purchasing, setPurchasing] = useState(false)

	useSessionRedirect()

	const selectedTickets = useMemo<SelectedTicket[]>(() => {
		try {
			const parsed = params.items ? JSON.parse(params.items) : []
			return Array.isArray(parsed) ? parsed : []
		} catch {
			return []
		}
	}, [params.items])

	useEffect(() => {
		if (!error) return

		console.error('Error cargando tipos de boleto:', error)

		Alert.alert(
			'Error',
			error.message || 'No fue posible cargar los tipos de boleto.',
		)
	}, [error])

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

		if (summary.length === 0) {
			Alert.alert(
				'Sin boletos',
				'No hay boletos seleccionados para realizar la compra.',
			)
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
			<ScreenBackground patternClassName='opacity-[0.12]'>
				<View className='flex-1 items-center justify-center'>
					<ActivityIndicator size='large' color={ICON_COLOR} />
					<Text className='text-body mt-3 text-tinta-2'>
						Cargando resumen...
					</Text>
				</View>
			</ScreenBackground>
		)
	}

	return (
		<ScreenBackground patternClassName='opacity-[0.12]'>
			<ScrollView
				className='min-h-0 flex-1'
				contentContainerClassName='grow px-5 pt-3'
				contentContainerStyle={{ paddingBottom: footerSpace }}
				showsVerticalScrollIndicator={false}
				bounces
				nestedScrollEnabled
				keyboardShouldPersistTaps='handled'
			>
				{/* ENCABEZADO */}
				<View className='pb-3'>
					<View className='mb-3'>
						<BackButton onPress={() => router.back()} position='relative' />
					</View>

					<UserHeader
						title='Resumen de compra'
						subtitle='Revisa tus boletos antes de continuar.'
						showRewards={false}
					/>
				</View>

				{/* DETALLE DE BOLETOS */}
				<TicketLinesCard summary={summary} total={total} />

				{/* MÉTODO DE PAGO */}
				<PaymentMethodCard />

				{/* AVISO DE COMPRA SEGURA */}
				<SecurePurchaseNotice />

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
		</ScreenBackground>
	)
}
