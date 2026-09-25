import { HeartAddIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { useRouter } from 'expo-router'
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
	amountCardPressedStyle,
	amountCardSelectedStyle,
	amountCardStyle,
	amountGridStyle,
	backButtonPressedStyle,
	backButtonStyle,
	backgroundImageStyle,
	backgroundStyle,
	backTextStyle,
	bottomSpaceStyle,
	containerStyle,
	continueButtonContentStyle,
	continueButtonDisabledStyle,
	continueButtonPressedStyle,
	continueButtonStyle,
	continueButtonTextStyle,
	continueButtonWrapperStyle,
	currencyStyle,
	customCardStyle,
	customTitleStyle,
	footerStyle,
	headerStyle,
	inputStyle,
	inputWrapperActiveStyle,
	inputWrapperStyle,
	introCardStyle,
	introContentStyle,
	introIconStyle,
	introTextStyle,
	introTitleStyle,
	minimumTextStyle,
	paymentCardStyle,
	paymentDescriptionStyle,
	paymentInfoStyle,
	paymentMethodStyle,
	paymentNameStyle,
	paymentTitleStyle,
	scrollContentStyle,
	sectionTitleStyle,
	selectedLabelStyle,
	subtitleStyle,
	titleIconStyle,
	titleRowStyle,
	titleStyle,
	titleTextContainerStyle,
	totalContainerStyle,
	totalDescriptionStyle,
	totalLabelStyle,
	totalStyle,
} from '@/styles/donations'

const COLORS = {
	primary: '#075C3B',
	dark: '#17372C',
	white: '#FFFFFF',
	card: '#DDF5EA',
	cardLight: '#E8F7F0',
	active: '#BDEED9',
	border: '#B8E6D3',
	muted: '#557067',
}

const DONATION_AMOUNTS = [10, 20, 50, 100, 200]

export default function DonationsIndexScreen() {
	const router = useRouter()

	const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
	const [customAmount, setCustomAmount] = useState('')

	const customValue = Number(customAmount.replace(',', '.'))

	const amount =
		selectedAmount !== null
			? selectedAmount
			: Number.isFinite(customValue) && customValue > 0
				? customValue
				: 0

	const hasAmount = amount >= 10

	const selectAmount = (value: number) => {
		setSelectedAmount(value)
		setCustomAmount('')
	}

	const handleCustomAmount = (value: string) => {
		const normalized = value.replace(/[^0-9.,]/g, '')

		setCustomAmount(normalized)
		setSelectedAmount(null)
	}

	const continueDonation = () => {
		if (!hasAmount) {
			return
		}

		router.push({
			pathname: '/donations/summary',
			params: {
				amount: amount.toFixed(2),
			},
		})
	}

	return (
		<SafeAreaView style={containerStyle}>
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				style={backgroundStyle}
				imageStyle={backgroundImageStyle}
				resizeMode='repeat'
			>
				<View style={backButtonStyle}>
					<Pressable
						onPress={() => router.back()}
						style={({ pressed }) => [
							backButtonStyle,
							pressed && backButtonPressedStyle,
						]}
					>
						<Text style={backTextStyle}>‹ Regresar</Text>
					</Pressable>
				</View>

				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={scrollContentStyle}
				>
					<View style={headerStyle}>
						<View style={titleRowStyle}>
							<View style={titleIconStyle}>
								<HugeiconsIcon
									icon={HeartAddIcon}
									size={27}
									color={COLORS.primary}
									strokeWidth={1.8}
								/>
							</View>

							<View style={titleTextContainerStyle}>
								<Text style={titleStyle}>Apoya al zoológico</Text>

								<Text style={subtitleStyle}>
									Tu donación ayuda a conservar y proteger nuestra fauna.
								</Text>
							</View>
						</View>
					</View>

					<View style={introCardStyle}>
						<View style={introIconStyle}>
							<HugeiconsIcon
								icon={HeartAddIcon}
								size={27}
								color={COLORS.primary}
								strokeWidth={1.8}
							/>
						</View>

						<View style={introContentStyle}>
							<Text style={introTitleStyle}>Haz la diferencia</Text>

							<Text style={introTextStyle}>
								Cada aportación contribuye al cuidado de los animales y a la
								conservación del zoológico.
							</Text>
						</View>
					</View>

					<Text style={sectionTitleStyle}>Selecciona un monto</Text>

					<View style={amountGridStyle}>
						{DONATION_AMOUNTS.map((value) => {
							const selected = selectedAmount === value

							return (
								<Pressable
									key={value}
									onPress={() => selectAmount(value)}
									style={({ pressed }) => [
										amountCardStyle,
										selected && amountCardSelectedStyle,
										pressed && amountCardPressedStyle,
									]}
								>
									<Text
										style={totalStyle}
										numberOfLines={1}
										adjustsFontSizeToFit
									>
										${value.toFixed(2)}
									</Text>

									{selected && (
										<Text style={selectedLabelStyle}>Seleccionado</Text>
									)}
								</Pressable>
							)
						})}
					</View>

					<View style={customCardStyle}>
						<Text style={customTitleStyle}>Otra cantidad</Text>

						<View
							style={[
								inputWrapperStyle,
								customAmount.length > 0 && inputWrapperActiveStyle,
							]}
						>
							<Text style={currencyStyle}>$</Text>

							<TextInput
								value={customAmount}
								onChangeText={handleCustomAmount}
								placeholder='Escribe el monto'
								placeholderTextColor={COLORS.muted}
								keyboardType='decimal-pad'
								style={inputStyle}
								maxLength={8}
							/>
						</View>

						<Text style={minimumTextStyle}>Donación mínima: $10.00 MXN</Text>
					</View>

					<View style={paymentCardStyle}>
						<Text style={paymentTitleStyle}>Método de pago</Text>

						<View style={paymentMethodStyle}>
							<View style={paymentInfoStyle}>
								<Text style={paymentNameStyle}>Tarjeta</Text>

								<Text style={paymentDescriptionStyle}>
									Pago seguro con tarjeta
								</Text>
							</View>
						</View>
					</View>

					<View style={bottomSpaceStyle} />
				</ScrollView>

				<View style={footerStyle}>
					<View style={totalContainerStyle}>
						<View>
							<Text style={totalLabelStyle}>Donación</Text>

							<Text style={totalDescriptionStyle}>
								{hasAmount ? 'Monto seleccionado' : 'Selecciona un monto'}
							</Text>
						</View>

						<Text style={totalStyle} numberOfLines={1} adjustsFontSizeToFit>
							${amount.toFixed(2)}
						</Text>
					</View>

					<View
						style={[
							continueButtonWrapperStyle,
							!hasAmount && continueButtonDisabledStyle,
						]}
					>
						<Pressable
							disabled={!hasAmount}
							onPress={continueDonation}
							style={({ pressed }) => [
								continueButtonStyle,
								pressed && hasAmount && continueButtonPressedStyle,
							]}
						>
							<View style={continueButtonContentStyle}>
								<Text style={continueButtonTextStyle}>Continuar</Text>
							</View>
						</Pressable>
					</View>
				</View>
			</ImageBackground>
		</SafeAreaView>
	)
}
