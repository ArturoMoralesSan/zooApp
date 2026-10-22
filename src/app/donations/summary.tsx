import { HeartAddIcon, ShieldCheckIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import {
	ActivityIndicator,
	ImageBackground,
	ScrollView,
	Text,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import BackButton from '@/components/BackButton'
import FixedFooter from '@/components/FixedFooter'
import UserHeader from '@/components/UserHeader'
import { api } from '@/services/api'
import { getToken } from '@/services/auth'

import {
	amountIconStyle,
	backgroundImageStyle,
	backgroundStyle,
	bottomSpaceStyle,
	containerStyle,
	detailCardStyle,
	detailTitleStyle,
	detailValueStyle,
	errorCardStyle,
	errorTextStyle,
	paymentSelectedStyle,
	scrollContentStyle,
	sectionTitleStyle,
	securityCardStyle,
	securityContentStyle,
	securityIconStyle,
	securityTextStyle,
	securityTitleStyle,
	separatorStyle,
	thanksCardStyle,
	thanksTextStyle,
	thanksTitleStyle,
} from '@/styles/donation-summary'

const COLORS = {
	primary: '#08783F',
	dark: '#102E20',
	muted: '#315744',
} as const

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

	const formatCurrency = (value: number) =>
		new Intl.NumberFormat('es-MX', {
			style: 'currency',
			currency: 'MXN',
			minimumFractionDigits: 2,
		}).format(value)

	const confirmDonation = async () => {
		if (loading) return

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
		} catch (err: unknown) {
			console.error('Error al crear donación:', err)

			const message =
				err instanceof Error
					? err.message
					: 'No fue posible registrar la donación. Inténtalo nuevamente.'

			setError(message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<SafeAreaView style={containerStyle} edges={['top', 'left', 'right']}>
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				style={backgroundStyle}
				imageStyle={backgroundImageStyle}
				resizeMode='repeat'
			>
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={[scrollContentStyle, { paddingBottom: 190 }]}
					keyboardShouldPersistTaps='handled'
				>
					{/* BOTÓN REGRESAR */}
					<BackButton position='relative' onPress={() => router.back()} />

					{/* ENCABEZADO */}
					<View style={{ marginTop: 1 }}>
						<UserHeader
							title='Resumen de donación'
							subtitle='Revisa los datos antes de continuar con tu aportación.'
							showRewards={false}
						/>
					</View>

					{/* DONACIÓN Y DETALLE DEL PAGO */}
					<View style={detailCardStyle}>
						<View
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								gap: 14,
								paddingBottom: 18,
							}}
						>
							<View style={amountIconStyle}>
								<HugeiconsIcon
									icon={HeartAddIcon}
									size={28}
									color={COLORS.primary}
									strokeWidth={1.8}
								/>
							</View>

							<View style={{ flex: 1, minWidth: 0 }}>
								<Text
									style={{
										fontSize: 17,
										fontWeight: '900',
										color: COLORS.dark,
									}}
								>
									Donación
								</Text>

								<Text
									style={{
										marginTop: 4,
										fontSize: 12,
										lineHeight: 17,
										color: COLORS.muted,
									}}
								>
									Aportación para el Zoológico Sahuatoba
								</Text>
							</View>
						</View>

						<View style={separatorStyle} />

						<Text
							style={[
								sectionTitleStyle,
								{
									marginTop: 14,
									textTransform: 'uppercase',
									letterSpacing: 0.7,
								},
							]}
						>
							DETALLE DEL PAGO
						</Text>

						<View
							style={{
								minHeight: 44,
								flexDirection: 'row',
								alignItems: 'center',
								justifyContent: 'space-between',
								gap: 12,
							}}
						>
							<Text style={[detailTitleStyle, { flex: 1 }]}>
								Aportación voluntaria
							</Text>

							<Text
								style={detailValueStyle}
								numberOfLines={1}
								adjustsFontSizeToFit
							>
								{formatCurrency(amount)}
							</Text>
						</View>

						<View style={separatorStyle} />

						<View
							style={{
								minHeight: 44,
								flexDirection: 'row',
								alignItems: 'center',
								justifyContent: 'space-between',
								gap: 12,
							}}
						>
							<Text style={[detailTitleStyle, { flex: 1 }]}>
								Método de pago
							</Text>

							<Text style={paymentSelectedStyle}>Tarjeta</Text>
						</View>
					</View>

					{/* PAGO SEGURO */}
					<View style={securityCardStyle}>
						<View style={securityIconStyle}>
							<HugeiconsIcon
								icon={ShieldCheckIcon}
								size={25}
								color='#FFFFFF'
								strokeWidth={2}
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

					{/* AGRADECIMIENTO */}
					<View style={thanksCardStyle}>
						<Text style={thanksTitleStyle}>
							Gracias por apoyar al zoológico
						</Text>

						<Text style={thanksTextStyle}>
							Tu aportación ayuda al cuidado de los animales, mantenimiento de
							sus espacios y conservación de nuestra fauna.
						</Text>
					</View>

					{/* MENSAJE DE ERROR */}
					{error && (
						<View style={errorCardStyle}>
							<Text style={errorTextStyle}>{error}</Text>
						</View>
					)}

					<View style={bottomSpaceStyle} />
				</ScrollView>

				{/* FOOTER FIJO */}
				{loading ? (
					<View
						style={{
							position: 'absolute',
							bottom: 0,
							left: 0,
							right: 0,
							backgroundColor: '#FFFFFF',
							borderTopWidth: 1,
							borderTopColor: '#BDCCC3',
							paddingHorizontal: 20,
							paddingTop: 20,
							paddingBottom: 28,
							alignItems: 'center',
							justifyContent: 'center',
							flexDirection: 'row',
							gap: 10,
							elevation: 15,
							zIndex: 999,
						}}
					>
						<ActivityIndicator size='small' color={COLORS.primary} />
						<Text
							style={{
								color: COLORS.primary,
								fontWeight: '800',
							}}
						>
							Registrando donación...
						</Text>
					</View>
				) : (
					<FixedFooter
						label='Total a donar'
						description='Incluye todo el monto de tu donación'
						amount={formatCurrency(amount)}
						buttonTitle='Confirmar donación'
						onButtonPress={confirmDonation}
						disabled={amount < 10}
					/>
				)}
			</ImageBackground>
		</SafeAreaView>
	)
}
