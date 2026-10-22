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

import {
	DONATION_AMOUNTS,
	DONATION_COLORS,
	DONATION_LAYOUT,
	donationsStyles as styles,
} from '@/styles/donations'

export default function DonationsIndexScreen() {
	const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
	const [customAmount, setCustomAmount] = useState('')
	const [isCustomSelected, setIsCustomSelected] = useState(false)
	const [gridWidth, setGridWidth] = useState(0)

	const buttonWidth =
		gridWidth > 0 ? (gridWidth - DONATION_LAYOUT.columnGap * 2) / 3 : 0

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
			style={({ pressed }) => [
				styles.amountButton,
				{ opacity: pressed ? 0.84 : 1 },
			]}
		>
			{dashed ? (
				<View
					style={[
						styles.amountButtonDashed,
						{
							borderColor: selected
								? DONATION_COLORS.green
								: DONATION_COLORS.borderDark,
							backgroundColor: selected
								? DONATION_COLORS.selectedGreen
								: DONATION_COLORS.white,
						},
					]}
				>
					<Text
						numberOfLines={1}
						adjustsFontSizeToFit
						style={styles.amountButtonText}
					>
						{label}
					</Text>
				</View>
			) : (
				<View
					style={[
						styles.amountButtonOuter,
						{
							backgroundColor: selected
								? DONATION_COLORS.green
								: DONATION_COLORS.borderDark,
						},
					]}
				>
					<View
						style={[
							styles.amountButtonInner,
							{
								backgroundColor: selected
									? DONATION_COLORS.selectedGreen
									: DONATION_COLORS.white,
							},
						]}
					>
						<Text
							numberOfLines={1}
							adjustsFontSizeToFit
							style={styles.amountButtonText}
						>
							{label}
						</Text>
					</View>
				</View>
			)}
		</Pressable>
	)

	const renderAmountColumn = (value: number) => (
		<View key={value} style={[styles.amountColumn, { width: buttonWidth }]}>
			{renderAmountButton(
				formatCurrency(value),
				selectedAmount === value && !isCustomSelected,
				() => selectAmount(value),
			)}
		</View>
	)

	return (
		<SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				resizeMode='repeat'
				imageStyle={styles.backgroundImage}
				style={styles.background}
			>
				<ScrollView
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps='handled'
					contentContainerStyle={[styles.scrollContent, { paddingBottom: 180 }]}
				>
					{/* ENCABEZADO */}
					<BackButton position='relative' onPress={() => router.back()} />

					<View style={styles.headerContainer}>
						<UserHeader
							title='Apoya al zoológico'
							subtitle='Tu donación ayuda a conservar y proteger nuestra fauna.'
							showRewards={false}
						/>
					</View>

					{/* TARJETA INFORMATIVA */}
					<View style={styles.informationCardContainer}>
						<AppCard
							title='Haz la diferencia'
							description='Cada aportación contribuye al cuidado de los animales y a la conservación del zoológico.'
							icon={HeartIcon}
							backgroundColor={DONATION_COLORS.primaryDark}
							borderColor={DONATION_COLORS.primaryDark}
							iconColor={DONATION_COLORS.primaryDark}
							iconBackgroundColor={DONATION_COLORS.lime}
							arrowBackgroundColor={DONATION_COLORS.lime}
							arrowColor={DONATION_COLORS.primaryDark}
							textColor={DONATION_COLORS.white}
							descriptionColor={DONATION_COLORS.description}
							showArrow={false}
						/>
					</View>

					{/* SELECCIÓN DE MONTO */}
					<View style={styles.amountSection}>
						<Text style={styles.sectionTitle}>Selecciona un monto</Text>

						<Text style={styles.sectionDescription}>
							Elige cuánto deseas aportar al cuidado de nuestros animales.
						</Text>

						<View
							onLayout={(event) => {
								const width = event.nativeEvent.layout.width
								setGridWidth((previous) =>
									Math.abs(previous - width) > 1 ? width : previous,
								)
							}}
							style={styles.amountGrid}
						>
							<View style={styles.amountRow}>
								{DONATION_AMOUNTS.slice(0, 3).map(renderAmountColumn)}
							</View>

							<View style={styles.amountRow}>
								{DONATION_AMOUNTS.slice(3).map(renderAmountColumn)}

								<View style={[styles.amountColumn, { width: buttonWidth }]}>
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
						<View style={styles.customAmountSection}>
							<Text style={styles.customAmountTitle}>Ingresa tu donación</Text>

							<Text style={styles.customAmountDescription}>
								La aportación mínima es de $10.00 MXN.
							</Text>

							<View style={styles.customAmountInputContainer}>
								<Text style={styles.currencySymbol}>$</Text>

								<TextInput
									value={customAmount}
									onChangeText={handleCustomAmount}
									placeholder='Ej. 150'
									placeholderTextColor={DONATION_COLORS.placeholder}
									keyboardType='decimal-pad'
									returnKeyType='done'
									style={styles.customAmountInput}
								/>
							</View>

							{customAmount.trim() !== '' && !hasAmount && (
								<Text style={styles.validationError}>
									Ingresa una cantidad válida de al menos $10.00.
								</Text>
							)}
						</View>
					)}

					{/* MÉTODO DE PAGO */}
					<View style={styles.paymentSection}>
						<Text style={styles.paymentSectionTitle}>Método de pago</Text>

						<View style={styles.paymentCard}>
							<View style={styles.paymentRow}>
								<View style={styles.paymentIconContainer}>
									<Text style={styles.paymentEmoji}>💳</Text>
								</View>

								<View style={styles.paymentTextContainer}>
									<Text style={styles.paymentTitle}>Tarjeta</Text>

									<Text style={styles.paymentDescription}>
										Pago seguro con tarjeta
									</Text>
								</View>

								<View style={styles.paymentRadio} />
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
