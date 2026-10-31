import { InformationCircleIcon, Ticket01Icon } from '@hugeicons/core-free-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useMemo } from 'react'
import { ScrollView, Text, View } from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import { QrFrame } from '@/components/ui/QrFrame'

import BackButton from '@/components/ui/BackButton'
import FixedFooter from '@/components/FixedFooter'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Divider } from '@/components/ui/Divider'
import { IconBox } from '@/components/ui/IconBox'
import { ListCard } from '@/components/ui/ListCard'
import { SuccessBanner } from '@/components/ui/SuccessBanner'

import colors from '@/theme/colors'
import type { Order } from '@/types/tickets'
import { formatCurrency } from '@/utils/format'
import { useFixedFooterSpace } from '@/theme/layout'
import { ScreenBackground } from '@/components/ui/ScreenBackground'

export default function TicketSuccessScreen() {
	const footerSpace = useFixedFooterSpace()
	const router = useRouter()

	const params = useLocalSearchParams<{
		order?: string
	}>()

	const order: Order | null = useMemo(() => {
		try {
			return params.order ? JSON.parse(params.order) : null
		} catch {
			return null
		}
	}, [params.order])

	const tickets = order?.tickets ?? []
	const total = Number(order?.total ?? 0)

	return (
		<ScreenBackground>
			{/* CONTENIDO DESPLAZABLE */}
			<ScrollView
				className='min-h-0 flex-1'
				contentContainerClassName='w-full grow items-stretch px-5 pt-3'
				contentContainerStyle={{ paddingBottom: footerSpace }}
				showsVerticalScrollIndicator={false}
				bounces
				nestedScrollEnabled
			>
				{/* BOTÓN REGRESAR (el título lo da SuccessBanner) */}
				<View className='mb-4'>
					<BackButton onPress={() => router.back()} position='relative' />
				</View>

				{/* CONFIRMACIÓN DE COMPRA */}
				<SuccessBanner
					title='¡Compra realizada!'
					message='Tu compra se realizó correctamente. Guarda tus códigos QR para ingresar al zoológico.'
				/>

				{/* BOLETOS Y CÓDIGOS QR */}
				<Card className='mb-3'>
					<View className='flex-row items-center gap-3'>
						<IconBox icon={Ticket01Icon} />

						<View className='min-w-0 flex-1'>
							<Text className='text-h3 text-tinta'>Tus boletos</Text>

							<Text className='text-meta mt-1'>
								Presenta el código QR en la entrada
							</Text>
						</View>
					</View>

					<Divider className='my-4' />

					{tickets.length > 0 ? (
						tickets.map((ticket, index) => (
							<View
								key={ticket.id ?? index}
								className='mb-4 w-full items-center'
							>
								<Badge
									label={`Boleto ${index + 1}`}
									tone='success'
									className='mb-3 self-center'
								/>

								<QrFrame>
									<QRCode
										value={ticket.qr_token ?? ''}
										size={190}
										backgroundColor={colors.blanco}
									/>
								</QrFrame>
							</View>
						))
					) : (
						<View className='w-full items-center justify-center py-6'>
							<Text className='text-body text-center text-tinta-2'>
								No se encontraron boletos en esta compra.
							</Text>
						</View>
					)}
				</Card>

				{/* TOTAL PAGADO Y FOLIO */}
				<Card className='mb-3'>
					<Text className='text-overline text-tinta-2'>Total pagado</Text>

					<Text className='mt-1 font-display-x text-[25px] text-bosque'>
						{formatCurrency(total)}
					</Text>

					<Divider />

					<Text className='text-overline text-tinta-2'>Folio</Text>

					<Text className='mt-1 font-display-x text-[14px] text-tinta'>
						#{order?.id ?? '---'}
					</Text>
				</Card>

				{/* INFORMACIÓN IMPORTANTE */}
				<ListCard
					icon={InformationCircleIcon}
					title='Importante'
					description='Los códigos QR son tus boletos de entrada. Puedes mostrarlos directamente desde tu celular al llegar al zoológico.'
				/>
			</ScrollView>

			{/* FOOTER FIJO */}
			<FixedFooter
				label='Compra confirmada'
				description={`${tickets.length} ${
					tickets.length === 1 ? 'boleto' : 'boletos'
				}`}
				amount={formatCurrency(total)}
				buttonTitle='Ir al inicio'
				onButtonPress={() => router.replace('/')}
			/>
		</ScreenBackground>
	)
}
