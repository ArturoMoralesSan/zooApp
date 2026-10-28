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

import colors from '@/theme/colors'
import { cardShadow } from '@/theme/shadows'

const COLORS = {
	primary: colors.esmeralda,
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
		<SafeAreaView className='flex-1 bg-blanco' edges={['top', 'left', 'right']}>
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				className='flex-1 bg-blanco'
				imageClassName='opacity-[0.025]'
				resizeMode='repeat'
			>
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerClassName='px-5 pb-[190px] pt-2'
					keyboardShouldPersistTaps='handled'
				>
					{/* BOTÓN REGRESAR */}
					<BackButton position='relative' onPress={() => router.back()} />

					{/* ENCABEZADO */}
					<View className='mt-px'>
						<UserHeader
							title='Resumen de donación'
							subtitle='Revisa los datos antes de continuar con tu aportación.'
							showRewards={false}
						/>
					</View>

					{/* DONACIÓN Y DETALLE DEL PAGO */}
					<View
						className='mb-[17px] w-full rounded-[18px] border border-card-border bg-niebla p-[17px]'
						style={cardShadow}
					>
						<View className='flex-row items-center gap-3.5 pb-[18px]'>
							<View className='h-[54px] w-[54px] shrink-0 items-center justify-center rounded-[17px] border border-card-border bg-hoja'>
								<HugeiconsIcon
									icon={HeartAddIcon}
									size={28}
									color={COLORS.primary}
									strokeWidth={1.8}
								/>
							</View>

							<View className='min-w-0 flex-1'>
								<Text className='text-[17px] font-black text-tinta'>
									Donación
								</Text>

								<Text className='mt-1 text-[12px] leading-[17px] text-tinta-2'>
									Aportación para el Zoológico Sahuatoba
								</Text>
							</View>
						</View>

						<View className='my-[7px] h-px bg-card-border' />

						<Text className='mb-3 mt-3.5 text-[14px] font-black uppercase tracking-[0.7px] text-bosque'>
							DETALLE DEL PAGO
						</Text>

						<View className='min-h-11 flex-row items-center justify-between gap-3'>
							<Text className='flex-1 text-[14px] font-extrabold text-tinta'>
								Aportación voluntaria
							</Text>

							<Text
								className='text-[15px] font-black text-esmeralda'
								numberOfLines={1}
								adjustsFontSizeToFit
							>
								{formatCurrency(amount)}
							</Text>
						</View>

						<View className='my-[7px] h-px bg-card-border' />

						<View className='min-h-11 flex-row items-center justify-between gap-3'>
							<Text className='flex-1 text-[14px] font-extrabold text-tinta'>
								Método de pago
							</Text>

							<Text className='text-[13px] font-black text-esmeralda'>
								Tarjeta
							</Text>
						</View>
					</View>

					{/* PAGO SEGURO */}
					<View
						className='mb-[17px] w-full flex-row items-center rounded-[18px] border border-card-border bg-niebla p-[17px]'
						style={cardShadow}
					>
						<View className='mr-[13px] h-12 w-12 items-center justify-center rounded-[15px] border border-bosque bg-bosque'>
							<HugeiconsIcon
								icon={ShieldCheckIcon}
								size={25}
								color={colors.blanco}
								strokeWidth={2}
							/>
						</View>

						<View className='min-w-0 flex-1'>
							<Text className='text-[15px] font-black text-bosque'>
								Pago seguro
							</Text>

							<Text className='mt-[3px] text-[12px] leading-[17px] text-tinta-2'>
								Tu información de pago será procesada de forma segura mediante
								nuestro proveedor de pagos.
							</Text>
						</View>
					</View>

					{/* AGRADECIMIENTO */}
					<View
						className='w-full rounded-[18px] border border-card-border bg-hoja p-[17px]'
						style={cardShadow}
					>
						<Text className='text-[15px] font-black text-bosque'>
							Gracias por apoyar al zoológico
						</Text>

						<Text className='mt-[5px] text-[12px] leading-[18px] text-tinta-2'>
							Tu aportación ayuda al cuidado de los animales, mantenimiento de
							sus espacios y conservación de nuestra fauna.
						</Text>
					</View>

					{/* MENSAJE DE ERROR */}
					{error && (
						<View className='mt-[15px] w-full rounded-[18px] border border-error-border bg-error-bg p-3.5'>
							<Text className='text-[13px] font-bold leading-[18px] text-error'>
								{error}
							</Text>
						</View>
					)}

					<View className='h-10' />
				</ScrollView>

				{/* FOOTER FIJO */}
				{loading ? (
					<View
						className='absolute bottom-0 left-0 right-0 z-[999] flex-row items-center justify-center gap-2.5 border-t border-t-card-border bg-blanco px-5 pb-7 pt-5'
						style={{ elevation: 15 }}
					>
						<ActivityIndicator size='small' color={COLORS.primary} />
						<Text className='font-extrabold text-esmeralda'>
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
