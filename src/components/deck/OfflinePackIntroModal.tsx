import { CloudDownloadIcon } from '@hugeicons/core-free-icons'
import { Text, View } from 'react-native'

import { Button } from '@/components/ui/Button'
import { IconBox } from '@/components/ui/IconBox'
import { Modal } from '@/components/ui/Modal'

type OfflinePackIntroModalProps = {
	visible: boolean
	// "4.3 MB".
	size: string
	// On mobile data the button says so: the download would use it.
	cellular: boolean
	onDownload: () => void
	onLater: () => void
}

// First ZooDeck visit with nothing downloaded: offers the offline pack once.
export function OfflinePackIntroModal({
	visible,
	size,
	cellular,
	onDownload,
	onLater,
}: OfflinePackIntroModalProps) {
	return (
		<Modal visible={visible} onClose={onLater}>
			<View className='items-center'>
				<IconBox icon={CloudDownloadIcon} size='lg' />

				<Text className='text-h2 mt-3 text-center text-tinta'>
					Prepara tu visita
				</Text>

				<Text className='text-body mt-2 text-center text-tinta-2'>
					Descarga las tarjetas en casa. En el zoológico verás a los animales en
					AR y tu colección sin gastar datos, incluso sin señal.
				</Text>

				<Text className='text-meta mt-3 text-center'>
					{cellular
						? `Estás usando datos móviles. La descarga ocupa ${size}.`
						: `Ocupa ${size}. Puedes borrarlo cuando quieras.`}
				</Text>
			</View>

			<Button
				title={
					cellular
						? `Descargar con datos · ${size}`
						: `Descargar ahora · ${size}`
				}
				onPress={onDownload}
				className='mt-6'
			/>
			<Button
				title={cellular ? 'Esperar al Wi-Fi' : 'Más tarde'}
				variant='secondary'
				onPress={onLater}
				className='mt-3'
			/>
		</Modal>
	)
}
