import { ICON_COLOR } from '@/components/donations/historyStyles'
import type { Donation } from '@/types/donations'
import { formatCurrency, formatDate, formatTime } from '@/utils/format'
import {
	getDonationStatus,
	getDonationStatusClassName,
} from '@/utils/donations'
import { CreditCardIcon, HeartAddIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { Text, View } from 'react-native'

type DonationCardProps = {
	donation: Donation
}

export function DonationCard({ donation }: DonationCardProps) {
	return (
		<View className='mb-[13px] w-full rounded-[20px] border-1.5 border-card-border bg-niebla p-4'>
			<View className='flex-row items-center'>
				<View className='mr-[11px] h-[46px] w-[46px] items-center justify-center rounded-[15px] border border-card-border bg-hoja'>
					<HugeiconsIcon
						icon={HeartAddIcon}
						size={25}
						strokeWidth={1.8}
						color={ICON_COLOR}
					/>
				</View>

				<View className='min-w-0 flex-1'>
					<Text className='font-display-x text-[19px] text-tinta'>
						{formatCurrency(donation.amount)}
					</Text>

					<Text className='text-meta mt-1 text-tinta'>
						{formatDate(donation.created_at)}
					</Text>

					{formatTime(donation.created_at) ? (
						<Text className='text-meta mt-0.5 text-tinta'>
							{formatTime(donation.created_at)}
						</Text>
					) : null}
				</View>

				<View
					className={`ml-[7px] rounded-[10px] border border-card-border px-2 py-[5px] ${getDonationStatusClassName(donation)}`}
				>
					<Text className='font-sans-bold text-[12px] text-tinta'>
						{getDonationStatus(donation)}
					</Text>
				</View>
			</View>

			<View className='my-3.5 h-px bg-card-border' />

			{/* Método de pago y referencia */}
			<View className='w-full flex-row items-start gap-4'>
				<View className='min-w-0 flex-1'>
					<Text className='text-overline text-tinta'>Método de pago</Text>

					<View className='mt-1.5 flex-row items-center'>
						<HugeiconsIcon
							icon={CreditCardIcon}
							size={17}
							strokeWidth={1.8}
							color={ICON_COLOR}
						/>

						<Text
							className='ml-1.5 shrink font-sans-bold text-[13px] text-tinta'
							numberOfLines={2}
						>
							{donation.payment_method?.name ?? 'No especificado'}
						</Text>
					</View>
				</View>

				<View className='min-w-0 flex-1'>
					<Text className='text-overline text-tinta'>Referencia</Text>

					<Text
						className='mt-1.5 shrink font-sans-bold text-[13px] text-tinta'
						numberOfLines={2}
					>
						{donation.reference || 'No disponible'}
					</Text>
				</View>
			</View>
		</View>
	)
}
