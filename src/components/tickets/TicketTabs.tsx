import type { MyTicketsTab, Purchase } from '@/types/tickets'
import { Pressable, Text, View } from 'react-native'

type TicketTabsProps = {
	tab: MyTicketsTab
	activePurchases: Purchase[]
	historyPurchases: Purchase[]
	onChangeTab: (tab: MyTicketsTab) => void
}

export function TicketTabs({
	tab,
	activePurchases,
	historyPurchases,
	onChangeTab,
}: TicketTabsProps) {
	return (
		<View className='mb-[18px] flex-row rounded-2xl border border-card-border bg-niebla p-1'>
			<Pressable
				onPress={() => onChangeTab('active')}
				className={`min-h-11 flex-1 flex-row items-center justify-center gap-[7px] rounded-xl ${tab === 'active' ? 'bg-esmeralda' : ''}`}
			>
				<Text
					className={`text-[13px] ${tab === 'active' ? 'font-extrabold text-blanco' : 'font-semibold text-tinta-2'}`}
				>
					Activas
				</Text>

				<View
					className={`h-[22px] min-w-[22px] items-center justify-center rounded-[11px] px-1.5 ${tab === 'active' ? 'bg-blanco' : 'bg-hoja'}`}
				>
					<Text
						className={`text-[11px] font-bold ${tab === 'active' ? 'text-esmeralda' : 'text-tinta'}`}
					>
						{activePurchases.length}
					</Text>
				</View>
			</Pressable>

			<Pressable
				onPress={() => onChangeTab('history')}
				className={`min-h-11 flex-1 flex-row items-center justify-center gap-[7px] rounded-xl ${tab === 'history' ? 'bg-esmeralda' : ''}`}
			>
				<Text
					className={`text-[13px] ${tab === 'history' ? 'font-extrabold text-blanco' : 'font-semibold text-tinta-2'}`}
				>
					Historial
				</Text>

				<View
					className={`h-[22px] min-w-[22px] items-center justify-center rounded-[11px] px-1.5 ${tab === 'history' ? 'bg-blanco' : 'bg-hoja'}`}
				>
					<Text
						className={`text-[11px] font-bold ${tab === 'history' ? 'text-esmeralda' : 'text-tinta'}`}
					>
						{historyPurchases.length}
					</Text>
				</View>
			</Pressable>
		</View>
	)
}
