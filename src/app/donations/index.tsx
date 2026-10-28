import AppCard from '@/components/AppCard'
import BackButton from '@/components/BackButton'
import FixedFooter from '@/components/FixedFooter'
import UserHeader from '@/components/UserHeader'
import { HeartIcon } from '@hugeicons/core-free-icons'
import { router } from 'expo-router'
import { useState } from 'react'
import {
	ImageBackground,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import colors from '@/theme/colors'
import { cardShadow } from '@/theme/shadows'

const DONATION_AMOUNTS = [10, 20, 50, 100, 200]
const COLUMN_GAP = 10

export default function DonationsIndexScreen() {
	const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
	const [customAmount, setCustomAmount] = useState('')
	const [isCustomSelected, setIsCustomSelected] = useState(false)
	const [gridWidth, setGridWidth] = useState(0)

	const buttonWidth = gridWidth > 0 ? (gridWidth - COLUMN_GAP * 2) / 3 : 0

	const parsedCustomAmount = Number(customAmount.replace(',', '.'))

	const amount =
		selectedAmount !== null
			? selectedAmount
			: isCustomSelected &&
				  customAmount.trim() !== '' &&
				  Number.isFinite(parsedCustomAmount)
				? parsedCustomAmount
				: 0

	const hasAmount = Number.isFinite(amount) && amount >= 10

	const selectAmount = (value: number) => {
		setSelectedAmount(value)
		setCustomAmount('')
		setIsCustomSelected(false)
	}

	const selectCustomAmount = () => {
		setSelectedAmount(null)
		setIsCustomSelected(true)
	}

	const handleCustomAmount = (value: string) => {
		const sanitizedValue = value.replace(/[^0-9.,]/g, '')

		setCustomAmount(sanitizedValue)
		setSelectedAmount(null)
		setIsCustomSelected(true)
	}

	const continueDonation = () => {
		if (!hasAmount) return

		router.push({
			pathname: '/donations/summary',
			params: {
				amount: amount.toFixed(2),
			},
		})
	}

	const formatCurrency = (value: number) =>
		new Intl.NumberFormat('es-MX', {
			style: 'currency',
			currency: 'MXN',
			minimumFractionDigits: 2,
		}).format(value)

	const renderAmountButton = (
		label: string,
		selected: boolean,
		onPress: () => void,
		dashed = false,
	) => (
		<Pressable
			onPress={onPress}
			className='h-[100px] w-full rounded-2xl active:opacity-[0.84]'
		>
			{dashed ? (
				<View
					className={`flex-1 items-center justify-center rounded-2xl border-2 border-dashed px-1.5 py-3 ${selected ? 'border-[#08783F] bg-[#D6EBDD]' : 'border-[#527764] bg-blanco'}`}
				>
					<Text
						numberOfLines={1}
						adjustsFontSizeToFit
						className='text-center text-[16px] font-extrabold text-[#102E20]'
						style={{ includeFontPadding: false }}
					>
						{label}
					</Text>
				</View>
			) : (
				<View
					className={`flex-1 rounded-2xl p-0.5 ${selected ? 'bg-[#08783F]' : 'bg-[#527764]'}`}
				>
					<View
						className={`flex-1 items-center justify-center rounded-[14px] px-1.5 py-3 ${selected ? 'bg-[#D6EBDD]' : 'bg-blanco'}`}
					>
						<Text
							numberOfLines={1}
							adjustsFontSizeToFit
							className='text-center text-[16px] font-extrabold text-[#102E20]'
							style={{ includeFontPadding: false }}
						>
							{label}
						</Text>
					</View>
				</View>
			)}
		</Pressable>
	)

	const renderAmountColumn = (value: number) => (
		<View key={value} className='shrink-0' style={{ width: buttonWidth }}>
			{renderAmountButton(
				formatCurrency(value),
				selectedAmount === value && !isCustomSelected,
				() => selectAmount(value),
			)}
		</View>
	)

	return (
		<SafeAreaView className='flex-1 bg-blanco' edges={['top', 'left', 'right']}>
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				resizeMode='repeat'
				imageClassName='opacity-[0.025]'
				className='flex-1 bg-blanco'
			>
				<ScrollView
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps='handled'
					contentContainerClassName='px-5 pb-[180px] pt-3'
				>
					{/* ENCABEZADO */}
					<BackButton position='relative' onPress={() => router.back()} />

					<View className='mt-3'>
						<UserHeader
							title='Apoya al zoológico'
							subtitle='Tu donación ayuda a conservar y proteger nuestra fauna.'
							showRewards={false}
						/>
					</View>

					{/* TARJETA INFORMATIVA */}
					<View className='mt-5'>
						<AppCard
							title='Haz la diferencia'
							description='Cada aportación contribuye al cuidado de los animales y a la conservación del zoológico.'
							icon={HeartIcon}
							backgroundColor='#063D22'
							borderColor='#063D22'
							iconColor='#063D22'
							iconBackgroundColor='#B5F451'
							arrowBackgroundColor='#B5F451'
							arrowColor='#063D22'
							textColor={colors.blanco}
							descriptionColor='#D4E8D9'
							showArrow={false}
						/>
					</View>

					{/* SELECCIÓN DE MONTO */}
					<View className='mt-7'>
						<Text className='text-[20px] font-extrabold text-[#063D22]'>
							Selecciona un monto
						</Text>

						<Text className='mb-4 mt-[5px] text-[13px] text-[#315744]'>
							Elige cuánto deseas aportar al cuidado de nuestros animales.
						</Text>

						<View
							onLayout={(event) => {
								const width = event.nativeEvent.layout.width
								setGridWidth((previous) =>
									Math.abs(previous - width) > 1 ? width : previous,
								)
							}}
							className='w-full items-center gap-2.5 self-stretch'
						>
							<View className='w-full flex-row items-center justify-center gap-2.5'>
								{DONATION_AMOUNTS.slice(0, 3).map(renderAmountColumn)}
							</View>

							<View className='w-full flex-row items-center justify-center gap-2.5'>
								{DONATION_AMOUNTS.slice(3).map(renderAmountColumn)}

								<View className='shrink-0' style={{ width: buttonWidth }}>
									{renderAmountButton(
										'Otra cantidad',
										isCustomSelected,
										selectCustomAmount,
										true,
									)}
								</View>
							</View>
						</View>
					</View>

					{/* DONACIÓN PERSONALIZADA */}
					{isCustomSelected && (
						<View className='mt-[18px]'>
							<Text className='mb-2 text-[15px] font-extrabold text-[#102E20]'>
								Ingresa tu donación
							</Text>

							<Text className='mb-3 text-[12px] text-[#315744]'>
								La aportación mínima es de $10.00 MXN.
							</Text>

							<View className='h-[52px] flex-row items-center rounded-xl border-1.5 border-[#08783F] bg-blanco px-3.5'>
								<Text className='mr-2 text-[18px] font-extrabold text-[#08783F]'>
									$
								</Text>

								<TextInput
									value={customAmount}
									onChangeText={handleCustomAmount}
									placeholder='Ej. 150'
									placeholderTextColor='#9AAEA2'
									keyboardType='decimal-pad'
									returnKeyType='done'
									className='h-full flex-1 py-0 text-[16px] font-bold text-[#102E20]'
								/>
							</View>

							{customAmount.trim() !== '' && !hasAmount && (
								<Text className='mt-2 text-[12px] text-error'>
									Ingresa una cantidad válida de al menos $10.00.
								</Text>
							)}
						</View>
					)}

					{/* MÉTODO DE PAGO */}
					<View className='mb-5 mt-[26px]'>
						<Text className='mb-3.5 px-1 text-[20px] font-extrabold text-[#063D22]'>
							Método de pago
						</Text>

						<View
							className='overflow-hidden rounded-[18px] border border-[#B8D5C2] bg-[#EEF5F0]'
							style={cardShadow}
						>
							<View className='min-h-[80px] flex-row items-center bg-[#EEF5F0] px-3.5 py-3'>
								<View className='h-12 w-12 items-center justify-center rounded-2xl border border-[#B8D5C2] bg-[#D6EBDD]'>
									<Text className='text-[23px]'>💳</Text>
								</View>

								<View className='ml-3 flex-1'>
									<Text className='text-[16px] font-extrabold text-[#102E20]'>
										Tarjeta
									</Text>

									<Text className='mt-1 text-[12px] leading-4 text-[#315744]'>
										Pago seguro con tarjeta
									</Text>
								</View>

								<View className='h-[22px] w-[22px] rounded-[11px] border-[6px] border-[#08783F] bg-blanco' />
							</View>
						</View>
					</View>
				</ScrollView>

				{/* FOOTER FIJO */}
				<FixedFooter
					label='Donación'
					description={
						hasAmount
							? 'Monto seleccionado'
							: 'Selecciona un monto para continuar'
					}
					amount={formatCurrency(amount)}
					buttonTitle='Continuar'
					onButtonPress={continueDonation}
					disabled={!hasAmount}
				/>
			</ImageBackground>
		</SafeAreaView>
	)
}
