import {
	ArrowRight01Icon,
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
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native'

import { api } from '@/services/api'
import { getToken } from '@/services/auth'

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
	shadowOffset: { width: 0, height: 5 },
	shadowOpacity: 0.12,
	shadowRadius: 10,
	elevation: 4,
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
		<SafeAreaView style={styles.container}>
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				style={styles.background}
				className='flex-1'
				resizeMode='repeat'
				imageStyle={{ opacity: 0.3 }}
			>
				<View style={styles.backButtonWrapper}>
					<Pressable
						onPress={() => router.back()}
						disabled={loading}
						className='flex-row items-center rounded-[18px] px-4 py-2.5'
						style={({ pressed }) => ({
							backgroundColor: pressed ? COLORS.card : COLORS.cardLight,
							borderWidth: 1,
							borderColor: COLORS.border,
							shadowColor: COLORS.primary,
							shadowOffset: { width: 0, height: 3 },
							shadowOpacity: 0.1,
							shadowRadius: 7,
							elevation: 3,
							opacity: loading ? 0.5 : pressed ? 0.75 : 1,
						})}
					>
						<Text
							className='mr-1 text-lg font-bold'
							style={{ color: COLORS.primary }}
						>
							‹
						</Text>

						<Text
							className='text-base font-semibold'
							style={{ color: COLORS.dark }}
						>
							Regresar
						</Text>
					</Pressable>
				</View>

				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.scrollContent}
				>
					<View style={styles.header}>
						<View style={styles.titleRow}>
							<View style={styles.titleIcon}>
								<HugeiconsIcon
									icon={HeartAddIcon}
									size={27}
									color={COLORS.primary}
									strokeWidth={1.8}
								/>
							</View>

							<View style={styles.titleTextContainer}>
								<Text style={styles.title}>Resumen de donación</Text>

								<Text style={styles.subtitle}>
									Revisa los datos antes de continuar con tu aportación.
								</Text>
							</View>
						</View>
					</View>

					<View style={styles.amountCard}>
						<View style={styles.amountIcon}>
							<HugeiconsIcon
								icon={HeartAddIcon}
								size={30}
								color={COLORS.primary}
								strokeWidth={1.8}
							/>
						</View>

						<Text style={styles.amountLabel}>Donación</Text>

						<Text style={styles.amount} numberOfLines={1} adjustsFontSizeToFit>
							${amount.toFixed(2)}
						</Text>

						<Text style={styles.amountDescription}>
							Aportación para el Zoológico Sahuatoba
						</Text>
					</View>

					<Text style={styles.sectionTitle}>Detalle del pago</Text>

					<View style={styles.detailCard}>
						<View style={styles.detailRow}>
							<View style={styles.detailLeft}>
								<View style={styles.detailIcon}>
									<HugeiconsIcon
										icon={HeartAddIcon}
										size={20}
										color={COLORS.primary}
										strokeWidth={1.8}
									/>
								</View>

								<View style={styles.detailTextContainer}>
									<Text style={styles.detailTitle}>Donación</Text>

									<Text style={styles.detailDescription}>
										Aportación voluntaria
									</Text>
								</View>
							</View>

							<Text style={styles.detailValue}>${amount.toFixed(2)}</Text>
						</View>

						<View style={styles.separator} />

						<View style={styles.detailRow}>
							<View style={styles.detailLeft}>
								<View style={styles.detailIcon}>
									<HugeiconsIcon
										icon={CreditCardIcon}
										size={20}
										color={COLORS.primary}
										strokeWidth={1.8}
									/>
								</View>

								<View style={styles.detailTextContainer}>
									<Text style={styles.detailTitle}>Método de pago</Text>

									<Text style={styles.detailDescription}>Pago con tarjeta</Text>
								</View>
							</View>

							<Text style={styles.paymentSelected}>Tarjeta</Text>
						</View>
					</View>

					<View style={styles.securityCard}>
						<View style={styles.securityIcon}>
							<HugeiconsIcon
								icon={ShieldCheckIcon}
								size={25}
								color={COLORS.primary}
								strokeWidth={1.8}
							/>
						</View>

						<View style={styles.securityContent}>
							<Text style={styles.securityTitle}>Pago seguro</Text>

							<Text style={styles.securityText}>
								Tu información de pago será procesada de forma segura mediante
								nuestro proveedor de pagos.
							</Text>
						</View>
					</View>

					<View style={styles.thanksCard}>
						<Text style={styles.thanksTitle}>
							Gracias por apoyar al zoológico 💚
						</Text>

						<Text style={styles.thanksText}>
							Tu aportación ayuda al cuidado de los animales, mantenimiento de
							sus espacios y conservación de nuestra fauna.
						</Text>
					</View>

					{error && (
						<View style={styles.errorCard}>
							<Text style={styles.errorText}>{error}</Text>
						</View>
					)}

					<View style={styles.bottomSpace} />
				</ScrollView>

				<View style={styles.footer}>
					<View style={styles.totalContainer}>
						<View style={styles.totalInfo}>
							<Text style={styles.totalLabel}>Total a donar</Text>

							<Text style={styles.totalDescription}>
								Incluye todo el monto de tu donación
							</Text>
						</View>

						<Text style={styles.total} numberOfLines={1} adjustsFontSizeToFit>
							${amount.toFixed(2)}
						</Text>
					</View>

					<View
						style={[
							styles.confirmButtonWrapper,
							amount < 10 && styles.confirmButtonDisabled,
							loading && styles.confirmButtonLoading,
						]}
					>
						<Pressable
							disabled={amount < 10 || loading}
							onPress={confirmDonation}
							style={({ pressed }) => [
								styles.confirmButton,
								pressed &&
									amount >= 10 &&
									!loading &&
									styles.confirmButtonPressed,
							]}
						>
							<View style={styles.confirmButtonContent}>
								{loading ? (
									<>
										<ActivityIndicator size='small' color={COLORS.white} />

										<Text style={styles.confirmButtonText}>
											Registrando donación...
										</Text>
									</>
								) : (
									<>
										<Text style={styles.confirmButtonText}>
											Confirmar donación
										</Text>

										<HugeiconsIcon
											icon={ArrowRight01Icon}
											size={21}
											color={COLORS.white}
											strokeWidth={2}
										/>
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

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
	},

	background: {
		flex: 1,
	},

	backButtonWrapper: {
		position: 'absolute',
		left: 20,
		top: 56,
		zIndex: 20,
	},

	scrollContent: {
		paddingHorizontal: 20,
		paddingTop: 125,
		paddingBottom: 180,
	},

	header: {
		marginBottom: 20,
	},

	titleRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},

	titleIcon: {
		width: 52,
		height: 52,
		borderRadius: 17,
		backgroundColor: COLORS.active,
		borderWidth: 1,
		borderColor: COLORS.border,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 13,
	},

	titleTextContainer: {
		flex: 1,
		minWidth: 0,
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

	amountCard: {
		width: '100%',
		backgroundColor: COLORS.cardLight,
		borderRadius: 25,
		padding: 22,
		marginBottom: 21,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: COLORS.border,
		...cardShadow,
	},

	amountIcon: {
		width: 60,
		height: 60,
		borderRadius: 20,
		backgroundColor: COLORS.active,
		borderWidth: 1,
		borderColor: COLORS.border,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 12,
	},

	amountLabel: {
		fontSize: 14,
		fontWeight: '800',
		color: COLORS.muted,
	},

	amount: {
		marginTop: 3,
		fontSize: 38,
		lineHeight: 46,
		fontWeight: '900',
		color: COLORS.primary,
		maxWidth: '90%',
	},

	amountDescription: {
		marginTop: 5,
		fontSize: 12,
		color: COLORS.muted,
		textAlign: 'center',
	},

	sectionTitle: {
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
		marginBottom: 17,
		borderWidth: 1,
		borderColor: COLORS.border,
		...cardShadow,
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
		color: COLORS.muted,
	},

	detailValue: {
		fontSize: 15,
		fontWeight: '900',
		color: COLORS.primary,
	},

	paymentSelected: {
		fontSize: 13,
		fontWeight: '900',
		color: COLORS.primary,
	},

	separator: {
		height: 1,
		backgroundColor: COLORS.border,
		marginVertical: 7,
	},

	securityCard: {
		width: '100%',
		backgroundColor: COLORS.cardLight,
		borderRadius: 25,
		padding: 17,
		marginBottom: 17,
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: COLORS.border,
	},

	securityIcon: {
		width: 48,
		height: 48,
		borderRadius: 16,
		backgroundColor: COLORS.active,
		borderWidth: 1,
		borderColor: COLORS.border,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 13,
	},

	securityContent: {
		flex: 1,
		minWidth: 0,
	},

	securityTitle: {
		fontSize: 15,
		fontWeight: '900',
		color: COLORS.dark,
	},

	securityText: {
		marginTop: 3,
		fontSize: 12,
		lineHeight: 17,
		color: COLORS.muted,
	},

	thanksCard: {
		width: '100%',
		backgroundColor: COLORS.active,
		borderRadius: 25,
		padding: 17,
		borderWidth: 1,
		borderColor: COLORS.border,
	},

	thanksTitle: {
		fontSize: 15,
		fontWeight: '900',
		color: COLORS.primary,
	},

	thanksText: {
		marginTop: 5,
		fontSize: 12,
		lineHeight: 18,
		color: COLORS.dark,
	},

	errorCard: {
		width: '100%',
		backgroundColor: '#F8E1DE',
		borderRadius: 18,
		padding: 14,
		marginTop: 15,
		borderWidth: 1,
		borderColor: '#EABCB6',
	},

	errorText: {
		fontSize: 13,
		lineHeight: 18,
		fontWeight: '700',
		color: '#B74439',
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

	totalContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},

	totalInfo: {
		flex: 1,
		minWidth: 0,
		marginRight: 10,
	},

	totalLabel: {
		fontSize: 14,
		fontWeight: '800',
		color: COLORS.muted,
	},

	totalDescription: {
		marginTop: 2,
		fontSize: 11,
		color: COLORS.muted,
	},

	total: {
		fontSize: 23,
		fontWeight: '900',
		color: COLORS.primary,
		maxWidth: 150,
	},

	confirmButtonWrapper: {
		width: '100%',
		height: 54,
		borderRadius: 17,
		backgroundColor: COLORS.button,
		borderWidth: 1,
		borderColor: COLORS.button,
		overflow: 'hidden',
		...cardShadow,
	},

	confirmButtonDisabled: {
		opacity: 0.45,
	},

	confirmButtonLoading: {
		opacity: 0.8,
	},

	confirmButton: {
		width: '100%',
		height: '100%',
		alignItems: 'center',
		justifyContent: 'center',
	},

	confirmButtonContent: {
		width: '100%',
		height: '100%',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
	},

	confirmButtonPressed: {
		backgroundColor: COLORS.buttonPressed,
	},

	confirmButtonText: {
		color: COLORS.white,
		fontSize: 16,
		fontWeight: '900',
		textAlign: 'center',
	},
})
