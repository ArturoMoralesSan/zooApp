import { cardShadow, ICON_COLORS } from '@/components/tickets/myTicketsStyles'
import colors from '@/theme/colors'
import type { Purchase } from '@/types/tickets'
import { formatDate, formatTime } from '@/utils/format'
import { getTicketStatus } from '@/utils/tickets'
import { QrCodeIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import {
	ImageBackground,
	Modal,
	Pressable,
	ScrollView,
	Text,
	View,
} from 'react-native'
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
		<Modal
			visible={selectedPurchase !== null}
			transparent
			animationType='slide'
			onRequestClose={onClose}
		>
			<View className='flex-1 justify-end bg-tinta/[0.48]'>
				<ImageBackground
					source={require('@/assets/images/zoo-pattern.png')}
					className='max-h-[90%] overflow-hidden rounded-t-[26px] border-t border-card-border bg-blanco px-5 pb-[25px] pt-5'
					imageClassName='opacity-30'
					resizeMode='repeat'
				>
					<View className='flex-row items-center justify-between'>
						<View className='flex-1 flex-row items-center'>
							<View className='mr-[11px] h-11 w-11 items-center justify-center rounded-[14px] bg-hoja'>
								<HugeiconsIcon
									icon={QrCodeIcon}
									size={25}
									color={ICON_COLORS.primary}
								/>
							</View>

							<View className='flex-1'>
								<Text className='text-[19px] font-extrabold text-tinta'>
									Tus entradas
								</Text>
								<Text className='mt-1 text-[11px] text-tinta-2'>
									{selectedPurchase?.folio}
								</Text>
							</View>
						</View>

						<Pressable
							onPress={onClose}
							className='ml-2.5 h-[38px] w-[38px] items-center justify-center rounded-[13px] border border-card-border bg-niebla active:bg-hoja active:opacity-[0.65]'
						>
							<Text className='text-[24px] leading-7 text-tinta'>×</Text>
						</Pressable>
					</View>

					{selectedPurchase && (
						<Text className='mb-2.5 mt-3 text-[12px] text-tinta-2'>
							Compra realizada el {formatDate(selectedPurchase.createdAt)}
							{formatTime(selectedPurchase.createdAt)
								? ` · ${formatTime(selectedPurchase.createdAt)}`
								: ''}
						</Text>
					)}

					<ScrollView
						showsVerticalScrollIndicator={false}
						contentContainerClassName='pb-[5px]'
					>
						{selectedPurchase?.tickets.map((ticket, index) => (
							<View
								key={ticket.id}
								className='mb-3 rounded-[20px] border border-card-border bg-niebla p-3.5'
								style={cardShadow}
							>
								<View className='flex-row items-center justify-between gap-2.5'>
									<View>
										<Text className='text-[15px] font-extrabold text-tinta'>
											{ticket.ticket_type?.name ?? 'Entrada'}
										</Text>
										<Text className='mt-1 text-[11px] text-tinta-2'>
											Entrada {index + 1} de {selectedPurchase.tickets.length}
										</Text>
									</View>

									<View className='rounded-[9px] bg-hoja px-[9px] py-[5px]'>
										<Text className='text-[10px] font-bold text-esmeralda'>
											{getTicketStatus(ticket)}
										</Text>
									</View>
								</View>

								<View
									className='mt-3.5 min-h-[236px] min-w-[236px] items-center justify-center self-center rounded-[18px] border border-card-border bg-blanco p-3'
									style={cardShadow}
								>
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
										<View className='h-[210px] w-[210px] items-center justify-center px-[15px]'>
											<HugeiconsIcon
												icon={QrCodeIcon}
												size={45}
												color={ICON_COLORS.coral}
											/>
											<Text className='mt-2.5 text-center text-[13px] font-bold text-error'>
												Este boleto no tiene QR disponible.
											</Text>
											<Text className='mt-2 text-center text-[9px] text-tinta-2'>
												Token: {String(ticket.qr_token ?? 'NULL')}
											</Text>
										</View>
									)}
								</View>
							</View>
						))}
					</ScrollView>
				</ImageBackground>
			</View>
		</Modal>
	)
}
