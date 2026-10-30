import { CheckmarkCircle02Icon, StarIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useMemo } from 'react'
import { ScrollView, Text, View } from 'react-native'

import BackButton from '@/components/ui/BackButton'
import FixedFooter from '@/components/FixedFooter'
import { ScreenHeader } from '@/components/ui/TabHeader'
import colors from '@/theme/colors'
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
		<ScreenBackground patternClassName='opacity-[0.13]'>
			<ScrollView
				className='flex-1'
				contentContainerClassName='px-5 pt-2.5'
				contentContainerStyle={{ paddingBottom: footerSpace }}
				showsVerticalScrollIndicator={false}
			>
				<View className='mb-5 gap-3'>
					<BackButton position='relative' onPress={() => router.back()} />

					<ScreenHeader
						title='Donación realizada'
						subtitle='Gracias por apoyar el cuidado de las especies.'
					/>
				</View>

				{/* CONFIRMACIÓN DE DONACIÓN */}
				<View className='mb-4 items-center justify-center rounded-3xl bg-bosque px-[22px] py-[30px]'>
					<View className='mb-[18px] h-[78px] w-[78px] items-center justify-center rounded-[39px] bg-lima/[0.13]'>
						<HugeiconsIcon
							icon={CheckmarkCircle02Icon}
							size={46}
							color={colors.lima}
						/>
					</View>

					<Text className='text-h1 mb-2.5 text-center text-blanco'>
						¡Donación realizada!
					</Text>

					<Text className='text-body text-center text-blanco opacity-[0.94]'>
						Gracias por apoyar al Zoológico Sahuatoba.
					</Text>
				</View>

				{/* MONTO DONADO Y DETALLE */}
				<View className='mb-4 rounded-[22px] border border-card-border bg-niebla p-5'>
					<View className='mb-2'>
						<Text className='text-overline text-tinta-2'>Monto donado</Text>
					</View>

					<Text className='font-display-x text-[34px] text-tinta-2'>
						{formatCurrency(amount)}
					</Text>

					<View className='my-2.5 h-px bg-card-border' />

					<View className='mb-3'>
						<Text className='text-overline text-tinta-2'>
							Detalle de la donación
						</Text>
					</View>

					<View className='flex-row items-center justify-between gap-3 py-2'>
						<Text className='text-body shrink-0 text-tinta-2'>Donación</Text>

						<Text
							className='flex-1 text-right font-sans-bold text-[13px] text-tinta-2'
							numberOfLines={1}
						>
							Aportación al zoológico
						</Text>
					</View>

					<View className='my-2.5 h-px bg-card-border' />

					<View className='flex-row items-center justify-between gap-3 py-2'>
						<Text className='text-body shrink-0 text-tinta-2'>
							Método de pago
						</Text>

						<Text
							className='flex-1 text-right font-sans-bold text-[13px] text-tinta-2'
							numberOfLines={1}
						>
							{paymentMethod}
						</Text>
					</View>

					<View className='my-2.5 h-px bg-card-border' />

					<View className='flex-row items-center justify-between gap-3 py-2'>
						<Text className='text-body shrink-0 text-tinta-2'>Folio</Text>

						<Text
							className='flex-1 text-right font-sans-bold text-[13px] text-tinta-2'
							numberOfLines={1}
							selectable
						>
							#{String(donationReference).replace(/^#/, '')}
						</Text>
					</View>
				</View>

				{/* AGRADECIMIENTO */}
				<View className='mb-4 flex-row items-start gap-[13px] rounded-[20px] bg-hoja p-[18px]'>
					<View className='h-[38px] w-[38px] items-center justify-center rounded-xl bg-esmeralda'>
						<HugeiconsIcon icon={StarIcon} size={24} color={colors.blanco} />
					</View>

					<View className='flex-1'>
						<Text className='text-h3 mb-1.5 text-tinta-2'>
							¡Tu apoyo cuenta!
						</Text>

						<Text className='text-body text-tinta-2'>
							Gracias a personas como tú podemos seguir trabajando en el
							bienestar de los animales y en la conservación de nuestra fauna.
						</Text>
					</View>
				</View>

				<View className='h-3' />
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
