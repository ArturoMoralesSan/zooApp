import { StatCard } from '@/components/ui/StatCard'
import type { Donation } from '@/types/donations'
import { formatCurrency } from '@/utils/format'
import { View } from 'react-native'

type DonationStatsRowProps = {
	donations: Donation[]
	completedDonations: number
	totalDonated: number
}

export function DonationStatsRow({
	donations,
	completedDonations,
	totalDonated,
}: DonationStatsRowProps) {
	return (
		<View className='mb-6 w-full flex-row items-stretch gap-3'>
			<StatCard layout='stack' value={donations.length} label='Donaciones' />

			<StatCard layout='stack' value={completedDonations} label='Completadas' />

			<StatCard
				layout='stack'
				value={formatCurrency(totalDonated)}
				label='Total donado'
				fitValue
				className='flex-[1.25]'
			/>
		</View>
	)
}
