import { StatCard } from '@/components/ui/StatCard'
import type { Purchase } from '@/types/tickets'
import { Clock01Icon, Ticket01Icon } from '@hugeicons/core-free-icons'
import { View } from 'react-native'

type TicketStatsRowProps = {
	activePurchases: Purchase[]
	historyPurchases: Purchase[]
}

export function TicketStatsRow({
	activePurchases,
	historyPurchases,
}: TicketStatsRowProps) {
	return (
		<View className='mb-4 flex-row gap-3'>
			<StatCard
				icon={Ticket01Icon}
				value={activePurchases.length}
				label='Compras activas'
			/>

			<StatCard
				icon={Clock01Icon}
				value={historyPurchases.length}
				label='Historial'
			/>
		</View>
	)
}
