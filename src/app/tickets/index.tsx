import { Ticket01Icon } from '@hugeicons/core-free-icons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Alert, ScrollView, Text, View } from 'react-native'

import FixedFooter from '@/components/FixedFooter'
import { ScreenHeader } from '@/components/ui/TabHeader'
import { useSessionRedirect } from '@/hooks/useSessionRedirect'
import { useTicketTypes } from '@/hooks/useTickets'
import { formatCurrency } from '@/utils/format'
import { useFixedFooterSpace } from '@/theme/layout'
import { Card } from '@/components/ui/Card'
import { Divider } from '@/components/ui/Divider'
import { IconBox } from '@/components/ui/IconBox'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { QueryView } from '@/components/ui/QueryView'
import { ScreenBackground } from '@/components/ui/ScreenBackground'

type SelectedTicket = {
	ticket_type_id: number
	quantity: number
}

const MAX_QUANTITY = 20

export default function TicketsScreen() {
	const footerSpace = useFixedFooterSpace()
	const router = useRouter()

	const ticketTypesQuery = useTicketTypes()
	const ticketTypes = ticketTypesQuery.data ?? []
	// Unselected types count as 0 (every read uses `?? 0`).
	const [quantities, setQuantities] = useState<Record<number, number>>({})

	useSessionRedirect()

	const changeQuantity = (id: number, value: number) => {
		setQuantities((current) => ({
			...current,
			[id]: Math.max(0, Math.min(MAX_QUANTITY, value)),
		}))
	}

	const selectedTickets: SelectedTicket[] = ticketTypes
		.filter((ticket) => (quantities[ticket.id] ?? 0) > 0)
		.map((ticket) => ({
			ticket_type_id: ticket.id,
			quantity: quantities[ticket.id] ?? 0,
		}))

	const selectedQuantity = selectedTickets.reduce(
		(sum, ticket) => sum + ticket.quantity,
		0,
	)

	const total = ticketTypes.reduce((sum, ticket) => {
		const quantity = quantities[ticket.id] ?? 0
		const parsedPrice = Number(ticket.price)
		const price = Number.isFinite(parsedPrice) ? parsedPrice : 0

		return sum + price * quantity
	}, 0)

	const continuePurchase = () => {
		if (selectedTickets.length === 0) {
			Alert.alert(
				'Selecciona boletos',
				'Selecciona al menos un boleto para continuar.',
			)
			return
		}

		router.push({
			pathname: '/tickets/summary',
			params: {
				items: JSON.stringify(selectedTickets),
			},
		})
	}

	return (
		<ScreenBackground>
			<ScrollView
				className='min-h-0 flex-1'
				contentContainerClassName='grow px-5 pt-2'
				contentContainerStyle={{ paddingBottom: footerSpace }}
				showsVerticalScrollIndicator={false}
				bounces
				nestedScrollEnabled
				keyboardShouldPersistTaps='handled'
			>
				{/* ENCABEZADO */}
				<ScreenHeader
					onBack={() => router.back()}
					title='Comprar boletos'
					subtitle='Selecciona los boletos que necesitas.'
				/>

				<QueryView
					query={ticketTypesQuery}
					loadingMessage='Cargando boletos…'
					errorTitle='No pudimos cargar los boletos'
					isEmpty={(types) => types.length === 0}
					empty={{
						icon: Ticket01Icon,
						title: 'No hay boletos disponibles',
						message: 'Por el momento no hay tipos de boleto para mostrar.',
					}}
				>
					{(types) =>
						types.map((ticket) => {
							const quantity = quantities[ticket.id] ?? 0
							const parsedPrice = Number(ticket.price)
							const price = Number.isFinite(parsedPrice) ? parsedPrice : 0
							const amount = price * quantity

							return (
								<Card key={ticket.id} className='mb-3'>
									{/* INFORMACIÓN DEL BOLETO */}
									<View className='w-full flex-row items-center gap-3'>
										<IconBox icon={Ticket01Icon} />

										<View className='min-w-0 flex-1 justify-center'>
											<Text className='text-h3 text-tinta'>{ticket.name}</Text>

											{!!ticket.description && (
												<Text className='text-meta mt-[3px]'>
													{ticket.description}
												</Text>
											)}
										</View>
									</View>

									<Divider />

									{/* PRECIO Y CANTIDAD */}
									<View className='w-full flex-row items-center justify-between'>
										<View className='min-w-0 flex-1 justify-center pr-2'>
											<Text className='text-overline text-tinta-2'>
												Precio por boleto
											</Text>

											<Text className='mt-0.5 font-display-x text-[20px] text-bosque'>
												{formatCurrency(price)}
											</Text>

											<Text className='text-meta mt-[3px]'>
												Monto: {formatCurrency(amount)}
											</Text>
										</View>

										<QuantityStepper
											value={quantity}
											onChange={(value) => changeQuantity(ticket.id, value)}
											max={MAX_QUANTITY}
											itemLabel={`boleto de ${ticket.name}`}
										/>
									</View>
								</Card>
							)
						})
					}
				</QueryView>
			</ScrollView>

			{/* FOOTER FIJO */}
			<FixedFooter
				label='Total a pagar'
				description={`${selectedQuantity} ${
					selectedQuantity === 1
						? 'boleto seleccionado'
						: 'boletos seleccionados'
				}`}
				amount={formatCurrency(total)}
				buttonTitle='Continuar'
				onButtonPress={continuePurchase}
				disabled={selectedTickets.length === 0}
			/>
		</ScreenBackground>
	)
}
