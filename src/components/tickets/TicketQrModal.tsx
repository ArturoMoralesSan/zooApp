import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { Icon } from '@/components/ui/Icon'
import { IconButton } from '@/components/ui/IconButton'
import { QrFrame } from '@/components/ui/QrFrame'
import colors from '@/theme/colors'
import type { Purchase } from '@/types/tickets'
import { Cancel01Icon, QrCodeIcon } from '@hugeicons/core-free-icons'
import { ScrollView, Text, View } from 'react-native'
import QRCode from 'react-native-qrcode-svg'

type TicketQrModalProps = {
	selectedPurchase: Purchase | null
	onClose: () => void
}

// A-37: sheet with every ticket of a purchase, each one labeled
// "Boleto i de n · Tipo" above its QR.
export function TicketQrModal({
	selectedPurchase,
	onClose,
}: TicketQrModalProps) {
	const total = selectedPurchase?.tickets.length ?? 0

	return (
		<BottomSheet visible={selectedPurchase !== null} onClose={onClose}>
			<View className='flex-row items-start gap-3'>
				<View className='min-w-0 flex-1'>
					<Text className='text-h1'>Tus entradas</Text>
					<Text className='text-subtitle mt-2'>
						Compra #{selectedPurchase?.orderId} · {selectedPurchase?.folio}
					</Text>
				</View>

				<IconButton
					icon={Cancel01Icon}
					onPress={onClose}
					accessibilityLabel='Cerrar'
				/>
			</View>

			<ScrollView showsVerticalScrollIndicator={false} className='mt-5'>
				{selectedPurchase?.tickets.map((ticket, index) => (
					<View key={ticket.id} className='mb-5 items-center'>
						<View className='mb-3'>
							<Chip
								selected
								label={`Boleto ${index + 1} de ${total} · ${ticket.ticket_type?.name ?? 'Entrada'}`}
							/>
						</View>

						<QrFrame className='min-h-[236px] min-w-[236px]'>
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
								</View>
							)}
						</QrFrame>
					</View>
				))}

				<Text className='text-meta text-center'>
					Presenta este código en el acceso del zoológico.
				</Text>

				<Button title='Cerrar' onPress={onClose} className='mt-5' />
			</ScrollView>
		</BottomSheet>
	)
}
