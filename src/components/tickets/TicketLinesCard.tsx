import { cardShadow, ICON_COLOR } from '@/components/tickets/summaryStyles'
import type { TicketSummaryItem } from '@/types/tickets'
import { formatCurrency } from '@/utils/format'
import { Ticket01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { Text, View } from 'react-native'

type TicketLinesCardProps = {
	summary: TicketSummaryItem[]
	total: number
}

export function TicketLinesCard({ summary, total }: TicketLinesCardProps) {
	return (
		<View
			className='mb-3.5 w-full rounded-[20px] border border-card-border bg-niebla p-4'
			style={cardShadow}
		>
			<View className='mb-4 flex-row items-center'>
				<View className='mr-3 h-[46px] w-[46px] items-center justify-center rounded-[14px] border border-card-border bg-hoja'>
					<HugeiconsIcon
						icon={Ticket01Icon}
						size={25}
						strokeWidth={1.8}
						color={ICON_COLOR}
					/>
				</View>

				<View className='flex-1'>
					<Text className='text-h3 text-tinta'>Tus boletos</Text>
					<Text className='text-meta mt-[3px]'>Detalle de la compra</Text>
				</View>
			</View>

			{summary.length === 0 ? (
				<Text className='text-meta mt-1'>No hay boletos seleccionados.</Text>
			) : (
				summary.map((item) => (
					<View
						key={item.ticket_type_id}
						className='flex-row items-center justify-between border-b border-b-niebla py-3'
					>
						<View className='flex-1 pr-3'>
							<Text className='font-sans-bold text-[14px] text-tinta'>
								{item.ticket.name}
							</Text>

							<Text className='text-meta mt-1'>
								{item.quantity} {item.quantity === 1 ? 'boleto' : 'boletos'} ×{' '}
								{formatCurrency(Number(item.ticket.price) || 0)}
							</Text>
						</View>

						<Text className='font-display-x text-[15px] text-bosque'>
							{formatCurrency(item.subtotal)}
						</Text>
					</View>
				))
			)}

			<View className='my-3 h-px bg-card-border' />

			<View className='flex-row items-center justify-between pt-1'>
				<Text className='font-sans-bold text-[14px] text-tinta'>Total</Text>
				<Text className='font-display-x text-[22px] text-bosque'>
					{formatCurrency(total)}
				</Text>
			</View>
		</View>
	)
}
