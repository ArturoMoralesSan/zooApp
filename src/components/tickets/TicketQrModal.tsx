import { Badge } from '@/components/ui/Badge'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { IconBox } from '@/components/ui/IconBox'
import { IconButton } from '@/components/ui/IconButton'
import colors from '@/theme/colors'
import type { Purchase } from '@/types/tickets'
import { formatDate, formatTime } from '@/utils/format'
import { getTicketStatus, getTicketStatusTone } from '@/utils/tickets'
import { Cancel01Icon, QrCodeIcon } from '@hugeicons/core-free-icons'
import { ScrollView, Text, View } from 'react-native'
import QRCode from 'react-native-qrcode-svg'

type TicketQrModalProps = {
	selectedPurchase: Purchase | null
	onClose: () => void
}

export function TicketQrModal({
	selectedPurchase,
	onClose,
}: TicketQrModalProps) {
	return (
		<BottomSheet visible={selectedPurchase !== null} onClose={onClose}>
			<View className='flex-row items-center gap-3'>
				<IconBox icon={QrCodeIcon} />

				<View className='min-w-0 flex-1'>
					<Text className='text-h2 text-tinta'>Tus entradas</Text>
					<Text className='text-meta mt-1'>{selectedPurchase?.folio}</Text>
				</View>

				<IconButton
					icon={Cancel01Icon}
					onPress={onClose}
					accessibilityLabel='Cerrar'
				/>
			</View>

			{selectedPurchase && (
				<Text className='text-meta mb-3 mt-3'>
					Compra realizada el {formatDate(selectedPurchase.createdAt)}
					{formatTime(selectedPurchase.createdAt)
						? ` · ${formatTime(selectedPurchase.createdAt)}`
						: ''}
				</Text>
			)}

			<ScrollView showsVerticalScrollIndicator={false}>
				{selectedPurchase?.tickets.map((ticket, index) => (
					<Card key={ticket.id} className='mb-3'>
						<View className='flex-row items-center justify-between gap-3'>
							<View className='min-w-0 flex-1'>
								<Text className='text-h3 text-tinta'>
									{ticket.ticket_type?.name ?? 'Entrada'}
								</Text>
								<Text className='text-meta mt-1'>
									Entrada {index + 1} de {selectedPurchase.tickets.length}
								</Text>
							</View>

							<Badge
								label={getTicketStatus(ticket)}
								tone={getTicketStatusTone(ticket)}
							/>
						</View>

						<View className='mt-4 min-h-[236px] min-w-[236px] items-center justify-center self-center rounded-2xl border-1.5 border-card-border bg-blanco p-3'>
							{ticket.qr_token && ticket.qr_token.trim() !== '' ? (
								<QRCode
									value={ticket.qr_token}
									size={210}
									backgroundColor={colors.blanco}
									// eslint-disable-next-line no-restricted-syntax -- black QR modules for reliable scanning
									color='#000000'
									quietZone={4}
								/>
							) : (
								<View className='h-[210px] w-[210px] items-center justify-center px-4'>
									<Icon icon={QrCodeIcon} size={24} color={colors.error} />
									<Text className='mt-2.5 text-center font-sans-bold text-[13px] text-error'>
										Este boleto no tiene QR disponible.
									</Text>
									<Text className='text-meta mt-2 text-center'>
										Token: {String(ticket.qr_token ?? 'NULL')}
									</Text>
								</View>
							)}
						</View>
					</Card>
				))}
			</ScrollView>
		</BottomSheet>
	)
}
