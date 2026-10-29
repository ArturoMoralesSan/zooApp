import { CheckmarkCircle02Icon, StarIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useMemo } from 'react'
import { ImageBackground, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import BackButton from '@/components/BackButton'
import FixedFooter from '@/components/FixedFooter'
import UserHeader from '@/components/UserHeader'
import colors from '@/theme/colors'
import type { Donation, PaymentMethod } from '@/types/donations'
import { formatCurrency } from '@/utils/format'

function getPaymentMethod(method: PaymentMethod | null | undefined) {
	return method?.name || method?.code || 'Tarjeta'
}

export default function DonationSuccessScreen() {
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
		<SafeAreaView className='flex-1 bg-blanco' edges={['top', 'left', 'right']}>
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				className='flex-1 bg-blanco'
				imageClassName='opacity-[0.13]'
				resizeMode='repeat'
			>
				<ScrollView
					className='flex-1'
					contentContainerClassName='px-5 pb-6 pt-2.5'
					showsVerticalScrollIndicator={false}
				>
					<View className='mb-5 gap-3'>
						<BackButton position='relative' onPress={() => router.back()} />

						<UserHeader
							title='Donación realizada'
							subtitle='Gracias por apoyar el cuidado de las especies.'
							showRewards={false}
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

						<Text className='mb-2.5 text-center text-[25px] font-extrabold text-blanco'>
							¡Donación realizada!
						</Text>

						<Text className='text-center text-[14px] leading-[22px] text-blanco opacity-[0.94]'>
							Gracias por apoyar al Zoológico Sahuatoba.
						</Text>
					</View>

					{/* MONTO DONADO Y DETALLE */}
					<View className='mb-4 rounded-[22px] border border-card-border bg-niebla p-5'>
						<View className='mb-2'>
							<Text className='text-[14px] font-semibold text-tinta-2'>
								Monto donado
							</Text>
						</View>

						<Text className='text-[34px] font-extrabold tracking-[-0.7px] text-tinta-2'>
							{formatCurrency(amount)}
						</Text>

						<View className='my-2.5 h-px bg-card-border' />

						<View className='mb-3'>
							<Text className='text-[18px] font-extrabold text-tinta-2'>
								Detalle de la donación
							</Text>
						</View>

						<View className='flex-row items-center justify-between gap-3 py-2'>
							<Text className='shrink-0 text-[13px] text-tinta-2'>
								Donación
							</Text>

							<Text
								className='flex-1 text-right text-[13px] font-bold text-tinta-2'
								numberOfLines={1}
							>
								Aportación al zoológico
							</Text>
						</View>

						<View className='my-2.5 h-px bg-card-border' />

						<View className='flex-row items-center justify-between gap-3 py-2'>
							<Text className='shrink-0 text-[13px] text-tinta-2'>
								Método de pago
							</Text>

							<Text
								className='flex-1 text-right text-[13px] font-bold text-tinta-2'
								numberOfLines={1}
							>
								{paymentMethod}
							</Text>
						</View>

						<View className='my-2.5 h-px bg-card-border' />

						<View className='flex-row items-center justify-between gap-3 py-2'>
							<Text className='shrink-0 text-[13px] text-tinta-2'>Folio</Text>

							<Text
								className='flex-1 text-right text-[13px] font-bold text-tinta-2'
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
							<Text className='mb-1.5 text-[15px] font-extrabold text-tinta-2'>
								¡Tu apoyo cuenta!
							</Text>

							<Text className='text-[13px] leading-5 text-tinta-2'>
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
			</ImageBackground>
		</SafeAreaView>
	)
}
