import {
	CheckmarkCircle02Icon,
	Home01Icon,
	Ticket01Icon,
} from '@hugeicons/core-free-icons'

import { HugeiconsIcon } from '@hugeicons/react-native'

import { useLocalSearchParams, useRouter } from 'expo-router'

import { useMemo } from 'react'

import {
	ImageBackground,
	Pressable,
	ScrollView,
	Text,
	View,
} from 'react-native'

import { SafeAreaView } from 'react-native-safe-area-context'

import QRCode from 'react-native-qrcode-svg'

import {
	backButtonPressedStyle,
	backButtonStyle,
	backTextStyle,
	backgroundImageStyle,
	backgroundStyle,
	bottomSpaceStyle,
	cardShadow,
	colors,
	containerStyle,
	folioContainerStyle,
	folioLabelStyle,
	folioStyle,
	footerAmountStyle,
	footerInfoStyle,
	footerLabelStyle,
	footerStyle,
	footerTicketCountStyle,
	headerStyle,
	headerTextStyle,
	homeButtonContentStyle,
	homeButtonPressedStyle,
	homeButtonStyle,
	homeButtonTextStyle,
	homeButtonWrapperStyle,
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
	subtitleStyle,
	successCardStyle,
	successIconStyle,
	successTextStyle,
	successTitleStyle,
	ticketContainerStyle,
	ticketLabelStyle,
	titleStyle,
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

	return (
		<SafeAreaView style={containerStyle} edges={['top', 'left', 'right']}>
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				style={backgroundStyle}
				className='flex-1'
				resizeMode='repeat'
				imageStyle={backgroundImageStyle}
			>
				{/* HEADER */}
				<View style={headerStyle}>
					<Pressable
						onPress={() => router.back()}
						style={({ pressed }) => [
							backButtonStyle,
							pressed && backButtonPressedStyle,
						]}
					>
						<Text style={backTextStyle}>‹ Regresar</Text>
					</Pressable>

					<View style={headerTextStyle}>
						<Text style={titleStyle}>¡Compra realizada!</Text>

						<Text style={subtitleStyle}>
							Tus boletos están listos para usar
						</Text>
					</View>
				</View>

				{/* CONTENIDO */}
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={scrollContentStyle}
				>
					{/* CONFIRMACIÓN */}
					<View style={[successCardStyle, cardShadow]}>
						<View style={successIconStyle}>
							<HugeiconsIcon
								icon={CheckmarkCircle02Icon}
								size={56}
								strokeWidth={1.8}
								color={colors.primary}
							/>
						</View>

						<Text style={successTitleStyle}>¡Compra realizada!</Text>

						<Text style={successTextStyle}>
							Tu compra se realizó correctamente. Guarda tus códigos QR para
							ingresar al zoológico.
						</Text>
					</View>

					{/* BOLETOS */}
					<View style={[orderCardStyle, cardShadow]}>
						<View style={orderHeaderStyle}>
							<View style={orderIconStyle}>
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

						{tickets.map((ticket, index) => (
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
						))}

						{tickets.length === 0 ? (
							<View style={noTicketsStyle}>
								<Text style={noTicketsTextStyle}>
									No se encontraron boletos en esta compra.
								</Text>
							</View>
						) : null}
					</View>

					{/* TOTAL */}
					<View style={[totalCardStyle, cardShadow]}>
						<View>
							<Text style={totalLabelStyle}>Total pagado</Text>

							<Text style={totalAmountStyle}>${total.toFixed(2)}</Text>
						</View>

						<View style={folioContainerStyle}>
							<Text style={folioLabelStyle}>Folio</Text>

							<Text style={folioStyle}>#{order?.id ?? '---'}</Text>
						</View>
					</View>

					{/* INFORMACIÓN */}
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

				{/* FOOTER */}
				<View style={footerStyle}>
					<View style={footerInfoStyle}>
						<View>
							<Text style={footerLabelStyle}>Compra confirmada</Text>

							<Text style={footerTicketCountStyle}>
								{tickets.length} {tickets.length === 1 ? 'boleto' : 'boletos'}
							</Text>
						</View>

						<Text style={footerAmountStyle}>${total.toFixed(2)}</Text>
					</View>

					<View style={homeButtonWrapperStyle}>
						<Pressable
							onPress={() => router.replace('/')}
							style={({ pressed }) => [
								homeButtonStyle,
								pressed && homeButtonPressedStyle,
							]}
						>
							<View style={homeButtonContentStyle}>
								<HugeiconsIcon
									icon={Home01Icon}
									size={21}
									strokeWidth={1.8}
									color={colors.white}
								/>

								<Text style={homeButtonTextStyle}>Ir al inicio</Text>
							</View>
						</Pressable>
					</View>
				</View>
			</ImageBackground>
		</SafeAreaView>
	)
}
