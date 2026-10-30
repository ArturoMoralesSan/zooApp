import ActionButton from '@/components/ActionButton'
import { cardShadow, ICON_COLORS } from '@/components/tickets/myTicketsStyles'
import type { Purchase } from '@/types/tickets'
import { formatDate, formatTime } from '@/utils/format'
import {
	getActiveCount,
	getTicketStatus,
	getTicketSummary,
} from '@/utils/tickets'
import {
	Calendar03Icon,
	Clock01Icon,
	Ticket01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { Text, View } from 'react-native'

type PurchaseCardProps = {
	purchase: Purchase
	onShowQr: () => void
}

export function PurchaseCard({ purchase, onShowQr }: PurchaseCardProps) {
	return (
		<View
			className='mb-3.5 w-full rounded-[22px] border border-card-border bg-niebla p-4'
			style={cardShadow}
		>
			<View className='flex-row items-center'>
				<View className='mr-3 h-[46px] w-[46px] items-center justify-center rounded-[15px] bg-hoja'>
					<HugeiconsIcon
						icon={Ticket01Icon}
						size={25}
						color={ICON_COLORS.primary}
					/>
				</View>

				<View className='min-w-0 flex-1'>
					<Text className='text-h3 text-tinta'>Compra #{purchase.orderId}</Text>
					<Text className='text-meta mt-1'>{purchase.folio}</Text>
				</View>

				<View className='ml-2 rounded-[10px] bg-hoja px-[9px] py-[5px]'>
					<Text className='font-sans-bold text-[12px] text-esmeralda'>
						{getActiveCount(purchase) > 0
							? 'Activa'
							: getTicketStatus(purchase.tickets[0])}
					</Text>
				</View>
			</View>

			<View className='my-[13px] h-px bg-card-border' />

			<View className='flex-row justify-between gap-3'>
				<View className='flex-1'>
					<Text className='text-overline text-tinta-2'>Fecha de compra</Text>

					<View className='mt-1 flex-row items-center gap-[5px]'>
						<HugeiconsIcon
							icon={Calendar03Icon}
							size={15}
							color={ICON_COLORS.muted}
						/>
						<Text className='mt-1 font-sans-bold text-[13px] text-tinta'>
							{formatDate(purchase.createdAt)}
						</Text>
					</View>

					{formatTime(purchase.createdAt) ? (
						<View className='mt-[3px] flex-row items-center gap-[5px]'>
							<HugeiconsIcon
								icon={Clock01Icon}
								size={13}
								color={ICON_COLORS.muted}
							/>
							<Text className='text-meta mt-[3px]'>
								{formatTime(purchase.createdAt)}
							</Text>
						</View>
					) : null}
				</View>

				<View className='items-end'>
					<Text className='text-overline text-tinta-2'>Total</Text>
					<Text className='mt-1 font-display-x text-[17px] text-esmeralda'>
						${purchase.total.toFixed(2)}
					</Text>
				</View>
			</View>

			<View className='mt-3.5 max-w-full flex-row items-center self-start rounded-xl border border-card-border bg-hoja px-3 py-2'>
				<HugeiconsIcon
					icon={Ticket01Icon}
					size={17}
					color={ICON_COLORS.primary}
				/>
				<Text className='ml-2 shrink font-sans-bold text-[12px] text-esmeralda'>
					{getTicketSummary(purchase)}
				</Text>
			</View>

			<ActionButton title='Ver códigos QR' onPress={onShowQr} />
		</View>
	)
}
