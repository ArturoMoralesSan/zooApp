import { StarIcon } from '@hugeicons/core-free-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { useMemo } from 'react'
import { ScrollView, Text, View } from 'react-native'

import BackButton from '@/components/ui/BackButton'
import FixedFooter from '@/components/FixedFooter'
import { Card } from '@/components/ui/Card'
import { DetailRow } from '@/components/ui/DetailRow'
import { Divider } from '@/components/ui/Divider'
import { ListCard } from '@/components/ui/ListCard'
import { SuccessBanner } from '@/components/ui/SuccessBanner'
import type { Donation, PaymentMethod } from '@/types/donations'
import { formatCurrency } from '@/utils/format'
import { useFixedFooterSpace } from '@/theme/layout'
import { ScreenBackground } from '@/components/ui/ScreenBackground'

function getPaymentMethod(method: PaymentMethod | null | undefined) {
	return method?.name || method?.code || 'Tarjeta'
}

export default function DonationSuccessScreen() {
	const footerSpace = useFixedFooterSpace()
	// donations/summary passes the created donation as JSON, plus the amount
	// on its own in case the donation can't be read.
	const params = useLocalSearchParams<{
		donation?: string
		amount?: string
	}>()

	const donation = useMemo<Partial<Donation>>(() => {
		if (params.donation) {
			try {
				const parsed = JSON.parse(params.donation)

				if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
					return parsed as Donation
				}
			} catch {
				// Si el parámetro no es JSON válido, usamos el monto por separado.
			}
		}

		return { amount: params.amount }
	}, [params.donation, params.amount])

	const amount = donation.amount ?? params.amount ?? 0

	const donationReference =
		donation.folio ||
		donation.reference ||
		donation.id ||
		'Registrada correctamente'

	const paymentMethod = getPaymentMethod(donation.payment_method)

	const handleGoHome = () => {
		router.replace('/')
	}

	return (
		<ScreenBackground>
			<ScrollView
				className='flex-1'
				contentContainerClassName='px-5 pt-2.5'
				contentContainerStyle={{ paddingBottom: footerSpace }}
				showsVerticalScrollIndicator={false}
			>
				{/* BOTÓN REGRESAR (el título lo da SuccessBanner) */}
				<View className='mb-4'>
					<BackButton position='relative' onPress={() => router.back()} />
				</View>

				{/* CONFIRMACIÓN DE DONACIÓN */}
				<SuccessBanner
					title='¡Donación realizada!'
					message='Gracias por apoyar al Zoológico Sahuatoba.'
				/>

				{/* MONTO DONADO Y DETALLE */}
				<Card className='mb-3'>
					<Text className='text-overline text-tinta-2'>Monto donado</Text>

					<Text className='mt-1 font-display-x text-[34px] text-bosque'>
						{formatCurrency(amount)}
					</Text>

					<Divider />

					<Text className='text-overline mb-1 text-tinta-2'>
						Detalle de la donación
					</Text>

					<DetailRow label='Donación' value='Aportación al zoológico' />
					<DetailRow label='Método de pago' value={paymentMethod} />
					<DetailRow
						label='Folio'
						value={`#${String(donationReference).replace(/^#/, '')}`}
						selectable
					/>
				</Card>

				{/* AGRADECIMIENTO */}
				<ListCard
					tone='hoja'
					icon={StarIcon}
					iconTone='solid'
					title='¡Tu apoyo cuenta!'
					description='Gracias a personas como tú podemos seguir trabajando en el bienestar de los animales y en la conservación de nuestra fauna.'
				/>
			</ScrollView>

			{/* FOOTER FIJO */}
			<FixedFooter
				label='Donación confirmada'
				description='Gracias por tu aportación'
				amount={formatCurrency(amount)}
				buttonTitle='Ir al inicio'
				onButtonPress={handleGoHome}
			/>
		</ScreenBackground>
	)
}
