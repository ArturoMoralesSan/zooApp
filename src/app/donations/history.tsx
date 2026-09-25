import { api } from '@/services/api'
import { getToken } from '@/services/auth'

import {
	CheckmarkCircle02Icon,
	CreditCardIcon,
	HeartAddIcon,
} from '@hugeicons/core-free-icons'

import { HugeiconsIcon } from '@hugeicons/react-native'
import { useRouter } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
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

import {
	backButtonStyle,
	backTextStyle,
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
	headerStyle,
	infoBlockStyle,
	infoLabelStyle,
	infoRowStyle,
	infoValueStyle,
	loadingContainerStyle,
	loadingTextStyle,
	paymentRowStyle,
	referenceContainerStyle,
	referenceInfoStyle,
	scrollContentStyle,
	sectionTitleStyle,
	statCardStyle,
	statIconStyle,
	statLabelStyle,
	statNumberStyle,
	statsContainerStyle,
	statusBadgeStyle,
	statusTextStyle,
	subtitleStyle,
	titleStyle,
	totalAmountStyle,
	totalCardStyle,
	totalIconStyle,
	totalInfoStyle,
	totalLabelStyle,
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

const getDonationStatus = (donation?: Donation) => {
	if (!donation) {
		return 'Sin estado'
	}

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
			return donation.status ?? 'Registrada'
	}
}

const getDonationStatusColors = (donation?: Donation) => {
	const status = String(donation?.status ?? '').toLowerCase()

	if (
		status === 'cancelled' ||
		status === 'canceled' ||
		status === 'cancelado' ||
		status === 'cancelada' ||
		status === 'failed' ||
		status === 'fallida' ||
		status === 'fallido'
	) {
		return {
			backgroundColor: colors.coralLight,
			color: colors.coral,
			borderColor: '#EFC5C0',
		}
	}

	if (status === 'pending' || status === 'pendiente') {
		return {
			backgroundColor: colors.orangeLight,
			color: colors.orange,
			borderColor: '#E8D2A7',
		}
	}

	return {
		backgroundColor: colors.active,
		color: colors.primary,
		borderColor: colors.border,
	}
}

export default function DonationHistoryScreen() {
	const router = useRouter()

	const [donations, setDonations] = useState<Donation[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		void loadDonations()
	}, [])

	const loadDonations = async () => {
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

			const data = response?.data ?? response

			let normalizedData: unknown = data

			if (
				normalizedData &&
				typeof normalizedData === 'object' &&
				!Array.isArray(normalizedData)
			) {
				const objectData = normalizedData as {
					data?: unknown
					donations?: unknown
				}

				if (Array.isArray(objectData.data)) {
					normalizedData = objectData.data
				} else if (Array.isArray(objectData.donations)) {
					normalizedData = objectData.donations
				}
			}

			if (!Array.isArray(normalizedData)) {
				setDonations([])
				return
			}

			setDonations(normalizedData as Donation[])
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
	}

	const sortedDonations = useMemo(() => {
		return [...donations].sort((a, b) => {
			const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
			const dateB = b.created_at ? new Date(b.created_at).getTime() : 0

			return dateB - dateA
		})
	}, [donations])

	const totalDonated = useMemo(() => {
		return donations.reduce((total, donation) => {
			const amount = Number(donation?.amount ?? 0)

			return total + (Number.isFinite(amount) ? amount : 0)
		}, 0)
	}, [donations])

	const completedDonations = useMemo(() => {
		return donations.filter((donation) => {
			const status = String(donation.status ?? '').toLowerCase()

			return (
				status === 'completed' ||
				status === 'complete' ||
				status === 'completada' ||
				status === 'completado'
			)
		}).length
	}, [donations])

	const formatAmount = (amount?: number | string | null) => {
		const value = Number(amount ?? 0)

		if (!Number.isFinite(value)) {
			return '$0.00'
		}

		return value.toLocaleString('es-MX', {
			style: 'currency',
			currency: 'MXN',
		})
	}

	const formatDate = (date?: string | null) => {
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

	const formatTime = (date?: string | null) => {
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

	return (
		<SafeAreaView style={containerStyle} edges={['top', 'left', 'right']}>
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				style={backgroundStyle}
				resizeMode='repeat'
				imageStyle={backgroundImageStyle}
			>
				<View style={backButtonStyle}>
					<Pressable
						onPress={() => router.back()}
						style={({ pressed }) => [
							{
								opacity: pressed ? 0.75 : 1,
							},
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
						<Text style={titleStyle}>Mis donaciones</Text>

						<Text style={subtitleStyle}>
							Consulta el historial de tus donaciones.
						</Text>
					</View>

					<View style={statsContainerStyle}>
						<View style={statCardStyle}>
							<View style={statIconStyle}>
								<HugeiconsIcon
									icon={HeartAddIcon}
									size={21}
									strokeWidth={1.8}
									color={colors.primary}
								/>
							</View>

							<View>
								<Text style={statNumberStyle}>{donations.length}</Text>

								<Text style={statLabelStyle}>Donaciones</Text>
							</View>
						</View>

						<View style={statCardStyle}>
							<View style={statIconStyle}>
								<HugeiconsIcon
									icon={CheckmarkCircle02Icon}
									size={21}
									strokeWidth={1.8}
									color={colors.primary}
								/>
							</View>

							<View>
								<Text style={statNumberStyle}>{completedDonations}</Text>

								<Text style={statLabelStyle}>Completadas</Text>
							</View>
						</View>
					</View>

					<View style={totalCardStyle}>
						<View style={totalIconStyle}>
							<HugeiconsIcon
								icon={HeartAddIcon}
								size={25}
								strokeWidth={1.8}
								color={colors.primary}
							/>
						</View>

						<View style={totalInfoStyle}>
							<Text style={totalLabelStyle}>Total donado</Text>

							<Text style={totalAmountStyle}>{formatAmount(totalDonated)}</Text>
						</View>
					</View>

					{loading ? (
						<View style={loadingContainerStyle}>
							<ActivityIndicator size='large' color={colors.primary} />

							<Text style={loadingTextStyle}>Cargando tus donaciones...</Text>
						</View>
					) : sortedDonations.length === 0 ? (
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

							<View style={cardShadow}>
								<Pressable
									onPress={() => router.push('/donations')}
									style={({ pressed }) => [
										buyButtonStyle,
										{
											backgroundColor: pressed
												? colors.buttonPressed
												: colors.button,
										},
									]}
								>
									<Text style={buyButtonTextStyle}>Hacer una donación</Text>
								</Pressable>
							</View>
						</View>
					) : (
						<View style={donationsListStyle}>
							<Text style={sectionTitleStyle}>Historial</Text>

							{sortedDonations.map((donation) => {
								const statusColors = getDonationStatusColors(donation)

								return (
									<View key={donation.id} style={donationCardStyle}>
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

													<Text style={infoValueStyle}>
														{donation.payment_method?.name ?? 'No especificado'}
													</Text>
												</View>
											</View>
										</View>

										{donation.reference ? (
											<View style={referenceContainerStyle}>
												<HugeiconsIcon
													icon={CheckmarkCircle02Icon}
													size={17}
													strokeWidth={1.8}
													color={colors.primary}
												/>

												<View style={referenceInfoStyle}>
													<Text style={infoLabelStyle}>Referencia</Text>

													<Text style={infoValueStyle}>
														{donation.reference}
													</Text>
												</View>
											</View>
										) : null}
									</View>
								)
							})}
						</View>
					)}

					<View style={{ height: 40 }} />
				</ScrollView>
			</ImageBackground>
		</SafeAreaView>
	)
}
