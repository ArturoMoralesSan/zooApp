import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { IconBox } from '@/components/ui/IconBox'
import { Modal } from '@/components/ui/Modal'
import { type User } from '@/services/auth'
import colors from '@/theme/colors'
import { QrCodeIcon } from '@hugeicons/core-free-icons'
import { ActivityIndicator, Text, View } from 'react-native'
import QRCode from 'react-native-qrcode-svg'

type PanelQrModalProps = {
	visible: boolean
	user: User | null
	onClose: () => void
}

export function PanelQrModal({ visible, user, onClose }: PanelQrModalProps) {
	return (
		<Modal visible={visible} onClose={onClose}>
			{/* ENCABEZADO */}

			<View className='items-center'>
				<IconBox icon={QrCodeIcon} size='lg' />

				<Text className='text-h2 mt-3 text-center text-tinta'>
					Mi código QR
				</Text>

				<Text className='text-body mt-1 text-center text-tinta-2'>
					Presenta este código en taquilla para identificar tu cuenta.
				</Text>
			</View>

			{/* CÓDIGO QR */}

			<View className='mt-5 self-center rounded-2xl border-1.5 border-card-border bg-blanco p-3'>
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

			<Card className='mt-4'>
				<Text className='text-h3 text-tinta'>Código personal</Text>

				<Text className='text-meta mt-1'>
					Este código está asociado a tu cuenta de ZooApp.
				</Text>
			</Card>

			<Button title='Cerrar' onPress={onClose} className='mt-6' />
		</Modal>
	)
}
