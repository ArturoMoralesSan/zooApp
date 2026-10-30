import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Divider } from '@/components/ui/Divider'
import { IconBox } from '@/components/ui/IconBox'
import type { Donation } from '@/types/donations'
import { formatCurrency, formatDate, formatTime } from '@/utils/format'
import { getDonationStatus, getDonationStatusTone } from '@/utils/donations'
import { HeartIcon } from '@hugeicons/core-free-icons'
import { Text, View } from 'react-native'

type DonationCardProps = {
	donation: Donation
}

export function DonationCard({ donation }: DonationCardProps) {
	const time = formatTime(donation.created_at)

	return (
		<Card className='mb-3'>
			<View className='flex-row items-center gap-3'>
				<IconBox icon={HeartIcon} />

				<View className='min-w-0 flex-1'>
					<Text className='font-display-x text-[19px] text-tinta'>
						{formatCurrency(donation.amount)}
					</Text>

					<Text className='text-meta mt-1'>
						{formatDate(donation.created_at)}
						{time ? ` · ${time}` : ''}
					</Text>
				</View>

				<Badge
					label={getDonationStatus(donation)}
					tone={getDonationStatusTone(donation)}
				/>
			</View>

			<Divider />

			{/* Método de pago y referencia */}
			<View className='w-full flex-row items-start gap-4'>
				<View className='min-w-0 flex-1'>
					<Text className='text-overline text-tinta-2'>Método de pago</Text>

					<Text
						className='mt-1 font-sans-bold text-[13px] text-tinta'
						numberOfLines={2}
					>
						{donation.payment_method?.name ?? 'No especificado'}
					</Text>
				</View>

				<View className='min-w-0 flex-1 items-end'>
					<Text className='text-overline text-tinta-2'>Referencia</Text>

					<Text
						className='mt-1 text-right font-sans-bold text-[13px] text-tinta'
						numberOfLines={2}
					>
						{donation.reference || 'No disponible'}
					</Text>
				</View>
			</View>
		</Card>
	)
}
