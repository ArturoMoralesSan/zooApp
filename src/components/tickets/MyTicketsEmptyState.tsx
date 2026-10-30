import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { IconBox } from '@/components/ui/IconBox'
import type { MyTicketsTab } from '@/types/tickets'
import { Ticket01Icon } from '@hugeicons/core-free-icons'
import { Text } from 'react-native'

type MyTicketsEmptyStateProps = {
	tab: MyTicketsTab
	onBuyTickets: () => void
}

export function MyTicketsEmptyState({
	tab,
	onBuyTickets,
}: MyTicketsEmptyStateProps) {
	return (
		<Card className='items-center py-8'>
			<IconBox icon={Ticket01Icon} size='lg' className='mb-4' />

			<Text className='text-h2 text-center text-tinta'>
				{tab === 'active' ? 'No tienes compras activas' : 'No tienes historial'}
			</Text>

			<Text className='text-body mt-[7px] text-center text-tinta-2'>
				{tab === 'active'
					? 'Cuando compres una entrada aparecerá aquí.'
					: 'Tus compras anteriores aparecerán aquí.'}
			</Text>

			{tab === 'active' && (
				<Button
					title='Comprar boletos'
					onPress={onBuyTickets}
					className='mt-6'
				/>
			)}
		</Card>
	)
}
