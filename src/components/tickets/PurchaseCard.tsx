import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Chip } from '@/components/ui/Chip'
import { Divider } from '@/components/ui/Divider'
import { IconBox } from '@/components/ui/IconBox'
import type { Purchase } from '@/types/tickets'
import { formatCurrency, formatDate, formatTime } from '@/utils/format'
import {
	getActiveCount,
	getTicketStatus,
	getTicketStatusTone,
	getTicketSummary,
} from '@/utils/tickets'
import { QrCodeIcon, Ticket01Icon } from '@hugeicons/core-free-icons'
import { Text, View } from 'react-native'

type PurchaseCardProps = {
	purchase: Purchase
	onShowQr: () => void
}

export function PurchaseCard({ purchase, onShowQr }: PurchaseCardProps) {
	const active = getActiveCount(purchase) > 0

	return (
		<Card className='mb-3'>
			<View className='flex-row items-center gap-3'>
				<IconBox icon={Ticket01Icon} />

				<View className='min-w-0 flex-1'>
					<Text className='text-h3 text-tinta'>Compra #{purchase.orderId}</Text>
					<Text className='text-meta mt-1'>{purchase.folio}</Text>
				</View>

				<Badge
					label={active ? 'Activa' : getTicketStatus(purchase.tickets[0])}
					tone={active ? 'success' : getTicketStatusTone(purchase.tickets[0])}
				/>
			</View>

			<Divider />

			<View className='flex-row justify-between gap-3'>
				<View className='flex-1'>
					<Text className='text-overline text-tinta-2'>Fecha de compra</Text>

					<Text className='mt-1 font-sans-bold text-[13px] text-tinta'>
						{formatDate(purchase.createdAt)}
					</Text>

					{formatTime(purchase.createdAt) ? (
						<Text className='text-meta mt-0.5'>
							{formatTime(purchase.createdAt)}
						</Text>
					) : null}
				</View>

				<View className='items-end'>
					<Text className='text-overline text-tinta-2'>Total</Text>
					<Text className='mt-1 font-display-x text-[17px] text-esmeralda'>
						{formatCurrency(purchase.total)}
					</Text>
				</View>
			</View>

			<Chip
				look='hoja'
				icon={Ticket01Icon}
				label={getTicketSummary(purchase)}
				className='mt-3'
			/>

			<Button
				title='Ver códigos QR'
				icon={QrCodeIcon}
				iconPosition='leading'
				onPress={onShowQr}
				className='mt-4'
			/>
		</Card>
	)
}
