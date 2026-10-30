import { Card } from '@/components/ui/Card'
import { Divider } from '@/components/ui/Divider'
import { IconBox } from '@/components/ui/IconBox'
import type { TicketSummaryItem } from '@/types/tickets'
import { formatCurrency } from '@/utils/format'
import { Ticket01Icon } from '@hugeicons/core-free-icons'
import { Text, View } from 'react-native'

type TicketLinesCardProps = {
	summary: TicketSummaryItem[]
	total: number
}

export function TicketLinesCard({ summary, total }: TicketLinesCardProps) {
	return (
		<Card className='mb-3'>
			<View className='mb-2 flex-row items-center gap-3'>
				<IconBox icon={Ticket01Icon} />

				<View className='flex-1'>
					<Text className='text-h3 text-tinta'>Tus boletos</Text>
					<Text className='text-meta mt-1'>Detalle de la compra</Text>
				</View>
			</View>

			{summary.length === 0 ? (
				<Text className='text-meta mt-1'>No hay boletos seleccionados.</Text>
			) : (
				summary.map((item) => (
					<View
						key={item.ticket_type_id}
						className='flex-row items-center justify-between py-2'
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

			<Divider />

			<View className='flex-row items-center justify-between pt-1'>
				<Text className='font-sans-bold text-[14px] text-tinta'>Total</Text>
				<Text className='font-display-x text-[22px] text-bosque'>
					{formatCurrency(total)}
				</Text>
			</View>
		</Card>
	)
}
