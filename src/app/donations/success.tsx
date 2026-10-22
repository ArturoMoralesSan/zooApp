import { CheckmarkCircle02Icon, StarIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useMemo } from 'react'
import { ImageBackground, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import BackButton from '@/components/BackButton'
import FixedFooter from '@/components/FixedFooter'
import UserHeader from '@/components/UserHeader'
import { COLORS, styles } from '@/styles/donation-success'

type PaymentMethodData = {
	id?: number | string
	name?: string | null
	code?: string | null
}

type DonationData = {
	id?: number | string | null
	amount?: number | string | null
	payment_method?: string | PaymentMethodData | null
	paymentMethod?: string | PaymentMethodData | null
	status?: string | null
	created_at?: string | null
	createdAt?: string | null
	reference?: string | null
	folio?: string | null
}

function formatCurrency(value: number | string | null | undefined) {
	const amount = Number(value ?? 0)

	return new Intl.NumberFormat('es-MX', {
		style: 'currency',
		currency: 'MXN',
		minimumFractionDigits: 2,
	}).format(Number.isFinite(amount) ? amount : 0)
}

function getPaymentMethod(
	method: string | PaymentMethodData | null | undefined,
) {
	if (!method) return 'Tarjeta'

	if (typeof method === 'string') return method

	return method.name || method.code || 'Tarjeta'
}

export default function DonationSuccessScreen() {
	const params = useLocalSearchParams<{
		donation?: string
		amount?: string
		id?: string
		folio?: string
		reference?: string
	}>()

	const donation = useMemo<DonationData>(() => {
		if (params.donation) {
			try {
				const parsed = JSON.parse(params.donation)

				if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
					return parsed as DonationData
				}
			} catch {
				// Si el parámetro no es JSON válido, usamos los parámetros individuales.
			}
		}

		return {
			amount: params.amount,
			id: params.id,
			folio: params.folio,
			reference: params.reference,
		}
	}, [
		params.donation,
		params.amount,
		params.id,
		params.folio,
		params.reference,
	])

	const amount = donation.amount ?? params.amount ?? 0

	const donationReference =
		donation.folio ||
		donation.reference ||
		donation.id ||
		params.folio ||
		params.reference ||
		params.id ||
		'Registrada correctamente'

	const paymentMethod = getPaymentMethod(
		donation.payment_method ?? donation.paymentMethod,
	)

	const handleGoHome = () => {
		router.replace('/')
	}

	return (
		<SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				style={styles.background}
				imageStyle={styles.backgroundImage}
				resizeMode='repeat'
			>
				<ScrollView
					style={styles.scrollView}
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
				>
					<View style={styles.headerContainer}>
						<BackButton position='relative' onPress={() => router.back()} />

						<UserHeader
							title='Donación realizada'
							subtitle='Gracias por apoyar el cuidado de las especies.'
							showRewards={false}
						/>
					</View>

					{/* CONFIRMACIÓN DE DONACIÓN */}
					<View style={styles.successCard}>
						<View style={styles.successIconContainer}>
							<HugeiconsIcon
								icon={CheckmarkCircle02Icon}
								size={46}
								color={COLORS.successIcon}
							/>
						</View>

						<Text style={styles.successTitle}>¡Donación realizada!</Text>

						<Text style={styles.successDescription}>
							Gracias por apoyar al Zoológico Sahuatoba.
						</Text>
					</View>

					{/* MONTO DONADO Y DETALLE */}
					<View style={styles.amountCard}>
						<View style={styles.amountHeader}>
							<Text style={styles.amountLabel}>Monto donado</Text>
						</View>

						<Text style={styles.amountValue}>{formatCurrency(amount)}</Text>

						<View style={styles.detailDivider} />

						<View style={styles.sectionHeading}>
							<Text style={styles.sectionTitle}>Detalle de la donación</Text>
						</View>

						<View style={styles.detailRow}>
							<Text style={styles.detailLabel}>Donación</Text>

							<Text style={styles.detailValue} numberOfLines={1}>
								Aportación al zoológico
							</Text>
						</View>

						<View style={styles.detailDivider} />

						<View style={styles.detailRow}>
							<Text style={styles.detailLabel}>Método de pago</Text>

							<Text style={styles.detailValue} numberOfLines={1}>
								{paymentMethod}
							</Text>
						</View>

						<View style={styles.detailDivider} />

						<View style={styles.detailRow}>
							<Text style={styles.detailLabel}>Folio</Text>

							<Text style={styles.detailValue} numberOfLines={1} selectable>
								#{String(donationReference).replace(/^#/, '')}
							</Text>
						</View>
					</View>

					{/* AGRADECIMIENTO */}
					<View style={styles.thanksInfoCard}>
						<View style={styles.thanksInfoIconContainer}>
							<HugeiconsIcon icon={StarIcon} size={24} color={COLORS.white} />
						</View>

						<View style={styles.thanksInfoContent}>
							<Text style={styles.thanksInfoTitle}>¡Tu apoyo cuenta!</Text>

							<Text style={styles.thanksInfoDescription}>
								Gracias a personas como tú podemos seguir trabajando en el
								bienestar de los animales y en la conservación de nuestra fauna.
							</Text>
						</View>
					</View>

					<View style={styles.bottomSpace} />
				</ScrollView>

				{/* FOOTER FIJO */}
				<FixedFooter
					label='Donación confirmada'
					description='Gracias por tu aportación'
					amount={formatCurrency(amount)}
					buttonTitle='Ir al inicio'
					onButtonPress={handleGoHome}
				/>
			</ImageBackground>
		</SafeAreaView>
	)
}
