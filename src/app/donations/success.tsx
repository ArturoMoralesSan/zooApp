import {
	CheckmarkCircle02Icon,
	CreditCardIcon,
	HeartAddIcon,
	Home01Icon,
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

import {
	amountCardStyle,
	amountIconStyle,
	amountInfoStyle,
	amountLabelStyle,
	amountStyle,
	backButtonPressedStyle,
	backButtonStyle,
	backgroundImageStyle,
	backgroundStyle,
	backTextStyle,
	bottomSpaceStyle,
	cardShadow,
	containerStyle,
	detailCardStyle,
	detailDescriptionStyle,
	detailIconStyle,
	detailLeftStyle,
	detailRowStyle,
	detailTextContainerStyle,
	detailTitleStyle,
	detailValueStyle,
	folioStyle,
	footerAmountStyle,
	footerDescriptionStyle,
	footerInfoStyle,
	footerLabelStyle,
	footerStyle,
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
	paymentValueStyle,
	receiptIconTextStyle,
	scrollContentStyle,
	sectionTitleStyle,
	separatorStyle,
	subtitleStyle,
	successCardStyle,
	successIconStyle,
	successTextStyle,
	successTitleStyle,
	thanksCardStyle,
	thanksContentStyle,
	thanksIconStyle,
	thanksTextStyle,
	thanksTitleStyle,
	titleStyle,
} from '@/styles/donation-success'

const COLORS = {
	primary: '#075C3B',
	white: '#FFFFFF',
}

export default function DonationSuccessScreen() {
	const router = useRouter()

	const params = useLocalSearchParams<{
		amount?: string
		donation?: string
	}>()

	const donation = useMemo(() => {
		try {
			return params.donation ? JSON.parse(params.donation) : null
		} catch {
			return null
		}
	}, [params.donation])

	const amount = useMemo(() => {
		const value = Number(
			String(donation?.amount ?? params.amount ?? '0').replace(',', '.'),
		)

		if (!Number.isFinite(value) || value < 0) {
			return 0
		}

		return value
	}, [donation?.amount, params.amount])

	const donationId = donation?.id ?? null

	return (
		<SafeAreaView style={containerStyle}>
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				style={backgroundStyle}
				resizeMode='repeat'
				imageStyle={backgroundImageStyle}
			>
				<View style={headerStyle}>
					<View>
						<Pressable
							onPress={() => router.back()}
							style={({ pressed }) => [
								backButtonStyle,
								pressed && backButtonPressedStyle,
							]}
						>
							<Text style={backTextStyle}>‹ Regresar</Text>
						</Pressable>
					</View>

					<View style={headerTextStyle}>
						<Text style={titleStyle}>¡Donación realizada!</Text>

						<Text style={subtitleStyle}>
							Gracias por apoyar al Zoológico Sahuatoba
						</Text>
					</View>
				</View>

				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={scrollContentStyle}
				>
					<View style={[successCardStyle, cardShadow]}>
						<View style={successIconStyle}>
							<HugeiconsIcon
								icon={CheckmarkCircle02Icon}
								size={56}
								strokeWidth={1.8}
								color={COLORS.primary}
							/>
						</View>

						<Text style={successTitleStyle}>¡Gracias por tu donación!</Text>

						<Text style={successTextStyle}>
							Tu aportación se realizó correctamente y ayudará al cuidado de los
							animales y a la conservación del zoológico.
						</Text>
					</View>

					<View style={[amountCardStyle, cardShadow]}>
						<View style={amountIconStyle}>
							<HugeiconsIcon
								icon={HeartAddIcon}
								size={29}
								strokeWidth={1.8}
								color={COLORS.primary}
							/>
						</View>

						<View style={amountInfoStyle}>
							<Text style={amountLabelStyle}>Monto donado</Text>

							<Text style={amountStyle} numberOfLines={1} adjustsFontSizeToFit>
								${amount.toFixed(2)}
							</Text>
						</View>
					</View>

					<Text style={sectionTitleStyle}>Detalle de la donación</Text>

					<View style={[detailCardStyle, cardShadow]}>
						<View style={detailRowStyle}>
							<View style={detailLeftStyle}>
								<View style={detailIconStyle}>
									<HugeiconsIcon
										icon={HeartAddIcon}
										size={20}
										strokeWidth={1.8}
										color={COLORS.primary}
									/>
								</View>

								<View style={detailTextContainerStyle}>
									<Text style={detailTitleStyle}>Donación</Text>

									<Text style={detailDescriptionStyle}>
										Aportación al zoológico
									</Text>
								</View>
							</View>

							<Text style={detailValueStyle}>${amount.toFixed(2)}</Text>
						</View>

						<View style={separatorStyle} />

						<View style={detailRowStyle}>
							<View style={detailLeftStyle}>
								<View style={detailIconStyle}>
									<HugeiconsIcon
										icon={CreditCardIcon}
										size={20}
										strokeWidth={1.8}
										color={COLORS.primary}
									/>
								</View>

								<View style={detailTextContainerStyle}>
									<Text style={detailTitleStyle}>Método de pago</Text>

									<Text style={detailDescriptionStyle}>Pago con tarjeta</Text>
								</View>
							</View>

							<Text style={paymentValueStyle}>Tarjeta</Text>
						</View>

						{donationId !== null && (
							<>
								<View style={separatorStyle} />

								<View style={detailRowStyle}>
									<View style={detailLeftStyle}>
										<View style={detailIconStyle}>
											<Text style={receiptIconTextStyle}>#</Text>
										</View>

										<View style={detailTextContainerStyle}>
											<Text style={detailTitleStyle}>Folio</Text>

											<Text style={detailDescriptionStyle}>
												Comprobante de donación
											</Text>
										</View>
									</View>

									<Text style={folioStyle}>#{donationId}</Text>
								</View>
							</>
						)}
					</View>

					<View style={infoBoxStyle}>
						<View style={infoIconStyle}>
							<Text style={infoIconTextStyle}>✓</Text>
						</View>

						<View style={infoContentStyle}>
							<Text style={infoTitleStyle}>¡Tu apoyo cuenta!</Text>

							<Text style={infoTextStyle}>
								Gracias a personas como tú podemos seguir trabajando en el
								bienestar de los animales y en la conservación de nuestra fauna.
							</Text>
						</View>
					</View>

					<View style={thanksCardStyle}>
						<View style={thanksIconStyle}>
							<HugeiconsIcon
								icon={HeartAddIcon}
								size={23}
								strokeWidth={1.8}
								color={COLORS.primary}
							/>
						</View>

						<View style={thanksContentStyle}>
							<Text style={thanksTitleStyle}>
								Gracias por ser parte de esta causa
							</Text>

							<Text style={thanksTextStyle}>
								Tu donación se suma a los esfuerzos para mantener y mejorar los
								espacios del Zoológico Sahuatoba.
							</Text>
						</View>
					</View>

					<View style={bottomSpaceStyle} />
				</ScrollView>

				<View style={footerStyle}>
					<View style={footerInfoStyle}>
						<View>
							<Text style={footerLabelStyle}>Donación confirmada</Text>

							<Text style={footerDescriptionStyle}>
								Gracias por tu aportación
							</Text>
						</View>

						<Text
							style={footerAmountStyle}
							numberOfLines={1}
							adjustsFontSizeToFit
						>
							${amount.toFixed(2)}
						</Text>
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
									color={COLORS.white}
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
