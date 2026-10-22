import { CheckmarkCircle02Icon, Ticket01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useMemo } from 'react'
import { ImageBackground, ScrollView, Text, View } from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import { SafeAreaView } from 'react-native-safe-area-context'

import BackButton from '@/components/BackButton'
import FixedFooter from '@/components/FixedFooter'
import UserHeader from '@/components/UserHeader'

import {
	backgroundImageStyle,
	backgroundStyle,
	bottomSpaceStyle,
	cardShadow,
	colors,
	containerStyle,
	folioContainerStyle,
	folioLabelStyle,
	folioStyle,
	infoBoxStyle,
	infoContentStyle,
	infoIconStyle,
	infoIconTextStyle,
	infoTextStyle,
	infoTitleStyle,
	noTicketsStyle,
	noTicketsTextStyle,
	orderCardStyle,
	orderHeaderInfoStyle,
	orderHeaderStyle,
	orderIconStyle,
	orderSubtitleStyle,
	orderTitleStyle,
	qrContainerStyle,
	scrollContentStyle,
	successCardStyle,
	successIconStyle,
	successTextStyle,
	successTitleStyle,
	ticketContainerStyle,
	ticketLabelStyle,
	totalAmountStyle,
	totalCardStyle,
	totalLabelStyle,
} from '@/styles/ticket-success'

type Ticket = {
	id: number
	ticket_type_id: number
	qr_token: string
	status: string
}

type Order = {
	id: number
	total: number | string
	subtotal?: number | string
	discount?: number | string
	tickets?: Ticket[]
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

	const formatCurrency = (value: number) =>
		new Intl.NumberFormat('es-MX', {
			style: 'currency',
			currency: 'MXN',
			minimumFractionDigits: 2,
		}).format(value)

	return (
		<SafeAreaView
			style={[containerStyle, { flex: 1 }]}
			edges={['top', 'left', 'right']}
		>
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				style={[backgroundStyle, { flex: 1 }]}
				resizeMode='repeat'
				imageStyle={backgroundImageStyle}
			>
				{/* CONTENIDO DESPLAZABLE */}
				<ScrollView
					style={{ flex: 1, minHeight: 0 }}
					contentContainerStyle={[
						scrollContentStyle,
						{
							width: '100%',
							paddingHorizontal: 20,
							paddingTop: 12,
							paddingBottom: 190,
							flexGrow: 1,
							alignItems: 'stretch',
						},
					]}
					showsVerticalScrollIndicator={false}
					bounces
					nestedScrollEnabled
				>
					{/* BOTÓN REGRESAR Y ENCABEZADO */}
					<View
						style={{
							width: '100%',
							alignSelf: 'stretch',
							alignItems: 'stretch',
							paddingBottom: 16,
						}}
					>
						<View
							style={{
								width: '100%',
								alignItems: 'flex-start',
								marginBottom: 12,
							}}
						>
							<BackButton onPress={() => router.back()} position='relative' />
						</View>

						<View
							style={{
								width: '100%',
								alignSelf: 'stretch',
								alignItems: 'stretch',
							}}
						>
							<UserHeader
								title='¡Compra realizada!'
								subtitle='Tus boletos están listos para usar.'
								showRewards={false}
							/>
						</View>
					</View>

					{/* CONFIRMACIÓN DE COMPRA */}
					<View
						style={[
							successCardStyle,
							cardShadow,
							{
								backgroundColor: colors.button,
								borderColor: colors.button,
							},
						]}
					>
						<View
							style={[
								successIconStyle,
								{
									backgroundColor: 'transparent',
									borderWidth: 0,
									elevation: 0,
									shadowOpacity: 0,
								},
							]}
						>
							<HugeiconsIcon
								icon={CheckmarkCircle02Icon}
								size={56}
								strokeWidth={1.8}
								color='#B8F35D'
							/>
						</View>

						<Text style={[successTitleStyle, { color: colors.white }]}>
							¡Compra realizada!
						</Text>

						<Text style={[successTextStyle, { color: '#EAF5EE' }]}>
							Tu compra se realizó correctamente. Guarda tus códigos QR para
							ingresar al zoológico.
						</Text>
					</View>

					{/* BOLETOS Y CÓDIGOS QR */}
					<View style={[orderCardStyle, cardShadow]}>
						<View style={orderHeaderStyle}>
							<View
								style={[
									orderIconStyle,
									{
										backgroundColor: colors.active,
										borderColor: colors.border,
										alignItems: 'center',
										justifyContent: 'center',
									},
								]}
							>
								<HugeiconsIcon
									icon={Ticket01Icon}
									size={25}
									strokeWidth={1.8}
									color={colors.primary}
								/>
							</View>

							<View style={orderHeaderInfoStyle}>
								<Text style={orderTitleStyle}>Tus boletos</Text>

								<Text style={orderSubtitleStyle}>
									Presenta el código QR en la entrada
								</Text>
							</View>
						</View>

						{tickets.length > 0 ? (
							tickets.map((ticket, index) => (
								<View key={ticket.id ?? index} style={ticketContainerStyle}>
									<Text style={ticketLabelStyle}>Boleto {index + 1}</Text>

									<View style={qrContainerStyle}>
										<QRCode
											value={ticket.qr_token}
											size={190}
											backgroundColor={colors.white}
										/>
									</View>
								</View>
							))
						) : (
							<View style={noTicketsStyle}>
								<Text style={noTicketsTextStyle}>
									No se encontraron boletos en esta compra.
								</Text>
							</View>
						)}
					</View>

					{/* TOTAL PAGADO Y FOLIO */}
					<View style={[totalCardStyle, cardShadow]}>
						<View>
							<Text style={totalLabelStyle}>Total pagado</Text>

							<Text style={totalAmountStyle}>{formatCurrency(total)}</Text>
						</View>

						<View style={folioContainerStyle}>
							<Text style={folioLabelStyle}>Folio</Text>

							<Text style={folioStyle}>#{order?.id ?? '---'}</Text>
						</View>
					</View>

					{/* INFORMACIÓN IMPORTANTE */}
					<View style={infoBoxStyle}>
						<View style={infoIconStyle}>
							<Text style={infoIconTextStyle}>✓</Text>
						</View>

						<View style={infoContentStyle}>
							<Text style={infoTitleStyle}>Importante</Text>

							<Text style={infoTextStyle}>
								Los códigos QR son tus boletos de entrada. Puedes mostrarlos
								directamente desde tu celular al llegar al zoológico.
							</Text>
						</View>
					</View>

					<View style={bottomSpaceStyle} />
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
