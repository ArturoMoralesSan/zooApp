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

type PaymentMethodData = {
	id?: number | string
	name?: string | null
	code?: string | null
}

type DonationData = {
	id?: number | string | null
	amount?: number | string | null
	payment_method?: string | PaymentMethodData | null
	paymentMethod?: string | PaymentMethodData | null
	status?: string | null
	created_at?: string | null
	createdAt?: string | null
	reference?: string | null
	folio?: string | null
}

function formatCurrency(value: number | string | null | undefined) {
	const amount = Number(value ?? 0)

	return new Intl.NumberFormat('es-MX', {
		style: 'currency',
		currency: 'MXN',
		minimumFractionDigits: 2,
	}).format(Number.isFinite(amount) ? amount : 0)
}

function getPaymentMethod(
	method: string | PaymentMethodData | null | undefined,
) {
	if (!method) return 'Tarjeta'

	if (typeof method === 'string') return method

	return method.name || method.code || 'Tarjeta'
}

export default function DonationSuccessScreen() {
	const params = useLocalSearchParams<{
		donation?: string
		amount?: string
		id?: string
		folio?: string
		reference?: string
	}>()

	const donation = useMemo<DonationData>(() => {
		if (params.donation) {
			try {
				const parsed = JSON.parse(params.donation)

				if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
					return parsed as DonationData
				}
			} catch {
				// Si el parámetro no es JSON válido, usamos los parámetros individuales.
			}
		}

		return {
			amount: params.amount,
			id: params.id,
			folio: params.folio,
			reference: params.reference,
		}
	}, [
		params.donation,
		params.amount,
		params.id,
		params.folio,
		params.reference,
	])

	const amount = donation.amount ?? params.amount ?? 0

	const donationReference =
		donation.folio ||
		donation.reference ||
		donation.id ||
		params.folio ||
		params.reference ||
		params.id ||
		'Registrada correctamente'

	const paymentMethod = getPaymentMethod(
		donation.payment_method ?? donation.paymentMethod,
	)

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
					<View className='mb-4 items-center justify-center rounded-3xl bg-[#063D1E] px-[22px] py-[30px]'>
						<View className='mb-[18px] h-[78px] w-[78px] items-center justify-center rounded-[39px] bg-[rgba(184,243,93,0.13)]'>
							<HugeiconsIcon
								icon={CheckmarkCircle02Icon}
								size={46}
								color='#B8F35D'
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
					<View className='mb-4 rounded-[22px] border border-[#AECCBD] bg-niebla p-5'>
						<View className='mb-2'>
							<Text className='text-[14px] font-semibold text-[#1E4930]'>
								Monto donado
							</Text>
						</View>

						<Text className='text-[34px] font-extrabold tracking-[-0.7px] text-[#1E4930]'>
							{formatCurrency(amount)}
						</Text>

						<View className='my-2.5 h-px bg-[#D5E5DD]' />

						<View className='mb-3'>
							<Text className='text-[18px] font-extrabold text-[#1E4930]'>
								Detalle de la donación
							</Text>
						</View>

						<View className='flex-row items-center justify-between gap-3 py-2'>
							<Text className='shrink-0 text-[13px] text-[#1E4930]'>
								Donación
							</Text>

							<Text
								className='flex-1 text-right text-[13px] font-bold text-[#1E4930]'
								numberOfLines={1}
							>
								Aportación al zoológico
							</Text>
						</View>

						<View className='my-2.5 h-px bg-[#D5E5DD]' />

						<View className='flex-row items-center justify-between gap-3 py-2'>
							<Text className='shrink-0 text-[13px] text-[#1E4930]'>
								Método de pago
							</Text>

							<Text
								className='flex-1 text-right text-[13px] font-bold text-[#1E4930]'
								numberOfLines={1}
							>
								{paymentMethod}
							</Text>
						</View>

						<View className='my-2.5 h-px bg-[#D5E5DD]' />

						<View className='flex-row items-center justify-between gap-3 py-2'>
							<Text className='shrink-0 text-[13px] text-[#1E4930]'>Folio</Text>

							<Text
								className='flex-1 text-right text-[13px] font-bold text-[#1E4930]'
								numberOfLines={1}
								selectable
							>
								#{String(donationReference).replace(/^#/, '')}
							</Text>
						</View>
					</View>

					{/* AGRADECIMIENTO */}
					<View className='mb-4 flex-row items-start gap-[13px] rounded-[20px] bg-hoja p-[18px]'>
						<View className='h-[38px] w-[38px] items-center justify-center rounded-xl bg-[#087137]'>
							<HugeiconsIcon icon={StarIcon} size={24} color={colors.blanco} />
						</View>

						<View className='flex-1'>
							<Text className='mb-1.5 text-[15px] font-extrabold text-[#36634C]'>
								¡Tu apoyo cuenta!
							</Text>

							<Text className='text-[13px] leading-5 text-[#36634C]'>
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
