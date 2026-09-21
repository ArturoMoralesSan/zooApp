import { ArrowRight01Icon, HeartAddIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import {
	ImageBackground,
	Pressable,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from 'react-native'

const COLORS = {
	background: '#F7F9F8',
	primary: '#075C3B',
	primaryLight: '#16845D',
	dark: '#17372C',
	muted: '#557067',
	card: '#DDF5EA',
	cardLight: '#E8F7F0',
	active: '#BDEED9',
	border: '#B8E6D3',
	white: '#FFFFFF',

	button: '#246F4C',
	buttonPressed: '#1D5C3F',

	footerBackground: '#F7F9F8',
}

const cardShadow = {
	shadowColor: '#075C3B',
	shadowOffset: { width: 0, height: 5 },
	shadowOpacity: 0.12,
	shadowRadius: 10,
	elevation: 4,
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
		<SafeAreaView style={styles.container}>
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				style={styles.background}
				className='flex-1'
				resizeMode='repeat'
				imageStyle={{ opacity: 0.3 }}
			>
				<View style={styles.backButtonWrapper}>
					<Pressable
						onPress={() => router.back()}
						className='flex-row items-center rounded-[18px] px-4 py-2.5'
						style={({ pressed }) => ({
							backgroundColor: pressed ? COLORS.card : COLORS.cardLight,
							borderWidth: 1,
							borderColor: COLORS.border,
							shadowColor: COLORS.primary,
							shadowOffset: { width: 0, height: 3 },
							shadowOpacity: 0.1,
							shadowRadius: 7,
							elevation: 3,
							opacity: pressed ? 0.75 : 1,
						})}
					>
						<Text
							className='mr-1 text-lg font-bold'
							style={{ color: COLORS.primary }}
						>
							‹
						</Text>

						<Text
							className='text-base font-semibold'
							style={{ color: COLORS.dark }}
						>
							Regresar
						</Text>
					</Pressable>
				</View>

				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.scrollContent}
				>
					<View style={styles.header}>
						<View style={styles.titleRow}>
							<View style={styles.titleIcon}>
								<HugeiconsIcon
									icon={HeartAddIcon}
									size={27}
									color={COLORS.primary}
									strokeWidth={1.8}
								/>
							</View>

							<View style={styles.titleTextContainer}>
								<Text style={styles.title}>Apoya al zoológico</Text>

								<Text style={styles.subtitle}>
									Tu donación ayuda a conservar y proteger nuestra fauna.
								</Text>
							</View>
						</View>
					</View>

					<View style={styles.introCard}>
						<View style={styles.introIcon}>
							<HugeiconsIcon
								icon={HeartAddIcon}
								size={27}
								color={COLORS.primary}
								strokeWidth={1.8}
							/>
						</View>

						<View style={styles.introContent}>
							<Text style={styles.introTitle}>Haz la diferencia</Text>

							<Text style={styles.introText}>
								Cada aportación contribuye al cuidado de los animales y a la
								conservación del zoológico.
							</Text>
						</View>
					</View>

					<Text style={styles.sectionTitle}>Selecciona un monto</Text>

					<View style={styles.amountGrid}>
						{DONATION_AMOUNTS.map((value) => {
							const selected = selectedAmount === value

							return (
								<Pressable
									key={value}
									onPress={() => selectAmount(value)}
									style={({ pressed }) => [
										styles.amountCard,
										selected && styles.amountCardSelected,
										pressed && styles.amountCardPressed,
									]}
								>
									<Text
										style={styles.amountText}
										numberOfLines={1}
										adjustsFontSizeToFit
									>
										${value.toFixed(2)}
									</Text>

									{selected && (
										<Text style={styles.selectedLabel}>Seleccionado</Text>
									)}
								</Pressable>
							)
						})}
					</View>

					<View style={styles.customCard}>
						<Text style={styles.customTitle}>Otra cantidad</Text>

						<View
							style={[
								styles.inputWrapper,
								customAmount.length > 0 && styles.inputWrapperActive,
							]}
						>
							<Text style={styles.currency}>$</Text>

							<TextInput
								value={customAmount}
								onChangeText={handleCustomAmount}
								placeholder='Escribe el monto'
								placeholderTextColor={COLORS.muted}
								keyboardType='decimal-pad'
								style={styles.input}
								maxLength={8}
							/>
						</View>

						<Text style={styles.minimumText}>Donación mínima: $10.00 MXN</Text>
					</View>

					<View style={styles.paymentCard}>
						<Text style={styles.paymentTitle}>Método de pago</Text>

						<View style={styles.paymentMethod}>
							<View style={styles.paymentIcon}>
								<Text style={styles.paymentIconText}>💳</Text>
							</View>

							<View style={styles.paymentInfo}>
								<Text style={styles.paymentName}>Tarjeta</Text>

								<Text style={styles.paymentDescription}>
									Pago seguro con tarjeta
								</Text>
							</View>

							<View style={styles.paymentCheck}>
								<Text style={styles.paymentCheckText}>✓</Text>
							</View>
						</View>
					</View>

					<View style={styles.bottomSpace} />
				</ScrollView>

				<View style={styles.footer}>
					<View style={styles.totalContainer}>
						<View>
							<Text style={styles.totalLabel}>Donación</Text>

							<Text style={styles.totalDescription}>
								{hasAmount ? 'Monto seleccionado' : 'Selecciona un monto'}
							</Text>
						</View>

						<Text style={styles.total} numberOfLines={1} adjustsFontSizeToFit>
							${amount.toFixed(2)}
						</Text>
					</View>

					<View
						style={[
							styles.continueButtonWrapper,
							!hasAmount && styles.continueButtonDisabled,
						]}
					>
						<Pressable
							disabled={!hasAmount}
							onPress={continueDonation}
							style={({ pressed }) => [
								styles.continueButton,
								pressed && hasAmount && styles.continueButtonPressed,
							]}
						>
							<View style={styles.continueButtonContent}>
								<Text style={styles.continueButtonText}>Continuar</Text>

								<HugeiconsIcon
									icon={ArrowRight01Icon}
									size={21}
									color={COLORS.white}
									strokeWidth={2}
								/>
							</View>
						</Pressable>
					</View>
				</View>
			</ImageBackground>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
	},

	background: {
		flex: 1,
	},

	backButtonWrapper: {
		position: 'absolute',
		left: 20,
		top: 56,
		zIndex: 20,
	},

	scrollContent: {
		paddingHorizontal: 20,
		paddingTop: 125,
		paddingBottom: 180,
	},

	header: {
		marginBottom: 20,
	},

	titleRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},

	titleIcon: {
		width: 52,
		height: 52,
		borderRadius: 17,
		backgroundColor: COLORS.active,
		borderWidth: 1,
		borderColor: COLORS.border,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 13,
	},

	titleTextContainer: {
		flex: 1,
		minWidth: 0,
	},

	title: {
		fontSize: 27,
		fontWeight: '900',
		color: COLORS.dark,
	},

	subtitle: {
		marginTop: 4,
		fontSize: 14,
		lineHeight: 20,
		color: COLORS.muted,
	},

	introCard: {
		width: '100%',
		backgroundColor: COLORS.cardLight,
		borderRadius: 25,
		padding: 17,
		marginBottom: 20,
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: COLORS.border,
		...cardShadow,
	},

	introIcon: {
		width: 54,
		height: 54,
		borderRadius: 18,
		backgroundColor: COLORS.active,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: COLORS.border,
		marginRight: 14,
	},

	introContent: {
		flex: 1,
		minWidth: 0,
	},

	introTitle: {
		fontSize: 17,
		fontWeight: '900',
		color: COLORS.dark,
	},

	introText: {
		marginTop: 4,
		fontSize: 13,
		lineHeight: 18,
		color: COLORS.muted,
	},

	sectionTitle: {
		marginBottom: 12,
		fontSize: 16,
		fontWeight: '900',
		color: COLORS.dark,
	},

	amountGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		marginBottom: 17,
	},

	amountCard: {
		width: '31.5%',
		minHeight: 82,
		marginBottom: 11,
		borderRadius: 21,
		backgroundColor: COLORS.cardLight,
		borderWidth: 1,
		borderColor: COLORS.border,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 8,
		...cardShadow,
	},

	amountCardSelected: {
		backgroundColor: COLORS.active,
		borderColor: COLORS.primary,
		borderWidth: 2,
	},

	amountCardPressed: {
		opacity: 0.75,
	},

	amountText: {
		fontSize: 21,
		fontWeight: '900',
		color: COLORS.primary,
	},

	selectedLabel: {
		marginTop: 3,
		fontSize: 9,
		fontWeight: '800',
		color: COLORS.primary,
	},

	customCard: {
		backgroundColor: COLORS.cardLight,
		borderRadius: 25,
		padding: 17,
		marginBottom: 17,
		borderWidth: 1,
		borderColor: COLORS.border,
	},

	customTitle: {
		fontSize: 15,
		fontWeight: '900',
		color: COLORS.dark,
		marginBottom: 11,
	},

	inputWrapper: {
		height: 52,
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: COLORS.white,
		borderWidth: 1,
		borderColor: COLORS.border,
		borderRadius: 16,
		paddingHorizontal: 15,
	},

	inputWrapperActive: {
		borderColor: COLORS.primary,
		borderWidth: 2,
	},

	currency: {
		fontSize: 18,
		fontWeight: '900',
		color: COLORS.primary,
		marginRight: 7,
	},

	input: {
		flex: 1,
		height: '100%',
		fontSize: 16,
		fontWeight: '700',
		color: COLORS.dark,
	},

	minimumText: {
		marginTop: 7,
		fontSize: 11,
		color: COLORS.muted,
	},

	paymentCard: {
		backgroundColor: COLORS.cardLight,
		borderRadius: 25,
		padding: 17,
		borderWidth: 1,
		borderColor: COLORS.border,
	},

	paymentTitle: {
		fontSize: 15,
		fontWeight: '900',
		color: COLORS.dark,
		marginBottom: 12,
	},

	paymentMethod: {
		minHeight: 64,
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: COLORS.white,
		borderRadius: 18,
		borderWidth: 1,
		borderColor: COLORS.border,
		paddingHorizontal: 12,
		paddingVertical: 10,
	},

	paymentIcon: {
		width: 42,
		height: 42,
		borderRadius: 13,
		backgroundColor: COLORS.active,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 11,
	},

	paymentIconText: {
		fontSize: 20,
	},

	paymentInfo: {
		flex: 1,
		minWidth: 0,
	},

	paymentName: {
		fontSize: 14,
		fontWeight: '900',
		color: COLORS.dark,
	},

	paymentDescription: {
		marginTop: 2,
		fontSize: 11,
		color: COLORS.muted,
	},

	paymentCheck: {
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: COLORS.primary,
		alignItems: 'center',
		justifyContent: 'center',
	},

	paymentCheckText: {
		color: COLORS.white,
		fontSize: 16,
		fontWeight: '900',
	},

	bottomSpace: {
		height: 40,
	},

	footer: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: COLORS.footerBackground,
		paddingHorizontal: 20,
		paddingTop: 14,
		paddingBottom: 25,
		borderTopWidth: 1,
		borderTopColor: COLORS.border,
		...cardShadow,
	},

	totalContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},

	totalLabel: {
		fontSize: 14,
		fontWeight: '800',
		color: COLORS.muted,
	},

	totalDescription: {
		marginTop: 2,
		fontSize: 11,
		color: COLORS.muted,
	},

	total: {
		fontSize: 23,
		fontWeight: '900',
		color: COLORS.primary,
		maxWidth: 150,
	},

	continueButtonWrapper: {
		width: '100%',
		height: 54,
		borderRadius: 17,
		backgroundColor: COLORS.button,
		borderWidth: 1,
		borderColor: COLORS.button,
		overflow: 'hidden',
		...cardShadow,
	},

	continueButton: {
		width: '100%',
		height: '100%',
		alignItems: 'center',
		justifyContent: 'center',
	},

	continueButtonContent: {
		width: '100%',
		height: '100%',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
	},

	continueButtonPressed: {
		backgroundColor: COLORS.buttonPressed,
	},

	continueButtonDisabled: {
		opacity: 0.45,
	},

	continueButtonText: {
		color: COLORS.white,
		fontSize: 16,
		fontWeight: '900',
		textAlign: 'center',
	},
})
