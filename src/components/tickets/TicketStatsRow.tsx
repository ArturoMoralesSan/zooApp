import { cardShadow, ICON_COLORS } from '@/components/tickets/myTicketsStyles'
import type { Purchase } from '@/types/tickets'
import { Ticket01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { Text, View } from 'react-native'

type TicketStatsRowProps = {
	activePurchases: Purchase[]
	historyPurchases: Purchase[]
}

export function TicketStatsRow({
	activePurchases,
	historyPurchases,
}: TicketStatsRowProps) {
	return (
		<View className='mb-5 flex-row gap-3'>
			<View
				className='flex-1 flex-row items-center rounded-[20px] border border-card-border bg-niebla p-[13px]'
				style={cardShadow}
			>
				<View className='mr-2.5 h-10 w-10 items-center justify-center rounded-[14px] bg-hoja'>
					<HugeiconsIcon
						icon={Ticket01Icon}
						size={21}
						color={ICON_COLORS.primary}
					/>
				</View>

				<View>
					<Text className='font-display-x text-[20px] text-tinta'>
						{activePurchases.length}
					</Text>
					<Text className='text-meta mt-[3px]'>Compras activas</Text>
				</View>
			</View>

			<View
				className='flex-1 flex-row items-center rounded-[20px] border border-card-border bg-niebla p-[13px]'
				style={cardShadow}
			>
				<View className='mr-2.5 h-10 w-10 items-center justify-center rounded-[14px] bg-hoja'>
					<HugeiconsIcon
						icon={Ticket01Icon}
						size={21}
						color={ICON_COLORS.muted}
					/>
				</View>

				<View>
					<Text className='font-display-x text-[20px] text-tinta'>
						{historyPurchases.length}
					</Text>
					<Text className='text-meta mt-[3px]'>Historial</Text>
				</View>
			</View>
		</View>
	)
}
