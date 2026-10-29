import { CheckmarkCircle02Icon, Ticket01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useMemo } from 'react'
import {
	ImageBackground,
	ScrollView,
	Text,
	View,
	type ViewStyle,
} from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import { SafeAreaView } from 'react-native-safe-area-context'

import BackButton from '@/components/BackButton'
import FixedFooter from '@/components/FixedFooter'
import UserHeader from '@/components/UserHeader'

import colors from '@/theme/colors'
import type { Order } from '@/types/tickets'
import { formatCurrency } from '@/utils/format'

const cardShadow: ViewStyle = {
	shadowColor: colors.bosque,
	shadowOffset: { width: 0, height: 2 },
	shadowOpacity: 0.04,
	shadowRadius: 4,
	elevation: 1,
}

export default function TicketSuccessScreen() {
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
		<SafeAreaView className='flex-1 bg-blanco' edges={['top', 'left', 'right']}>
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				className='flex-1 bg-blanco'
				resizeMode='repeat'
				imageClassName='opacity-[0.025]'
			>
				{/* CONTENIDO DESPLAZABLE */}
				<ScrollView
					className='min-h-0 flex-1'
					contentContainerClassName='w-full grow items-stretch px-5 pb-[190px] pt-3'
					showsVerticalScrollIndicator={false}
					bounces
					nestedScrollEnabled
				>
					{/* BOTÓN REGRESAR Y ENCABEZADO */}
					<View className='w-full items-stretch self-stretch pb-4'>
						<View className='mb-3 w-full items-start'>
							<BackButton onPress={() => router.back()} position='relative' />
						</View>

						<View className='w-full items-stretch self-stretch'>
							<UserHeader
								title='¡Compra realizada!'
								subtitle='Tus boletos están listos para usar.'
								showRewards={false}
							/>
						</View>
					</View>

					{/* CONFIRMACIÓN DE COMPRA */}
					<View
						className='mb-[15px] w-full items-center rounded-[22px] border border-esmeralda bg-esmeralda p-[22px]'
						style={cardShadow}
					>
						<View className='mb-3.5 h-[68px] w-[68px] items-center justify-center rounded-[22px] border-0 bg-transparent'>
							<HugeiconsIcon
								icon={CheckmarkCircle02Icon}
								size={56}
								strokeWidth={1.8}
								color={colors.lima}
							/>
						</View>

						<Text className='text-center text-[23px] font-black text-blanco'>
							¡Compra realizada!
						</Text>

						<Text className='mt-[7px] text-center text-[14px] leading-5 text-hoja'>
							Tu compra se realizó correctamente. Guarda tus códigos QR para
							ingresar al zoológico.
						</Text>
					</View>

					{/* BOLETOS Y CÓDIGOS QR */}
					<View
						className='mb-[15px] w-full rounded-[20px] border border-card-border bg-niebla p-4'
						style={cardShadow}
					>
						<View className='mb-[17px] flex-row items-center'>
							<View className='mr-3 h-12 w-12 items-center justify-center rounded-[15px] border border-card-border bg-hoja'>
								<HugeiconsIcon
									icon={Ticket01Icon}
									size={25}
									strokeWidth={1.8}
									color={colors.esmeralda}
								/>
							</View>

							<View className='min-w-0 flex-1'>
								<Text className='text-[17px] font-black text-tinta'>
									Tus boletos
								</Text>

								<Text className='mt-[3px] text-[12px] leading-[17px] text-tinta-2'>
									Presenta el código QR en la entrada
								</Text>
							</View>
						</View>

						{tickets.length > 0 ? (
							tickets.map((ticket, index) => (
								<View
									key={ticket.id ?? index}
									className='mb-[15px] w-full items-center'
								>
									<Text className='mb-[9px] self-start text-[13px] font-extrabold text-tinta'>
										Boleto {index + 1}
									</Text>

									<View className='items-center justify-center rounded-2xl border border-card-border bg-blanco p-3.5'>
										<QRCode
											value={ticket.qr_token ?? ''}
											size={190}
											backgroundColor={colors.blanco}
										/>
									</View>
								</View>
							))
						) : (
							<View className='w-full items-center justify-center py-[25px]'>
								<Text className='text-center text-[14px] text-tinta-2'>
									No se encontraron boletos en esta compra.
								</Text>
							</View>
						)}
					</View>

					{/* TOTAL PAGADO Y FOLIO */}
					<View
						className='mb-[15px] mt-0.5 w-full rounded-[18px] border border-card-border bg-niebla p-4'
						style={cardShadow}
					>
						<View>
							<Text className='text-[14px] font-bold text-tinta-2'>
								Total pagado
							</Text>

							<Text className='mt-[3px] text-[25px] font-black text-bosque'>
								{formatCurrency(total)}
							</Text>
						</View>

						<View className='mt-[13px] border-t border-t-card-border pt-[13px]'>
							<Text className='text-[11px] font-extrabold uppercase text-tinta-2'>
								Folio
							</Text>

							<Text className='mt-[3px] text-[14px] font-extrabold text-tinta'>
								#{order?.id ?? '---'}
							</Text>
						</View>
					</View>

					{/* INFORMACIÓN IMPORTANTE */}
					<View className='w-full flex-row items-center rounded-2xl border border-card-border bg-niebla p-[15px]'>
						<View className='mr-3 h-[38px] w-[38px] items-center justify-center rounded-xl border border-card-border bg-hoja'>
							<Text className='text-[19px] font-black text-esmeralda'>✓</Text>
						</View>

						<View className='min-w-0 flex-1'>
							<Text className='text-[14px] font-black text-bosque'>
								Importante
							</Text>

							<Text className='mt-1 text-[12px] leading-[18px] text-tinta-2'>
								Los códigos QR son tus boletos de entrada. Puedes mostrarlos
								directamente desde tu celular al llegar al zoológico.
							</Text>
						</View>
					</View>

					<View className='h-0' />
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
			</ImageBackground>
		</SafeAreaView>
	)
}
