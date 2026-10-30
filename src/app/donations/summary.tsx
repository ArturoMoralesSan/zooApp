import {
	HeartAddIcon,
	HeartIcon,
	ShieldCheckIcon,
} from '@hugeicons/core-free-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'

import BackButton from '@/components/ui/BackButton'
import FixedFooter from '@/components/FixedFooter'
import { Card } from '@/components/ui/Card'
import { DetailRow } from '@/components/ui/DetailRow'
import { Divider } from '@/components/ui/Divider'
import { IconBox } from '@/components/ui/IconBox'
import { ListCard } from '@/components/ui/ListCard'
import { Notice } from '@/components/ui/Notice'
import { ScreenHeader } from '@/components/ui/TabHeader'
import { useDataRefresh } from '@/hooks/useDataRefresh'
import { redirectIfSignedOut } from '@/hooks/useSessionRedirect'

import { formatCurrency } from '@/utils/format'
import { createDonation } from '@/services/donations'
import { useFixedFooterSpace } from '@/theme/layout'
import { ScreenBackground } from '@/components/ui/ScreenBackground'
import { FooterLoadingBar } from '@/components/ui/FooterLoadingBar'

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
				<Card className='mb-3 mt-6'>
					<View className='flex-row items-center gap-3'>
						<IconBox icon={HeartAddIcon} />

						<View className='min-w-0 flex-1'>
							<Text className='text-h3 text-tinta'>Donación</Text>

							<Text className='text-meta mt-1'>
								Aportación para el Zoológico Sahuatoba
							</Text>
						</View>
					</View>

					<Divider />

					<Text className='text-overline mb-1 text-tinta-2'>
						Detalle del pago
					</Text>

					<DetailRow
						label='Aportación voluntaria'
						value={formatCurrency(amount)}
						emphasis
					/>
					<DetailRow label='Método de pago' value='Tarjeta' />
				</Card>

				{/* PAGO SEGURO */}
				<ListCard
					tone='hoja'
					icon={ShieldCheckIcon}
					iconTone='solid'
					title='Pago seguro'
					description='Tu información de pago será procesada de forma segura mediante nuestro proveedor de pagos.'
					className='mb-3'
				/>

				{/* AGRADECIMIENTO */}
				<Notice
					tone='warning'
					icon={HeartIcon}
					title='Gracias por apoyar al zoológico'
					message='Tu aportación ayuda al cuidado de los animales, mantenimiento de sus espacios y conservación de nuestra fauna.'
				/>

				{/* MENSAJE DE ERROR */}
				{error && (
					<Notice
						tone='error'
						title='No se pudo registrar la donación'
						message={error}
						className='mt-3'
					/>
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
