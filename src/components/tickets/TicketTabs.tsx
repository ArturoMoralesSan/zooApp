import { SegmentedTabs } from '@/components/ui/SegmentedTabs'
import type { MyTicketsTab, Purchase } from '@/types/tickets'

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
		<SegmentedTabs
			value={tab}
			onChange={onChangeTab}
			tabs={[
				{ key: 'active', label: 'Activas', count: activePurchases.length },
				{ key: 'history', label: 'Historial', count: historyPurchases.length },
			]}
		/>
	)
}
