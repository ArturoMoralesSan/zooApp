import { useDonations } from '@/hooks/useDonations'
import { useSessionRedirect } from '@/hooks/useSessionRedirect'

import { CreditCardIcon, HeartAddIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { useRouter } from 'expo-router'
import { useEffect, useMemo } from 'react'
import {
	ActivityIndicator,
	Alert,
	Pressable,
	ScrollView,
	Text,
	View,
} from 'react-native'

import BackButton from '@/components/BackButton'
import UserHeader from '@/components/UserHeader'
import type { Donation } from '@/types/donations'
import { formatCurrency, formatDate, formatTime } from '@/utils/format'
import { ScreenBackground } from '@/components/ui/ScreenBackground'
import { cardShadow, ICON_COLOR } from '@/components/donations/historyStyles'
import {
	getDonationStatus,
	getDonationStatusClassName,
	isCompleted,
} from '@/utils/donations'

const NO_DONATIONS: Donation[] = []

export default function DonationHistoryScreen() {
	const router = useRouter()

	const { data, error, isLoading: loading } = useDonations()
	// A failed load shows the empty list, as before.
	const donations = error ? NO_DONATIONS : (data ?? NO_DONATIONS)

	useSessionRedirect()

	useEffect(() => {
		if (!error) return

		console.error('Error cargando donaciones:', error)

		Alert.alert(
			'Mis donaciones',
			error.message || 'No fue posible cargar tus donaciones.',
		)
	}, [error])

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
		<ScreenBackground patternClassName='opacity-[0.15]' withBackground={false}>
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
							{formatCurrency(totalDonated)}
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
											{formatCurrency(donation.amount)}
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
		</ScreenBackground>
	)
}
