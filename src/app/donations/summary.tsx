import {
	CreditCardIcon,
	HeartAddIcon,
	ShieldCheckIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import {
	ActivityIndicator,
	ImageBackground,
	Pressable,
	ScrollView,
	Text,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { api } from '@/services/api'
import { getToken } from '@/services/auth'

import {
	amountCardStyle,
	amountDescriptionStyle,
	amountIconStyle,
	amountLabelStyle,
	amountStyle,
	backButtonPressedStyle,
	backButtonStyle,
	backgroundImageStyle,
	backgroundStyle,
	backTextStyle,
	bottomSpaceStyle,
	confirmButtonContentStyle,
	confirmButtonDisabledStyle,
	confirmButtonLoadingStyle,
	confirmButtonPressedStyle,
	confirmButtonStyle,
	confirmButtonTextStyle,
	confirmButtonWrapperStyle,
	containerStyle,
	detailCardStyle,
	detailDescriptionStyle,
	detailIconStyle,
	detailLeftStyle,
	detailRowStyle,
	detailTextContainerStyle,
	detailTitleStyle,
	detailValueStyle,
	errorCardStyle,
	errorTextStyle,
	footerStyle,
	headerStyle,
	paymentSelectedStyle,
	scrollContentStyle,
	sectionTitleStyle,
	securityCardStyle,
	securityContentStyle,
	securityIconStyle,
	securityTextStyle,
	securityTitleStyle,
	separatorStyle,
	subtitleStyle,
	thanksCardStyle,
	thanksTextStyle,
	thanksTitleStyle,
	titleIconStyle,
	titleRowStyle,
	titleStyle,
	titleTextContainerStyle,
	totalContainerStyle,
	totalDescriptionStyle,
	totalInfoStyle,
	totalLabelStyle,
	totalStyle,
} from '@/styles/donation-summary'

const COLORS = {
	primary: '#075C3B',
	dark: '#17372C',
	muted: '#557067',
	white: '#FFFFFF',
}

type Donation = {
	id?: number | string
	amount?: number | string
	reference?: string | null
	status?: string
	created_at?: string
	payment_method?: {
		id?: number
		name?: string
		code?: string
	} | null
}

type DonationResponse = {
	success?: boolean
	message?: string
	data?: {
		donation?: Donation
	}
	donation?: Donation
}

export default function DonationsSummaryScreen() {
	const router = useRouter()

	const params = useLocalSearchParams<{
		amount?: string
	}>()

	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const amount = useMemo(() => {
		const value = Number(String(params.amount ?? '0').replace(',', '.'))

		if (!Number.isFinite(value) || value < 0) {
			return 0
		}

		return value
	}, [params.amount])

	const confirmDonation = async () => {
		if (loading) {
			return
		}

		if (amount < 10) {
			setError('El monto mínimo de donación es de $10.00.')
			return
		}

		setError(null)
		setLoading(true)

		try {
			const token = await getToken()

			if (!token) {
				router.replace('/login')
				return
			}

			const response = await api<DonationResponse>('/donations', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
				body: JSON.stringify({
					amount: Number(amount.toFixed(2)),
				}),
			})

			const donation = response?.data?.donation ?? response?.donation

			if (!donation) {
				throw new Error(
					response?.message ?? 'No fue posible registrar la donación.',
				)
			}

			router.replace({
				pathname: '/donations/success',
				params: {
					amount: String(donation.amount ?? amount),
					donation: JSON.stringify(donation),
				},
			})
		} catch (err: any) {
			console.error('Error al crear donación:', err)

			let message =
				'No fue posible registrar la donación. Inténtalo nuevamente.'

			if (err?.message) {
				message = err.message
			}

			setError(message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<SafeAreaView style={containerStyle}>
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				style={backgroundStyle}
				imageStyle={backgroundImageStyle}
				resizeMode='repeat'
			>
				<View style={backButtonStyle}>
					<Pressable
						onPress={() => router.back()}
						disabled={loading}
						style={({ pressed }) => [
							backButtonStyle,
							pressed && backButtonPressedStyle,
						]}
					>
						<Text style={backTextStyle}>‹ Regresar</Text>
					</Pressable>
				</View>

				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={scrollContentStyle}
				>
					<View style={headerStyle}>
						<View style={titleRowStyle}>
							<View style={titleIconStyle}>
								<HugeiconsIcon
									icon={HeartAddIcon}
									size={27}
									color={COLORS.primary}
									strokeWidth={1.8}
								/>
							</View>

							<View style={titleTextContainerStyle}>
								<Text style={titleStyle}>Resumen de donación</Text>

								<Text style={subtitleStyle}>
									Revisa los datos antes de continuar con tu aportación.
								</Text>
							</View>
						</View>
					</View>

					<View style={amountCardStyle}>
						<View style={amountIconStyle}>
							<HugeiconsIcon
								icon={HeartAddIcon}
								size={30}
								color={COLORS.primary}
								strokeWidth={1.8}
							/>
						</View>

						<Text style={amountLabelStyle}>Donación</Text>

						<Text style={amountStyle} numberOfLines={1} adjustsFontSizeToFit>
							${amount.toFixed(2)}
						</Text>

						<Text style={amountDescriptionStyle}>
							Aportación para el Zoológico Sahuatoba
						</Text>
					</View>

					<Text style={sectionTitleStyle}>Detalle del pago</Text>

					<View style={detailCardStyle}>
						<View style={detailRowStyle}>
							<View style={detailLeftStyle}>
								<View style={detailIconStyle}>
									<HugeiconsIcon
										icon={HeartAddIcon}
										size={20}
										color={COLORS.primary}
										strokeWidth={1.8}
									/>
								</View>

								<View style={detailTextContainerStyle}>
									<Text style={detailTitleStyle}>Donación</Text>

									<Text style={detailDescriptionStyle}>
										Aportación voluntaria
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
										color={COLORS.primary}
										strokeWidth={1.8}
									/>
								</View>

								<View style={detailTextContainerStyle}>
									<Text style={detailTitleStyle}>Método de pago</Text>

									<Text style={detailDescriptionStyle}>Pago con tarjeta</Text>
								</View>
							</View>

							<Text style={paymentSelectedStyle}>Tarjeta</Text>
						</View>
					</View>

					<View style={securityCardStyle}>
						<View style={securityIconStyle}>
							<HugeiconsIcon
								icon={ShieldCheckIcon}
								size={25}
								color={COLORS.primary}
								strokeWidth={1.8}
							/>
						</View>

						<View style={securityContentStyle}>
							<Text style={securityTitleStyle}>Pago seguro</Text>

							<Text style={securityTextStyle}>
								Tu información de pago será procesada de forma segura mediante
								nuestro proveedor de pagos.
							</Text>
						</View>
					</View>

					<View style={thanksCardStyle}>
						<Text style={thanksTitleStyle}>
							Gracias por apoyar al zoológico
						</Text>

						<Text style={thanksTextStyle}>
							Tu aportación ayuda al cuidado de los animales, mantenimiento de
							sus espacios y conservación de nuestra fauna.
						</Text>
					</View>

					{error && (
						<View style={errorCardStyle}>
							<Text style={errorTextStyle}>{error}</Text>
						</View>
					)}

					<View style={bottomSpaceStyle} />
				</ScrollView>

				<View style={footerStyle}>
					<View style={totalContainerStyle}>
						<View style={totalInfoStyle}>
							<Text style={totalLabelStyle}>Total a donar</Text>

							<Text style={totalDescriptionStyle}>
								Incluye todo el monto de tu donación
							</Text>
						</View>

						<Text style={totalStyle} numberOfLines={1} adjustsFontSizeToFit>
							${amount.toFixed(2)}
						</Text>
					</View>

					<View
						style={[
							confirmButtonWrapperStyle,
							amount < 10 && confirmButtonDisabledStyle,
							loading && confirmButtonLoadingStyle,
						]}
					>
						<Pressable
							disabled={amount < 10 || loading}
							onPress={confirmDonation}
							style={({ pressed }) => [
								confirmButtonStyle,
								pressed &&
									amount >= 10 &&
									!loading &&
									confirmButtonPressedStyle,
							]}
						>
							<View style={confirmButtonContentStyle}>
								{loading ? (
									<>
										<ActivityIndicator size='small' color={COLORS.white} />

										<Text style={confirmButtonTextStyle}>
											Registrando donación...
										</Text>
									</>
								) : (
									<>
										<Text style={confirmButtonTextStyle}>
											Confirmar donación
										</Text>
									</>
								)}
							</View>
						</Pressable>
					</View>
				</View>
			</ImageBackground>
		</SafeAreaView>
	)
}
