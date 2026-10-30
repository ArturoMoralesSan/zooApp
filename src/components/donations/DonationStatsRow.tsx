import { cardShadow } from '@/components/donations/historyStyles'
import type { Donation } from '@/types/donations'
import { formatCurrency } from '@/utils/format'
import { Text, View } from 'react-native'

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
		<View className='mb-[22px] w-full flex-row items-stretch gap-2.5'>
			<View
				className='min-w-0 flex-1 items-center justify-center rounded-[18px] border border-card-border bg-niebla px-[7px] py-4'
				style={cardShadow}
			>
				<Text className='text-center text-[21px] font-extrabold text-tinta'>
					{donations.length}
				</Text>
				<Text className='mt-1.5 text-center text-[11px] font-medium text-tinta'>
					Donaciones
				</Text>
			</View>

			<View
				className='min-w-0 flex-1 items-center justify-center rounded-[18px] border border-card-border bg-niebla px-[7px] py-4'
				style={cardShadow}
			>
				<Text className='text-center text-[21px] font-extrabold text-tinta'>
					{completedDonations}
				</Text>
				<Text className='mt-1.5 text-center text-[11px] font-medium text-tinta'>
					Completadas
				</Text>
			</View>

			<View
				className='min-w-0 items-center justify-center rounded-[18px] border border-card-border bg-niebla px-[7px] py-4'
				style={[cardShadow, { flex: 1.25 }]}
			>
				<Text
					className='text-center text-[16px] font-extrabold text-tinta'
					numberOfLines={1}
					adjustsFontSizeToFit
					minimumFontScale={0.7}
				>
					{formatCurrency(totalDonated)}
				</Text>
				<Text className='mt-1.5 text-center text-[11px] font-medium text-tinta'>
					Total donado
				</Text>
			</View>
		</View>
	)
}
