import { KeyboardScrollView } from '@/components/ui/KeyboardScrollView'
import { IconBox } from '@/components/ui/IconBox'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import colors from '@/theme/colors'
import { OptionButton } from '@/components/ui/OptionButton'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { TextField } from '@/components/ui/TextField'
import FixedFooter from '@/components/FixedFooter'
import { ScreenHeader } from '@/components/ui/TabHeader'
import {
	CreditCardIcon,
	Dollar01Icon,
	HeartIcon,
} from '@hugeicons/core-free-icons'
import { router } from 'expo-router'
import { useState } from 'react'
import { Text, View } from 'react-native'

import { formatCurrency } from '@/utils/format'
import { useFixedFooterSpace } from '@/theme/layout'
import { ScreenBackground } from '@/components/ui/ScreenBackground'
import { useScrolled } from '@/hooks/useScrolled'

const DONATION_AMOUNTS = [10, 20, 50, 100, 200]

export default function DonationsIndexScreen() {
	const { scrolled, onScroll } = useScrolled()
	const footerSpace = useFixedFooterSpace()
	const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
	const [customAmount, setCustomAmount] = useState('')
	const [isCustomSelected, setIsCustomSelected] = useState(false)

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

	return (
		<ScreenBackground>
			{/* ENCABEZADO FIJO */}
			<ScreenHeader
				scrolled={scrolled}
				onBack={() => router.back()}
				title='Apoya al zoológico'
				subtitle='Tu donación ayuda a conservar y proteger nuestra fauna.'
			/>

			<KeyboardScrollView
				onScroll={onScroll}
				scrollEventThrottle={16}
				contentContainerClassName='px-5 pt-4'
				contentContainerStyle={{ paddingBottom: footerSpace }}
			>
				{/* TARJETA INFORMATIVA */}
				{/* One-off A-38 banner: text on Bosque with a large outline heart. */}
				<Card tone='dark' padding='md' className='mb-3'>
					<View className='absolute right-3 top-3' pointerEvents='none'>
						<Icon icon={HeartIcon} size={64} color={colors.esmeralda} />
					</View>

					<View className='pr-16'>
						<Text className='text-h3 text-blanco'>Haz la diferencia</Text>
						<Text className='text-body mt-1 text-hoja'>
							Cada aportación contribuye al cuidado de los animales y a la
							conservación del zoológico.
						</Text>
					</View>
				</Card>

				{/* SELECCIÓN DE MONTO */}
				<View className='mt-6'>
					<SectionTitle
						title='Selecciona un monto'
						subtitle='Elige cuánto deseas aportar al cuidado de nuestros animales.'
					/>

					<View className='flex-row flex-wrap gap-2'>
						{DONATION_AMOUNTS.map((value) => (
							<OptionButton
								key={value}
								label={formatCurrency(value)}
								selected={selectedAmount === value && !isCustomSelected}
								onPress={() => selectAmount(value)}
								className='grow basis-[30%]'
							/>
						))}

						<OptionButton
							label='Otra'
							accessibilityLabel='Otra cantidad'
							dashed
							selected={isCustomSelected}
							onPress={selectCustomAmount}
							className='grow basis-[30%]'
						/>
					</View>
				</View>

				{/* DONACIÓN PERSONALIZADA */}
				{isCustomSelected && (
					<TextField
						label='Otra cantidad'
						icon={Dollar01Icon}
						value={customAmount}
						onChangeText={handleCustomAmount}
						placeholder='Escribe el monto'
						keyboardType='decimal-pad'
						returnKeyType='done'
						error={
							customAmount.trim() !== '' && !hasAmount
								? 'Ingresa una cantidad válida de al menos $10.00.'
								: undefined
						}
					/>
				)}

				{isCustomSelected && (customAmount.trim() === '' || hasAmount) && (
					<Text className='text-meta mt-1.5'>Donación mínima: $10.00 MXN</Text>
				)}

				{/* MÉTODO DE PAGO */}
				<View className='mb-5 mt-6'>
					<SectionTitle title='Método de pago' />

					<OptionButton
						selected
						onPress={() => {}}
						accessibilityLabel='Tarjeta'
					>
						<View className='flex-row items-center gap-3'>
							<IconBox icon={CreditCardIcon} />

							<View className='flex-1'>
								<Text className='text-h3 text-tinta'>Tarjeta</Text>
								<Text className='text-meta mt-1'>Pago seguro con tarjeta</Text>
							</View>

							{/* Radio: ring plus dot, so the choice doesn't rely on color. */}
							<View className='h-6 w-6 items-center justify-center rounded-full border-2 border-esmeralda bg-blanco'>
								<View className='h-3 w-3 rounded-full bg-esmeralda' />
							</View>
						</View>
					</OptionButton>
				</View>
			</KeyboardScrollView>

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
		</ScreenBackground>
	)
}
