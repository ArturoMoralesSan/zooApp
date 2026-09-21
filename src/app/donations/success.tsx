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
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native'

const COLORS = {
	background: '#F7F9F8',

	primary: '#075C3B',
	primaryLight: '#16845D',
	dark: '#17372C',
	muted: '#557067',

	card: '#DDF5EA',
	cardLight: '#E8F7F0',
	active: '#BDEED9',
	border: '#B8E6D3',
	white: '#FFFFFF',

	button: '#246F4C',
	buttonPressed: '#1D5C3F',

	footerBackground: '#F7F9F8',
}

const cardShadow = {
	shadowColor: '#075C3B',
	shadowOffset: {
		width: 0,
		height: 5,
	},
	shadowOpacity: 0.12,
	shadowRadius: 10,
	elevation: 4,
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
		<SafeAreaView style={styles.container}>
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				style={styles.background}
				resizeMode='repeat'
				imageStyle={styles.backgroundImage}
			>
				<View style={styles.header}>
					<View style={styles.backButtonWrapper}>
						<Pressable
							onPress={() => router.back()}
							style={({ pressed }) => [
								styles.backButton,
								pressed && styles.backButtonPressed,
							]}
						>
							<Text style={styles.backText}>‹ Regresar</Text>
						</Pressable>
					</View>

					<View style={styles.headerText}>
						<Text style={styles.title}>¡Donación realizada!</Text>

						<Text style={styles.subtitle}>
							Gracias por apoyar al Zoológico Sahuatoba
						</Text>
					</View>
				</View>

				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.scrollContent}
				>
					{/* ÉXITO */}
					<View style={[styles.successCard, cardShadow]}>
						<View style={styles.successIcon}>
							<HugeiconsIcon
								icon={CheckmarkCircle02Icon}
								size={56}
								strokeWidth={1.8}
								color={COLORS.primary}
							/>
						</View>

						<Text style={styles.successTitle}>¡Gracias por tu donación!</Text>

						<Text style={styles.successText}>
							Tu aportación se realizó correctamente y ayudará al cuidado de los
							animales y a la conservación del zoológico.
						</Text>
					</View>

					{/* MONTO */}
					<View style={[styles.amountCard, cardShadow]}>
						<View style={styles.amountIcon}>
							<HugeiconsIcon
								icon={HeartAddIcon}
								size={29}
								strokeWidth={1.8}
								color={COLORS.primary}
							/>
						</View>

						<View style={styles.amountInfo}>
							<Text style={styles.amountLabel}>Monto donado</Text>

							<Text
								style={styles.amount}
								numberOfLines={1}
								adjustsFontSizeToFit
							>
								${amount.toFixed(2)}
							</Text>
						</View>
					</View>

					<Text style={styles.sectionTitle}>Detalle de la donación</Text>

					{/* DETALLE */}
					<View style={[styles.detailCard, cardShadow]}>
						{/* DONACIÓN */}
						<View style={styles.detailRow}>
							<View style={styles.detailLeft}>
								<View style={styles.detailIcon}>
									<HugeiconsIcon
										icon={HeartAddIcon}
										size={20}
										strokeWidth={1.8}
										color={COLORS.primary}
									/>
								</View>

								<View style={styles.detailTextContainer}>
									<Text style={styles.detailTitle}>Donación</Text>

									<Text style={styles.detailDescription}>
										Aportación al zoológico
									</Text>
								</View>
							</View>

							<Text style={styles.detailValue}>${amount.toFixed(2)}</Text>
						</View>

						<View style={styles.separator} />

						{/* MÉTODO DE PAGO */}
						<View style={styles.detailRow}>
							<View style={styles.detailLeft}>
								<View style={styles.detailIcon}>
									<HugeiconsIcon
										icon={CreditCardIcon}
										size={20}
										strokeWidth={1.8}
										color={COLORS.primary}
									/>
								</View>

								<View style={styles.detailTextContainer}>
									<Text style={styles.detailTitle}>Método de pago</Text>

									<Text style={styles.detailDescription}>Pago con tarjeta</Text>
								</View>
							</View>

							<Text style={styles.paymentValue}>Tarjeta</Text>
						</View>

						{/* FOLIO */}
						{donationId !== null ? (
							<>
								<View style={styles.separator} />

								<View style={styles.detailRow}>
									<View style={styles.detailLeft}>
										<View style={styles.detailIcon}>
											<Text style={styles.receiptIconText}>#</Text>
										</View>

										<View style={styles.detailTextContainer}>
											<Text style={styles.detailTitle}>Folio</Text>

											<Text style={styles.detailDescription}>
												Comprobante de donación
											</Text>
										</View>
									</View>

									<Text style={styles.folio}>#{donationId}</Text>
								</View>
							</>
						) : null}
					</View>

					{/* INFORMACIÓN */}
					<View style={styles.infoBox}>
						<View style={styles.infoIcon}>
							<Text style={styles.infoIconText}>✓</Text>
						</View>

						<View style={styles.infoContent}>
							<Text style={styles.infoTitle}>¡Tu apoyo cuenta!</Text>

							<Text style={styles.infoText}>
								Gracias a personas como tú podemos seguir trabajando en el
								bienestar de los animales y en la conservación de nuestra fauna.
							</Text>
						</View>
					</View>

					{/* AGRADECIMIENTO */}
					<View style={styles.thanksCard}>
						<View style={styles.thanksIcon}>
							<HugeiconsIcon
								icon={HeartAddIcon}
								size={23}
								strokeWidth={1.8}
								color={COLORS.primary}
							/>
						</View>

						<View style={styles.thanksContent}>
							<Text style={styles.thanksTitle}>
								Gracias por ser parte de esta causa
							</Text>

							<Text style={styles.thanksText}>
								Tu donación se suma a los esfuerzos para mantener y mejorar los
								espacios del Zoológico Sahuatoba.
							</Text>
						</View>
					</View>

					<View style={styles.bottomSpace} />
				</ScrollView>

				{/* FOOTER */}
				<View style={styles.footer}>
					<View style={styles.footerInfo}>
						<View>
							<Text style={styles.footerLabel}>Donación confirmada</Text>

							<Text style={styles.footerDescription}>
								Gracias por tu aportación
							</Text>
						</View>

						<Text
							style={styles.footerAmount}
							numberOfLines={1}
							adjustsFontSizeToFit
						>
							${amount.toFixed(2)}
						</Text>
					</View>

					<View style={styles.homeButtonWrapper}>
						<Pressable
							onPress={() => router.replace('/')}
							style={({ pressed }) => [
								styles.homeButton,
								pressed && styles.homeButtonPressed,
							]}
						>
							<View style={styles.homeButtonContent}>
								<HugeiconsIcon
									icon={Home01Icon}
									size={21}
									strokeWidth={1.8}
									color={COLORS.white}
								/>

								<Text style={styles.homeButtonText}>Ir al inicio</Text>
							</View>
						</Pressable>
					</View>
				</View>
			</ImageBackground>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
	},

	background: {
		flex: 1,
	},

	backgroundImage: {
		opacity: 0.3,
	},

	header: {
		paddingHorizontal: 20,
		paddingTop: 55,
		paddingBottom: 16,
		alignItems: 'flex-start',
	},

	backButtonWrapper: {
		alignSelf: 'flex-start',
	},

	backButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(247,249,248,0.94)',
		borderWidth: 1,
		borderColor: COLORS.border,
		borderRadius: 18,
		paddingHorizontal: 16,
		paddingVertical: 10,
		...cardShadow,
	},

	backButtonPressed: {
		opacity: 0.75,
		backgroundColor: COLORS.card,
	},

	backText: {
		fontSize: 15,
		fontWeight: '700',
		color: COLORS.dark,
	},

	headerText: {
		width: '100%',
		marginTop: 17,
	},

	title: {
		fontSize: 27,
		fontWeight: '900',
		color: COLORS.dark,
	},

	subtitle: {
		marginTop: 4,
		fontSize: 14,
		lineHeight: 20,
		color: COLORS.muted,
	},

	scrollContent: {
		paddingHorizontal: 20,
		paddingBottom: 190,
		alignItems: 'center',
	},

	successCard: {
		width: '100%',
		backgroundColor: COLORS.cardLight,
		borderRadius: 25,
		padding: 20,
		marginBottom: 15,
		borderWidth: 1,
		borderColor: COLORS.border,
		alignItems: 'center',
	},

	successIcon: {
		width: 82,
		height: 82,
		borderRadius: 28,
		backgroundColor: COLORS.active,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: COLORS.border,
		marginBottom: 14,
	},

	successTitle: {
		fontSize: 23,
		fontWeight: '900',
		color: COLORS.dark,
		textAlign: 'center',
	},

	successText: {
		marginTop: 7,
		fontSize: 13,
		lineHeight: 19,
		color: COLORS.muted,
		textAlign: 'center',
		maxWidth: 340,
	},

	amountCard: {
		width: '100%',
		backgroundColor: COLORS.cardLight,
		borderRadius: 25,
		padding: 18,
		marginBottom: 20,
		borderWidth: 1,
		borderColor: COLORS.border,
		flexDirection: 'row',
		alignItems: 'center',
	},

	amountIcon: {
		width: 58,
		height: 58,
		borderRadius: 19,
		backgroundColor: COLORS.active,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: COLORS.border,
		marginRight: 14,
	},

	amountInfo: {
		flex: 1,
		minWidth: 0,
	},

	amountLabel: {
		fontSize: 13,
		fontWeight: '800',
		color: COLORS.muted,
	},

	amount: {
		marginTop: 2,
		fontSize: 30,
		lineHeight: 37,
		fontWeight: '900',
		color: COLORS.primary,
		maxWidth: '95%',
	},

	sectionTitle: {
		width: '100%',
		marginBottom: 12,
		fontSize: 16,
		fontWeight: '900',
		color: COLORS.dark,
	},

	detailCard: {
		width: '100%',
		backgroundColor: COLORS.cardLight,
		borderRadius: 25,
		padding: 17,
		marginBottom: 15,
		borderWidth: 1,
		borderColor: COLORS.border,
	},

	detailRow: {
		minHeight: 58,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},

	detailLeft: {
		flex: 1,
		minWidth: 0,
		flexDirection: 'row',
		alignItems: 'center',
		marginRight: 10,
	},

	detailIcon: {
		width: 43,
		height: 43,
		borderRadius: 14,
		backgroundColor: COLORS.active,
		borderWidth: 1,
		borderColor: COLORS.border,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 11,
	},

	receiptIconText: {
		fontSize: 20,
		fontWeight: '900',
		color: COLORS.primary,
	},

	detailTextContainer: {
		flex: 1,
		minWidth: 0,
	},

	detailTitle: {
		fontSize: 14,
		fontWeight: '900',
		color: COLORS.dark,
	},

	detailDescription: {
		marginTop: 2,
		fontSize: 11,
		lineHeight: 16,
		color: COLORS.muted,
	},

	detailValue: {
		fontSize: 15,
		fontWeight: '900',
		color: COLORS.primary,
	},

	paymentValue: {
		fontSize: 13,
		fontWeight: '900',
		color: COLORS.primary,
	},

	folio: {
		fontSize: 14,
		fontWeight: '900',
		color: COLORS.dark,
	},

	separator: {
		height: 1,
		backgroundColor: COLORS.border,
		marginVertical: 7,
	},

	infoBox: {
		width: '100%',
		backgroundColor: '#F0F8F4',
		borderRadius: 20,
		padding: 16,
		marginBottom: 15,
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: COLORS.border,
	},

	infoIcon: {
		width: 38,
		height: 38,
		borderRadius: 13,
		backgroundColor: COLORS.white,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 12,
		borderWidth: 1,
		borderColor: COLORS.border,
	},

	infoIconText: {
		fontSize: 19,
		fontWeight: '900',
		color: COLORS.primary,
	},

	infoContent: {
		flex: 1,
		minWidth: 0,
	},

	infoTitle: {
		fontSize: 14,
		fontWeight: '900',
		color: COLORS.primary,
	},

	infoText: {
		marginTop: 4,
		fontSize: 12,
		lineHeight: 17,
		color: COLORS.muted,
	},

	thanksCard: {
		width: '100%',
		backgroundColor: COLORS.active,
		borderRadius: 20,
		padding: 16,
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: COLORS.border,
	},

	thanksIcon: {
		width: 42,
		height: 42,
		borderRadius: 14,
		backgroundColor: COLORS.white,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: COLORS.border,
	},

	thanksContent: {
		flex: 1,
		minWidth: 0,
		marginLeft: 11,
	},

	thanksTitle: {
		fontSize: 14,
		fontWeight: '900',
		color: COLORS.primary,
	},

	thanksText: {
		marginTop: 3,
		fontSize: 12,
		lineHeight: 17,
		color: COLORS.dark,
	},

	bottomSpace: {
		height: 40,
	},

	footer: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: COLORS.footerBackground,
		paddingHorizontal: 20,
		paddingTop: 14,
		paddingBottom: 25,
		borderTopWidth: 1,
		borderTopColor: COLORS.border,
		...cardShadow,
	},

	footerInfo: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 12,
	},

	footerLabel: {
		fontSize: 14,
		fontWeight: '800',
		color: COLORS.muted,
	},

	footerDescription: {
		marginTop: 2,
		fontSize: 11,
		color: COLORS.muted,
	},

	footerAmount: {
		fontSize: 23,
		fontWeight: '900',
		color: COLORS.primary,
		maxWidth: 140,
	},

	homeButtonWrapper: {
		width: '100%',
		height: 54,
		borderRadius: 17,
		backgroundColor: COLORS.button,
		borderWidth: 1,
		borderColor: COLORS.button,
		overflow: 'hidden',
		...cardShadow,
	},

	homeButton: {
		width: '100%',
		height: '100%',
		alignItems: 'center',
		justifyContent: 'center',
	},

	homeButtonContent: {
		width: '100%',
		height: '100%',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
	},

	homeButtonPressed: {
		backgroundColor: COLORS.buttonPressed,
	},

	homeButtonText: {
		color: COLORS.white,
		fontSize: 16,
		fontWeight: '900',
		textAlign: 'center',
	},
})
