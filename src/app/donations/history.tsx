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
	type ViewStyle,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import BackButton from '@/components/BackButton'
import UserHeader from '@/components/UserHeader'
import colors from '@/theme/colors'

const ICON_COLOR = colors.tinta

const cardShadow: ViewStyle = {
	shadowColor: colors.bosque,
	shadowOffset: { width: 0, height: 2 },
	shadowOpacity: 0.05,
	shadowRadius: 5,
	elevation: 2,
}

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

function getDonationStatusClassName(donation: Donation): string {
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
		return 'bg-hoja'
	}

	if (status === 'pending' || status === 'pendiente') {
		return 'bg-niebla'
	}

	return 'bg-lima'
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
		<SafeAreaView className='flex-1 bg-blanco' edges={['top', 'left', 'right']}>
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				className='flex-1'
				resizeMode='repeat'
				imageClassName='opacity-[0.15]'
			>
				{/* Encabezado */}
				<View className='px-5 pt-2'>
					<View className='mb-3'>
						<BackButton onPress={() => router.back()} position='relative' />
					</View>

					<View className='mb-5'>
						<UserHeader
							title='Mis donaciones'
							subtitle='Consulta el historial de tus donaciones.'
							showRewards={false}
						/>
					</View>
				</View>

				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerClassName='px-5 pb-10 pt-0'
				>
					{/* Estadísticas */}
					<View className='mb-[22px] w-full flex-row items-stretch gap-2.5'>
						<View
							className='min-w-0 flex-1 items-center justify-center rounded-[18px] border border-card-border bg-niebla px-[7px] py-4'
							style={cardShadow}
						>
							<Text className='text-center text-[21px] font-extrabold text-tinta'>
								{donations.length}
							</Text>
							<Text className='mt-1.5 text-center text-[11px] font-medium text-tinta'>
								Donaciones
							</Text>
						</View>

						<View
							className='min-w-0 flex-1 items-center justify-center rounded-[18px] border border-card-border bg-niebla px-[7px] py-4'
							style={cardShadow}
						>
							<Text className='text-center text-[21px] font-extrabold text-tinta'>
								{completedDonations}
							</Text>
							<Text className='mt-1.5 text-center text-[11px] font-medium text-tinta'>
								Completadas
							</Text>
						</View>

						<View
							className='min-w-0 items-center justify-center rounded-[18px] border border-card-border bg-niebla px-[7px] py-4'
							style={[cardShadow, { flex: 1.25 }]}
						>
							<Text
								className='text-center text-[16px] font-extrabold text-tinta'
								numberOfLines={1}
								adjustsFontSizeToFit
								minimumFontScale={0.7}
							>
								{formatAmount(totalDonated)}
							</Text>
							<Text className='mt-1.5 text-center text-[11px] font-medium text-tinta'>
								Total donado
							</Text>
						</View>
					</View>

					{/* Cargando */}
					{loading ? (
						<View className='items-center justify-center py-[60px]'>
							<ActivityIndicator size='large' color={ICON_COLOR} />
							<Text className='mt-3 text-[14px] text-tinta'>
								Cargando tus donaciones...
							</Text>
						</View>
					) : sortedDonations.length === 0 ? (
						/* Estado vacío */
						<View
							className='w-full items-center rounded-[22px] border border-card-border bg-niebla px-[25px] py-8'
							style={cardShadow}
						>
							<View className='mb-4 h-[62px] w-[62px] items-center justify-center rounded-[18px] border border-card-border bg-hoja'>
								<HugeiconsIcon
									icon={HeartAddIcon}
									size={32}
									strokeWidth={1.8}
									color={ICON_COLOR}
								/>
							</View>

							<Text className='text-center text-[18px] font-extrabold text-tinta'>
								No tienes donaciones
							</Text>

							<Text className='mt-[7px] text-center text-[13px] leading-[19px] text-tinta'>
								Cuando realices una donación aparecerá aquí.
							</Text>

							<Pressable
								onPress={() => router.push('/donations')}
								className='mt-[18px] min-h-12 w-full items-center justify-center rounded-[14px] bg-esmeralda active:bg-bosque'
							>
								<Text className='text-[14px] font-bold text-blanco'>
									Hacer una donación
								</Text>
							</Pressable>
						</View>
					) : (
						/* Historial */
						<View className='w-full'>
							<Text className='mb-3 text-[18px] font-extrabold text-tinta'>
								Historial
							</Text>

							{sortedDonations.map((donation) => (
								<View
									key={donation.id}
									className='mb-[13px] w-full rounded-[20px] border border-card-border bg-niebla p-4'
									style={cardShadow}
								>
									<View className='flex-row items-center'>
										<View className='mr-[11px] h-[46px] w-[46px] items-center justify-center rounded-[15px] border border-card-border bg-hoja'>
											<HugeiconsIcon
												icon={HeartAddIcon}
												size={25}
												strokeWidth={1.8}
												color={ICON_COLOR}
											/>
										</View>

										<View className='min-w-0 flex-1'>
											<Text className='text-[19px] font-extrabold text-tinta'>
												{formatAmount(donation.amount)}
											</Text>

											<Text className='mt-1 text-[12px] text-tinta'>
												{formatDate(donation.created_at)}
											</Text>

											{formatTime(donation.created_at) ? (
												<Text className='mt-0.5 text-[11px] text-tinta'>
													{formatTime(donation.created_at)}
												</Text>
											) : null}
										</View>

										<View
											className={`ml-[7px] rounded-[10px] border border-card-border px-2 py-[5px] ${getDonationStatusClassName(donation)}`}
										>
											<Text className='text-[10px] font-bold text-tinta'>
												{getDonationStatus(donation)}
											</Text>
										</View>
									</View>

									<View className='my-3.5 h-px bg-card-border' />

									{/* Método de pago y referencia */}
									<View className='w-full flex-row items-start gap-4'>
										<View className='min-w-0 flex-1'>
											<Text className='text-[11px] font-medium text-tinta'>
												Método de pago
											</Text>

											<View className='mt-1.5 flex-row items-center'>
												<HugeiconsIcon
													icon={CreditCardIcon}
													size={17}
													strokeWidth={1.8}
													color={ICON_COLOR}
												/>

												<Text
													className='ml-1.5 shrink text-[12px] font-semibold leading-[18px] text-tinta'
													numberOfLines={2}
												>
													{donation.payment_method?.name ?? 'No especificado'}
												</Text>
											</View>
										</View>

										<View className='min-w-0 flex-1'>
											<Text className='text-[11px] font-medium text-tinta'>
												Referencia
											</Text>

											<Text
												className='mt-1.5 shrink text-[12px] font-semibold leading-[18px] text-tinta'
												numberOfLines={2}
											>
												{donation.reference || 'No disponible'}
											</Text>
										</View>
									</View>
								</View>
							))}
						</View>
					)}

					<View className='h-[30px]' />
				</ScrollView>
			</ImageBackground>
		</SafeAreaView>
	)
}
