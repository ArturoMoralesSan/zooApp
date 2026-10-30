import ActionButton from '@/components/ActionButton'
import { type User } from '@/services/auth'
import colors from '@/theme/colors'
import { cardShadow } from '@/theme/shadows'
import { QrCodeIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { ActivityIndicator, Modal, Text, View } from 'react-native'
import QRCode from 'react-native-qrcode-svg'

type PanelQrModalProps = {
	visible: boolean
	user: User | null
	onClose: () => void
}

export function PanelQrModal({ visible, user, onClose }: PanelQrModalProps) {
	return (
		<Modal
			visible={visible}
			transparent
			animationType='fade'
			statusBarTranslucent
			navigationBarTranslucent
			onRequestClose={onClose}
		>
			{/* Overlay */}

			<View className='flex-1 items-center justify-center bg-bosque/55 px-6 py-5'>
				{/* Modal */}

				<View
					className='w-full max-w-[380px] rounded-3xl border border-card-border bg-blanco p-5'
					style={cardShadow}
				>
					{/* ENCABEZADO */}

					<View className='items-center'>
						<View className='h-11 w-11 items-center justify-center rounded-[14px] border border-card-border bg-hoja'>
							<HugeiconsIcon
								icon={QrCodeIcon}
								size={26}
								strokeWidth={1.8}
								color={colors.esmeralda}
							/>
						</View>

						<Text className='text-h2 mt-2.5 text-center text-tinta'>
							Mi código QR
						</Text>

						<Text className='text-body mt-1 text-center text-tinta'>
							Presenta este código en taquilla para identificar tu cuenta.
						</Text>
					</View>

					{/* CÓDIGO QR */}

					<View
						className='mt-[18px] self-center rounded-3xl border border-card-border bg-blanco p-3'
						style={cardShadow}
					>
						{user?.qr_token ? (
							<QRCode
								value={user.qr_token}
								size={180}
								backgroundColor={colors.blanco}
								color={colors.bosque}
							/>
						) : (
							<View className='h-[180px] w-[180px] items-center justify-center bg-blanco'>
								<ActivityIndicator size='large' color={colors.esmeralda} />
							</View>
						)}
					</View>

					{/* INFORMACIÓN */}

					<View className='mt-3.5 rounded-xl border border-card-border bg-niebla p-2.5'>
						<Text className='text-h3 text-tinta'>Código personal</Text>

						<Text className='text-meta mt-1 text-tinta'>
							Este código está asociado a tu cuenta de ZooApp.
						</Text>
					</View>

					{/* BOTÓN CERRAR */}

					<View className='mt-3.5'>
						<ActionButton title='Cerrar' onPress={onClose} />
					</View>
				</View>
			</View>
		</Modal>
	)
}
