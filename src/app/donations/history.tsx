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
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native'

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

	coral: '#D95C4F',
	coralLight: '#F8E1DE',

	orange: '#B76E00',
	orangeLight: '#FFF0D4',

	button: '#246F4C',
	buttonPressed: '#1D5C3F',

	overlay: 'rgba(0,0,0,0.45)',
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
			backgroundColor: COLORS.coralLight,
			color: COLORS.coral,
			borderColor: '#EFC5C0',
		}
	}

	if (status === 'pending' || status === 'pendiente') {
		return {
			backgroundColor: COLORS.orangeLight,
			color: COLORS.orange,
			borderColor: '#E8D2A7',
		}
	}

	return {
		backgroundColor: COLORS.active,
		color: COLORS.primary,
		borderColor: COLORS.border,
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

			/*
			 * Soporta distintas respuestas posibles:
			 *
			 * { data: [...] }
			 *
			 * { data: { data: [...] } }
			 *
			 * { data: { donations: [...] } }
			 *
			 * { donations: [...] }
			 *
			 * [...]
			 */

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
		<SafeAreaView style={styles.container}>
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				style={styles.background}
				className='flex-1'
				resizeMode='repeat'
				imageStyle={{
					opacity: 0.3,
				}}
			>
				<View style={styles.backButtonWrapper}>
					<Pressable
						onPress={() => router.back()}
						className='flex-row items-center rounded-[18px] px-4 py-2.5'
						style={({ pressed }) => ({
							backgroundColor: pressed ? COLORS.card : COLORS.cardLight,
							borderWidth: 1,
							borderColor: COLORS.border,
							shadowColor: COLORS.primary,
							shadowOffset: {
								width: 0,
								height: 3,
							},
							shadowOpacity: 0.1,
							shadowRadius: 7,
							elevation: 3,
							opacity: pressed ? 0.75 : 1,
						})}
					>
						<Text
							className='mr-1 text-lg font-bold'
							style={{
								color: COLORS.primary,
							}}
						>
							‹
						</Text>

						<Text
							className='text-base font-semibold'
							style={{
								color: COLORS.dark,
							}}
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
						<Text style={styles.title}>Mis donaciones</Text>

						<Text style={styles.subtitle}>
							Consulta el historial de tus donaciones.
						</Text>
					</View>

					<View style={styles.statsContainer}>
						<View style={styles.statCard}>
							<View style={styles.statIcon}>
								<HugeiconsIcon
									icon={HeartAddIcon}
									size={21}
									strokeWidth={1.8}
									color={COLORS.primary}
								/>
							</View>

							<View>
								<Text style={styles.statNumber}>{donations.length}</Text>

								<Text style={styles.statLabel}>Donaciones</Text>
							</View>
						</View>

						<View style={styles.statCard}>
							<View style={styles.statIcon}>
								<HugeiconsIcon
									icon={CheckmarkCircle02Icon}
									size={21}
									strokeWidth={1.8}
									color={COLORS.primary}
								/>
							</View>

							<View>
								<Text style={styles.statNumber}>{completedDonations}</Text>

								<Text style={styles.statLabel}>Completadas</Text>
							</View>
						</View>
					</View>

					<View style={styles.totalCard}>
						<View style={styles.totalIcon}>
							<HugeiconsIcon
								icon={HeartAddIcon}
								size={25}
								strokeWidth={1.8}
								color={COLORS.primary}
							/>
						</View>

						<View style={styles.totalInfo}>
							<Text style={styles.totalLabel}>Total donado</Text>

							<Text style={styles.totalAmount}>
								{formatAmount(totalDonated)}
							</Text>
						</View>
					</View>

					{loading ? (
						<View style={styles.loadingContainer}>
							<ActivityIndicator size='large' color={COLORS.primary} />

							<Text style={styles.loadingText}>Cargando tus donaciones...</Text>
						</View>
					) : sortedDonations.length === 0 ? (
						<View style={styles.emptyCard}>
							<View style={styles.emptyIcon}>
								<HugeiconsIcon
									icon={HeartAddIcon}
									size={32}
									strokeWidth={1.8}
									color={COLORS.primary}
								/>
							</View>

							<Text style={styles.emptyTitle}>No tienes donaciones</Text>

							<Text style={styles.emptyText}>
								Cuando realices una donación aparecerá aquí.
							</Text>

							<View style={styles.buyButtonWrapper}>
								<Pressable
									onPress={() => router.push('/donations')}
									style={({ pressed }) => ({
										...styles.buyButton,
										backgroundColor: pressed
											? COLORS.buttonPressed
											: COLORS.button,
									})}
								>
									<Text style={styles.buyButtonText}>Hacer una donación</Text>
								</Pressable>
							</View>
						</View>
					) : (
						<View style={styles.donationsList}>
							<Text style={styles.sectionTitle}>Historial</Text>

							{sortedDonations.map((donation) => {
								const statusColors = getDonationStatusColors(donation)

								return (
									<View key={donation.id} style={styles.donationCard}>
										<View style={styles.donationHeader}>
											<View style={styles.donationIcon}>
												<HugeiconsIcon
													icon={HeartAddIcon}
													size={25}
													strokeWidth={1.8}
													color={COLORS.primary}
												/>
											</View>

											<View style={styles.donationInfo}>
												<Text style={styles.donationAmount}>
													{formatAmount(donation.amount)}
												</Text>

												<Text style={styles.donationDate}>
													{formatDate(donation.created_at)}
												</Text>

												{formatTime(donation.created_at) ? (
													<Text style={styles.donationTime}>
														{formatTime(donation.created_at)}
													</Text>
												) : null}
											</View>

											<View
												style={[
													styles.statusBadge,
													{
														backgroundColor: statusColors.backgroundColor,
														borderColor: statusColors.borderColor,
													},
												]}
											>
												<Text
													style={[
														styles.statusText,
														{
															color: statusColors.color,
														},
													]}
												>
													{getDonationStatus(donation)}
												</Text>
											</View>
										</View>

										<View style={styles.divider} />

										<View style={styles.infoRow}>
											<View style={styles.infoBlock}>
												<Text style={styles.infoLabel}>Método de pago</Text>

												<View style={styles.paymentRow}>
													<HugeiconsIcon
														icon={CreditCardIcon}
														size={17}
														strokeWidth={1.8}
														color={COLORS.primary}
													/>

													<Text style={styles.infoValue}>
														{donation.payment_method?.name ?? 'No especificado'}
													</Text>
												</View>
											</View>
										</View>

										{donation.reference ? (
											<View style={styles.referenceContainer}>
												<HugeiconsIcon
													icon={CheckmarkCircle02Icon}
													size={17}
													strokeWidth={1.8}
													color={COLORS.primary}
												/>

												<View style={styles.referenceInfo}>
													<Text style={styles.infoLabel}>Referencia</Text>

													<Text style={styles.infoValue}>
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

const styles = StyleSheet.create({
	background: {
		flex: 1,
	},

	container: {
		flex: 1,
		backgroundColor: COLORS.background,
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
		paddingBottom: 40,
	},

	header: {
		marginBottom: 20,
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

	statsContainer: {
		flexDirection: 'row',
		gap: 12,
		marginBottom: 18,
	},

	statCard: {
		flex: 1,
		backgroundColor: COLORS.card,
		borderRadius: 22,
		padding: 14,
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: COLORS.border,
		...cardShadow,
	},

	statIcon: {
		width: 42,
		height: 42,
		borderRadius: 15,
		backgroundColor: COLORS.active,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 10,
		borderWidth: 1,
		borderColor: COLORS.border,
	},

	statNumber: {
		fontSize: 20,
		fontWeight: '900',
		color: COLORS.dark,
	},

	statLabel: {
		marginTop: 1,
		fontSize: 11,
		color: COLORS.muted,
	},

	totalCard: {
		width: '100%',
		backgroundColor: COLORS.cardLight,
		borderRadius: 22,
		padding: 16,
		marginBottom: 22,
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: COLORS.border,
		...cardShadow,
	},

	totalIcon: {
		width: 50,
		height: 50,
		borderRadius: 17,
		backgroundColor: COLORS.active,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 12,
		borderWidth: 1,
		borderColor: COLORS.border,
	},

	totalInfo: {
		flex: 1,
	},

	totalLabel: {
		fontSize: 12,
		fontWeight: '700',
		color: COLORS.muted,
	},

	totalAmount: {
		marginTop: 2,
		fontSize: 24,
		fontWeight: '900',
		color: COLORS.primary,
	},

	loadingContainer: {
		paddingVertical: 60,
		alignItems: 'center',
		justifyContent: 'center',
	},

	loadingText: {
		marginTop: 12,
		fontSize: 14,
		color: COLORS.muted,
	},

	emptyCard: {
		backgroundColor: COLORS.cardLight,
		borderRadius: 28,
		paddingHorizontal: 25,
		paddingVertical: 35,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: COLORS.border,
		...cardShadow,
	},

	emptyIcon: {
		width: 68,
		height: 68,
		borderRadius: 22,
		backgroundColor: COLORS.active,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 16,
		borderWidth: 1,
		borderColor: COLORS.border,
	},

	emptyTitle: {
		fontSize: 18,
		fontWeight: '900',
		color: COLORS.dark,
		textAlign: 'center',
	},

	emptyText: {
		marginTop: 7,
		fontSize: 13,
		lineHeight: 19,
		color: COLORS.muted,
		textAlign: 'center',
	},

	buyButtonWrapper: {
		width: '100%',
		marginTop: 20,
		borderRadius: 17,
		overflow: 'hidden',
		backgroundColor: COLORS.button,
		...cardShadow,
	},

	buyButton: {
		width: '100%',
		height: 48,
		alignItems: 'center',
		justifyContent: 'center',
	},

	buyButtonText: {
		color: COLORS.white,
		fontSize: 14,
		fontWeight: '800',
	},

	donationsList: {
		width: '100%',
	},

	sectionTitle: {
		marginBottom: 12,
		fontSize: 18,
		fontWeight: '900',
		color: COLORS.dark,
	},

	donationCard: {
		width: '100%',
		backgroundColor: COLORS.cardLight,
		borderRadius: 28,
		padding: 17,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: COLORS.border,
		...cardShadow,
	},

	donationHeader: {
		flexDirection: 'row',
		alignItems: 'center',
	},

	donationIcon: {
		width: 50,
		height: 50,
		borderRadius: 17,
		backgroundColor: COLORS.active,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 12,
		borderWidth: 1,
		borderColor: COLORS.border,
	},

	donationInfo: {
		flex: 1,
		minWidth: 0,
	},

	donationAmount: {
		fontSize: 19,
		fontWeight: '900',
		color: COLORS.primary,
	},

	donationDate: {
		marginTop: 4,
		fontSize: 12,
		color: COLORS.muted,
	},

	donationTime: {
		marginTop: 2,
		fontSize: 11,
		color: COLORS.muted,
	},

	statusBadge: {
		borderRadius: 12,
		paddingHorizontal: 9,
		paddingVertical: 6,
		marginLeft: 8,
		borderWidth: 1,
	},

	statusText: {
		fontSize: 10,
		fontWeight: '800',
	},

	divider: {
		height: 1,
		backgroundColor: COLORS.border,
		marginVertical: 14,
	},

	infoRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},

	infoBlock: {
		flex: 1,
	},

	infoLabel: {
		fontSize: 11,
		color: COLORS.muted,
	},

	paymentRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 4,
	},

	infoValue: {
		marginLeft: 7,
		fontSize: 13,
		fontWeight: '700',
		color: COLORS.dark,
	},

	referenceContainer: {
		marginTop: 13,
		paddingTop: 13,
		borderTopWidth: 1,
		borderTopColor: COLORS.border,
		flexDirection: 'row',
		alignItems: 'center',
	},

	referenceInfo: {
		flex: 1,
		marginLeft: 8,
	},
})
