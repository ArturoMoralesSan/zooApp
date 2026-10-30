import { HeartAddIcon, ShieldCheckIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'

import BackButton from '@/components/ui/BackButton'
import FixedFooter from '@/components/FixedFooter'
import { ScreenHeader } from '@/components/ui/TabHeader'
import { useDataRefresh } from '@/hooks/useDataRefresh'
import { redirectIfSignedOut } from '@/hooks/useSessionRedirect'

import colors from '@/theme/colors'
import { cardShadow } from '@/theme/shadows'
import { formatCurrency } from '@/utils/format'
import { createDonation } from '@/services/donations'
import { useFixedFooterSpace } from '@/theme/layout'
import { ScreenBackground } from '@/components/ui/ScreenBackground'
import { FooterLoadingBar } from '@/components/ui/FooterLoadingBar'

const COLORS = {
	primary: colors.esmeralda,
} as const

export default function DonationsSummaryScreen() {
	const footerSpace = useFixedFooterSpace()
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

	const { refreshDonations } = useDataRefresh()

	const confirmDonation = async () => {
		if (loading) return

		if (amount < 10) {
			setError('El monto mínimo de donación es de $10.00.')
			return
		}

		setError(null)
		setLoading(true)

		try {
			if (await redirectIfSignedOut()) return

			const donation = await createDonation({
				amount: Number(amount.toFixed(2)),
			})

			void refreshDonations()

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
		<ScreenBackground>
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerClassName='px-5 pt-2'
				contentContainerStyle={{ paddingBottom: footerSpace }}
				keyboardShouldPersistTaps='handled'
			>
				{/* BOTÓN REGRESAR */}
				<BackButton position='relative' onPress={() => router.back()} />

				{/* ENCABEZADO */}
				<View className='mt-px'>
					<ScreenHeader
						title='Resumen de donación'
						subtitle='Revisa los datos antes de continuar con tu aportación.'
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
							<Text className='text-h3 text-tinta'>Donación</Text>

							<Text className='text-meta mt-1'>
								Aportación para el Zoológico Sahuatoba
							</Text>
						</View>
					</View>

					<View className='my-[7px] h-px bg-card-border' />

					<Text className='text-overline mb-3 mt-3.5 text-bosque'>
						DETALLE DEL PAGO
					</Text>

					<View className='min-h-11 flex-row items-center justify-between gap-3'>
						<Text className='text-body flex-1 text-tinta'>
							Aportación voluntaria
						</Text>

						<Text
							className='font-display-x text-[15px] text-esmeralda'
							numberOfLines={1}
							adjustsFontSizeToFit
						>
							{formatCurrency(amount)}
						</Text>
					</View>

					<View className='my-[7px] h-px bg-card-border' />

					<View className='min-h-11 flex-row items-center justify-between gap-3'>
						<Text className='text-body flex-1 text-tinta'>Método de pago</Text>

						<Text className='font-sans-x text-[13px] text-esmeralda'>
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
						<Text className='text-h3 text-bosque'>Pago seguro</Text>

						<Text className='text-body mt-[3px] text-tinta-2'>
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
					<Text className='text-h3 text-bosque'>
						Gracias por apoyar al zoológico
					</Text>

					<Text className='text-body mt-[5px] text-tinta-2'>
						Tu aportación ayuda al cuidado de los animales, mantenimiento de sus
						espacios y conservación de nuestra fauna.
					</Text>
				</View>

				{/* MENSAJE DE ERROR */}
				{error && (
					<View className='mt-[15px] w-full rounded-[18px] border border-error-border bg-error-bg p-3.5'>
						<Text className='font-sans-bold text-[13px] text-error'>
							{error}
						</Text>
					</View>
				)}

				<View className='h-10' />
			</ScrollView>

			{/* FOOTER FIJO */}
			{loading ? (
				<FooterLoadingBar message='Registrando donación...' />
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
		</ScreenBackground>
	)
}
