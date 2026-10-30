import ActionButton from '@/components/ActionButton'
import { ICON_COLORS } from '@/components/tickets/myTicketsStyles'
import type { MyTicketsTab } from '@/types/tickets'
import { Ticket01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { Text, View } from 'react-native'

type MyTicketsEmptyStateProps = {
	tab: MyTicketsTab
	onBuyTickets: () => void
}

export function MyTicketsEmptyState({
	tab,
	onBuyTickets,
}: MyTicketsEmptyStateProps) {
	return (
		<View className='items-center rounded-3xl border-1.5 border-card-border bg-niebla px-6 py-8'>
			<View className='mb-4 h-[66px] w-[66px] items-center justify-center rounded-[21px] bg-hoja'>
				<HugeiconsIcon
					icon={Ticket01Icon}
					size={32}
					color={ICON_COLORS.primary}
				/>
			</View>

			<Text className='text-h2 text-center text-tinta'>
				{tab === 'active' ? 'No tienes compras activas' : 'No tienes historial'}
			</Text>

			<Text className='text-body mt-[7px] text-center text-tinta-2'>
				{tab === 'active'
					? 'Cuando compres una entrada aparecerá aquí.'
					: 'Tus compras anteriores aparecerán aquí.'}
			</Text>

			{tab === 'active' && (
				<View className='mt-5 w-full'>
					<ActionButton title='Comprar boletos' onPress={onBuyTickets} />
				</View>
			)}
		</View>
	)
}
