import {
	Home01Icon,
	InformationCircleIcon,
	Ticket01Icon,
} from '@hugeicons/core-free-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useMemo } from 'react'
import { ScrollView, Text, View } from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import { QrFrame } from '@/components/ui/QrFrame'

import FixedFooter from '@/components/FixedFooter'
import { Chip } from '@/components/ui/Chip'
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
import { useTicketTypes } from '@/hooks/useTickets'
import { useScrolled } from '@/hooks/useScrolled'
import { TopBar } from '@/components/ui/TopBar'

export default function TicketSuccessScreen() {
	const { scrolled, onScroll } = useScrolled()
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
	// The order's tickets carry only ticket_type_id; names come from the
	// ticket types already cached by the purchase screen.
	const ticketTypes = useTicketTypes().data ?? []
	const typeName = (typeId?: number) =>
		ticketTypes.find((type) => type.id === typeId)?.name
	const total = Number(order?.total ?? 0)

	return (
		<ScreenBackground>
			{/* CONTENIDO DESPLAZABLE */}
			<TopBar onBack={() => router.back()} scrolled={scrolled} />

			<ScrollView
				onScroll={onScroll}
				scrollEventThrottle={16}
				className='min-h-0 flex-1'
				contentContainerClassName='w-full grow items-stretch px-5 pt-2'
				contentContainerStyle={{ paddingBottom: footerSpace }}
				showsVerticalScrollIndicator={false}
				bounces
				nestedScrollEnabled
			>
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
								<View className='mb-3'>
									<Chip
										selected
										label={[
											`Boleto ${index + 1}`,
											ticket.ticket_type?.name ??
												typeName(ticket.ticket_type_id),
										]
											.filter(Boolean)
											.join(' · ')}
									/>
								</View>

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
				buttonIcon={Home01Icon}
				onButtonPress={() => router.replace('/')}
			/>
		</ScreenBackground>
	)
}
