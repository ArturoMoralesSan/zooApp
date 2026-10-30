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
					<Text className='text-[16px] font-extrabold text-tinta'>
						Tus boletos
					</Text>
					<Text className='mt-[3px] text-[12px] text-tinta-2'>
						Detalle de la compra
					</Text>
				</View>
			</View>

			{summary.length === 0 ? (
				<Text className='mt-1 text-[12px] leading-[18px] text-tinta-2'>
					No hay boletos seleccionados.
				</Text>
			) : (
				summary.map((item) => (
					<View
						key={item.ticket_type_id}
						className='flex-row items-center justify-between border-b border-b-niebla py-3'
					>
						<View className='flex-1 pr-3'>
							<Text className='text-[14px] font-bold text-tinta'>
								{item.ticket.name}
							</Text>

							<Text className='mt-1 text-[12px] leading-[18px] text-tinta-2'>
								{item.quantity} {item.quantity === 1 ? 'boleto' : 'boletos'} ×{' '}
								{formatCurrency(Number(item.ticket.price) || 0)}
							</Text>
						</View>

						<Text className='text-[15px] font-extrabold text-bosque'>
							{formatCurrency(item.subtotal)}
						</Text>
					</View>
				))
			)}

			<View className='my-3 h-px bg-card-border' />

			<View className='flex-row items-center justify-between pt-1'>
				<Text className='text-[14px] font-bold text-tinta'>Total</Text>
				<Text className='text-[22px] font-extrabold text-bosque'>
					{formatCurrency(total)}
				</Text>
			</View>
		</View>
	)
}
