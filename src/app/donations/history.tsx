import { api } from '@/services/api'
import { getToken } from '@/services/auth'

import { CreditCardIcon, HeartAddIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	ImageBackground,
	Pressable,
	ScrollView,
	Text,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import BackButton from '@/components/BackButton'
import UserHeader from '@/components/UserHeader'

import {
	backgroundImageStyle,
	backgroundStyle,
	buyButtonStyle,
	buyButtonTextStyle,
	cardShadow,
	colors,
	containerStyle,
	dividerStyle,
	donationAmountStyle,
	donationCardStyle,
	donationDateStyle,
	donationHeaderStyle,
	donationIconStyle,
	donationInfoStyle,
	donationTimeStyle,
	donationsListStyle,
	emptyCardStyle,
	emptyIconStyle,
	emptyTextStyle,
	emptyTitleStyle,
	infoBlockStyle,
	infoLabelStyle,
	infoRowStyle,
	infoValueStyle,
	loadingContainerStyle,
	loadingTextStyle,
	paymentRowStyle,
	scrollContentStyle,
	sectionTitleStyle,
	statCardStyle,
	statsContainerStyle,
	statusBadgeStyle,
	statusTextStyle,
} from '@/styles/donation-history'

type PaymentMethod = {
	id?: number
	name?: string | null
}

type Donation = {
	id: number
	amount?: number | string | null
	status?: string | null
	reference?: string | null
	created_at?: string | null
	payment_method?: PaymentMethod | null
}

function getDonationStatus(donation: Donation): string {
	const status = String(donation.status ?? '').toLowerCase()

	switch (status) {
		case 'completed':
		case 'complete':
		case 'completada':
		case 'completado':
			return 'Completada'

		case 'pending':
		case 'pendiente':
			return 'Pendiente'

		case 'cancelled':
		case 'canceled':
		case 'cancelado':
		case 'cancelada':
			return 'Cancelada'

		case 'failed':
		case 'fallida':
		case 'fallido':
			return 'Fallida'

		default:
			return donation.status || 'Registrada'
	}
}

function getDonationStatusColors(donation: Donation) {
	const status = String(donation.status ?? '').toLowerCase()

	if (
		[
			'cancelled',
			'canceled',
			'cancelado',
			'cancelada',
			'failed',
			'fallida',
			'fallido',
		].includes(status)
	) {
		return {
			backgroundColor: colors.coralLight,
			color: '#06371c',
			borderColor: colors.border,
		}
	}

	if (status === 'pending' || status === 'pendiente') {
		return {
			backgroundColor: colors.orangeLight,
			color: '#06371c',
			borderColor: colors.border,
		}
	}

	return {
		backgroundColor: '#b8f45d',
		color: '#06371c',
		borderColor: colors.border,
	}
}

function formatAmount(amount?: number | string | null): string {
	const value = Number(amount ?? 0)

	if (!Number.isFinite(value)) {
		return '$0.00'
	}

	return value.toLocaleString('es-MX', {
		style: 'currency',
		currency: 'MXN',
	})
}

function formatDate(date?: string | null): string {
	if (!date) {
		return 'Fecha no disponible'
	}

	const parsedDate = new Date(date)

	if (Number.isNaN(parsedDate.getTime())) {
		return 'Fecha no disponible'
	}

	return parsedDate.toLocaleDateString('es-MX', {
		day: '2-digit',
		month: 'long',
		year: 'numeric',
	})
}

function formatTime(date?: string | null): string {
	if (!date) {
		return ''
	}

	const parsedDate = new Date(date)

	if (Number.isNaN(parsedDate.getTime())) {
		return ''
	}

	return parsedDate.toLocaleTimeString('es-MX', {
		hour: '2-digit',
		minute: '2-digit',
	})
}

function isCompleted(donation: Donation): boolean {
	return ['completed', 'complete', 'completada', 'completado'].includes(
		String(donation.status ?? '').toLowerCase(),
	)
}

export default function DonationHistoryScreen() {
	const router = useRouter()

	const [donations, setDonations] = useState<Donation[]>([])
	const [loading, setLoading] = useState(true)

	const loadDonations = useCallback(async () => {
		try {
			setLoading(true)

			const token = await getToken()

			if (!token) {
				router.replace('/login')
				return
			}

			const response = await api<any>('/donations', {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			let result: unknown = response?.data ?? response

			if (result && typeof result === 'object' && !Array.isArray(result)) {
				const payload = result as {
					data?: unknown
					donations?: unknown
				}

				if (Array.isArray(payload.data)) {
					result = payload.data
				} else if (Array.isArray(payload.donations)) {
					result = payload.donations
				}
			}

			setDonations(Array.isArray(result) ? (result as Donation[]) : [])
		} catch (error) {
			console.error('Error cargando donaciones:', error)

			Alert.alert(
				'Mis donaciones',
				error instanceof Error
					? error.message
					: 'No fue posible cargar tus donaciones.',
			)

			setDonations([])
		} finally {
			setLoading(false)
		}
	}, [router])

	useEffect(() => {
		void loadDonations()
	}, [loadDonations])

	const sortedDonations = useMemo(() => {
		return [...donations].sort((a, b) => {
			const dateA = a.created_at ? new Date(a.created_at).getTime() : 0

			const dateB = b.created_at ? new Date(b.created_at).getTime() : 0

			return dateB - dateA
		})
	}, [donations])

	const completedDonations = useMemo(
		() => donations.filter(isCompleted).length,
		[donations],
	)

	const totalDonated = useMemo(
		() =>
			donations.reduce((total, donation) => {
				const amount = Number(donation.amount ?? 0)

				return total + (Number.isFinite(amount) ? amount : 0)
			}, 0),
		[donations],
	)

	return (
		<SafeAreaView style={containerStyle} edges={['top', 'left', 'right']}>
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				style={backgroundStyle}
				resizeMode='repeat'
				imageStyle={backgroundImageStyle}
			>
				{/* Encabezado */}
				<View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
					<View style={{ marginBottom: 12 }}>
						<BackButton onPress={() => router.back()} position='relative' />
					</View>

					<View style={{ marginBottom: 20 }}>
						<UserHeader
							title='Mis donaciones'
							subtitle='Consulta el historial de tus donaciones.'
							showRewards={false}
						/>
					</View>
				</View>

				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={scrollContentStyle}
				>
					{/* Estadísticas */}
					<View style={statsContainerStyle}>
						<View style={statCardStyle}>
							<Text style={styles.statNumber}>{donations.length}</Text>
							<Text style={styles.statLabel}>Donaciones</Text>
						</View>

						<View style={statCardStyle}>
							<Text style={styles.statNumber}>{completedDonations}</Text>
							<Text style={styles.statLabel}>Completadas</Text>
						</View>

						<View style={[statCardStyle, { flex: 1.25 }]}>
							<Text
								style={[styles.statNumber, { fontSize: 16 }]}
								numberOfLines={1}
								adjustsFontSizeToFit
								minimumFontScale={0.7}
							>
								{formatAmount(totalDonated)}
							</Text>
							<Text style={styles.statLabel}>Total donado</Text>
						</View>
					</View>

					{/* Cargando */}
					{loading ? (
						<View style={loadingContainerStyle}>
							<ActivityIndicator size='large' color={colors.primary} />
							<Text style={loadingTextStyle}>Cargando tus donaciones...</Text>
						</View>
					) : sortedDonations.length === 0 ? (
						/* Estado vacío */
						<View style={emptyCardStyle}>
							<View style={emptyIconStyle}>
								<HugeiconsIcon
									icon={HeartAddIcon}
									size={32}
									strokeWidth={1.8}
									color={colors.primary}
								/>
							</View>

							<Text style={emptyTitleStyle}>No tienes donaciones</Text>

							<Text style={emptyTextStyle}>
								Cuando realices una donación aparecerá aquí.
							</Text>

							<Pressable
								onPress={() => router.push('/donations')}
								style={({ pressed }) => [
									buyButtonStyle,
									{
										marginTop: 18,
										backgroundColor: pressed
											? colors.buttonPressed
											: colors.button,
									},
								]}
							>
								<Text style={buyButtonTextStyle}>Hacer una donación</Text>
							</Pressable>
						</View>
					) : (
						/* Historial */
						<View style={donationsListStyle}>
							<Text style={sectionTitleStyle}>Historial</Text>

							{sortedDonations.map((donation) => {
								const statusColors = getDonationStatusColors(donation)

								return (
									<View
										key={donation.id}
										style={[donationCardStyle, cardShadow]}
									>
										<View style={donationHeaderStyle}>
											<View style={donationIconStyle}>
												<HugeiconsIcon
													icon={HeartAddIcon}
													size={25}
													strokeWidth={1.8}
													color={colors.primary}
												/>
											</View>

											<View style={donationInfoStyle}>
												<Text style={donationAmountStyle}>
													{formatAmount(donation.amount)}
												</Text>

												<Text style={donationDateStyle}>
													{formatDate(donation.created_at)}
												</Text>

												{formatTime(donation.created_at) ? (
													<Text style={donationTimeStyle}>
														{formatTime(donation.created_at)}
													</Text>
												) : null}
											</View>

											<View
												style={[
													statusBadgeStyle,
													{
														backgroundColor: statusColors.backgroundColor,
														borderColor: statusColors.borderColor,
													},
												]}
											>
												<Text
													style={[
														statusTextStyle,
														{
															color: statusColors.color,
														},
													]}
												>
													{getDonationStatus(donation)}
												</Text>
											</View>
										</View>

										<View style={dividerStyle} />

										{/* Método de pago y referencia */}
										<View style={infoRowStyle}>
											<View style={infoBlockStyle}>
												<Text style={infoLabelStyle}>Método de pago</Text>

												<View style={paymentRowStyle}>
													<HugeiconsIcon
														icon={CreditCardIcon}
														size={17}
														strokeWidth={1.8}
														color={colors.primary}
													/>

													<Text style={infoValueStyle} numberOfLines={2}>
														{donation.payment_method?.name ?? 'No especificado'}
													</Text>
												</View>
											</View>

											<View style={infoBlockStyle}>
												<Text style={infoLabelStyle}>Referencia</Text>

												<Text
													style={[
														infoValueStyle,
														{
															marginTop: 6,
															marginLeft: 0,
														},
													]}
													numberOfLines={2}
												>
													{donation.reference || 'No disponible'}
												</Text>
											</View>
										</View>
									</View>
								)
							})}
						</View>
					)}

					<View style={{ height: 30 }} />
				</ScrollView>
			</ImageBackground>
		</SafeAreaView>
	)
}

const styles = {
	statNumber: {
		fontSize: 21,
		fontWeight: '800' as const,
		color: colors.primary,
		textAlign: 'center' as const,
	},
	statLabel: {
		marginTop: 6,
		fontSize: 11,
		fontWeight: '500' as const,
		color: colors.muted,
		textAlign: 'center' as const,
	},
}
