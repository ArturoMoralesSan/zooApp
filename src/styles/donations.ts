import { StyleSheet } from 'react-native'

export const DONATION_COLORS = {
	green: '#08783F',
	lightGreen: '#EEF5F0',
	selectedGreen: '#D6EBDD',
	lime: '#B5F451',
	white: '#FFFFFF',
	muted: '#315744',
	border: '#B8D5C2',
	borderDark: '#527764',
	text: '#102E20',
	primaryDark: '#063D22',
	placeholder: '#9AAEA2',
	error: '#B42318',
	description: '#D4E8D9',
	shadow: '#164A2C',
} as const

export const DONATION_AMOUNTS = [10, 20, 50, 100, 200]

export const DONATION_LAYOUT = {
	buttonHeight: 100,
	buttonRadius: 16,
	buttonBorderWidth: 2,
	columnGap: 10,
	horizontalPadding: 20,
} as const

export const donationsStyles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: DONATION_COLORS.white,
	},

	background: {
		flex: 1,
		backgroundColor: DONATION_COLORS.white,
	},

	backgroundImage: {
		opacity: 0.025,
	},

	scrollContent: {
		paddingHorizontal: DONATION_LAYOUT.horizontalPadding,
		paddingTop: 12,
		paddingBottom: 28,
	},

	headerContainer: {
		marginTop: 12,
	},

	informationCardContainer: {
		marginTop: 20,
	},

	amountSection: {
		marginTop: 28,
	},

	sectionTitle: {
		fontSize: 20,
		fontWeight: '800',
		color: DONATION_COLORS.primaryDark,
	},

	sectionDescription: {
		fontSize: 13,
		color: DONATION_COLORS.muted,
		marginTop: 5,
		marginBottom: 16,
	},

	amountGrid: {
		width: '100%',
		alignSelf: 'stretch',
		alignItems: 'center',
		gap: DONATION_LAYOUT.columnGap,
	},

	amountRow: {
		width: '100%',
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		gap: DONATION_LAYOUT.columnGap,
	},

	amountColumn: {
		flexShrink: 0,
	},

	amountButton: {
		width: '100%',
		height: DONATION_LAYOUT.buttonHeight,
		borderRadius: DONATION_LAYOUT.buttonRadius,
	},

	amountButtonContent: {
		flex: 1,
		borderRadius: DONATION_LAYOUT.buttonRadius,
		borderWidth: DONATION_LAYOUT.buttonBorderWidth,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 6,
		paddingVertical: 12,
	},

	amountButtonDashed: {
		flex: 1,
		borderRadius: DONATION_LAYOUT.buttonRadius,
		borderWidth: 2,
		borderStyle: 'dashed',
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 6,
		paddingVertical: 12,
	},

	amountButtonOuter: {
		flex: 1,
		padding: DONATION_LAYOUT.buttonBorderWidth,
		borderRadius: DONATION_LAYOUT.buttonRadius,
	},

	amountButtonInner: {
		flex: 1,
		paddingHorizontal: 6,
		paddingVertical: 12,
		borderRadius:
			DONATION_LAYOUT.buttonRadius - DONATION_LAYOUT.buttonBorderWidth,
		backgroundColor: DONATION_COLORS.white,
		alignItems: 'center',
		justifyContent: 'center',
	},

	amountButtonText: {
		color: DONATION_COLORS.text,
		fontSize: 16,
		fontWeight: '800',
		textAlign: 'center',
		includeFontPadding: false,
	},

	customAmountSection: {
		marginTop: 18,
	},

	customAmountTitle: {
		color: DONATION_COLORS.text,
		fontSize: 15,
		fontWeight: '800',
		marginBottom: 8,
	},

	customAmountDescription: {
		color: DONATION_COLORS.muted,
		fontSize: 12,
		marginBottom: 12,
	},

	customAmountInputContainer: {
		height: 52,
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1.5,
		borderColor: DONATION_COLORS.green,
		borderRadius: 12,
		paddingHorizontal: 14,
		backgroundColor: DONATION_COLORS.white,
	},

	currencySymbol: {
		fontSize: 18,
		fontWeight: '800',
		color: DONATION_COLORS.green,
		marginRight: 8,
	},

	customAmountInput: {
		flex: 1,
		height: '100%',
		color: DONATION_COLORS.text,
		fontSize: 16,
		fontWeight: '700',
		paddingVertical: 0,
	},

	validationError: {
		color: DONATION_COLORS.error,
		fontSize: 12,
		marginTop: 8,
	},

	paymentSection: {
		marginTop: 26,
		marginBottom: 20,
	},

	paymentSectionTitle: {
		marginBottom: 14,
		paddingHorizontal: 4,
		fontSize: 20,
		fontWeight: '800',
		color: DONATION_COLORS.primaryDark,
	},

	paymentCard: {
		backgroundColor: DONATION_COLORS.lightGreen,
		borderWidth: 1,
		borderColor: DONATION_COLORS.border,
		borderRadius: 18,
		overflow: 'hidden',
		shadowColor: DONATION_COLORS.shadow,
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.04,
		shadowRadius: 4,
		elevation: 1,
	},

	paymentRow: {
		minHeight: 80,
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 14,
		paddingVertical: 12,
		backgroundColor: DONATION_COLORS.lightGreen,
	},

	paymentIconContainer: {
		width: 48,
		height: 48,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 16,
		backgroundColor: DONATION_COLORS.selectedGreen,
		borderWidth: 1,
		borderColor: DONATION_COLORS.border,
	},

	paymentEmoji: {
		fontSize: 23,
	},

	paymentTextContainer: {
		flex: 1,
		marginLeft: 12,
	},

	paymentTitle: {
		color: DONATION_COLORS.text,
		fontSize: 16,
		fontWeight: '800',
	},

	paymentDescription: {
		color: DONATION_COLORS.muted,
		fontSize: 12,
		lineHeight: 16,
		marginTop: 4,
	},

	paymentRadio: {
		width: 22,
		height: 22,
		borderRadius: 11,
		borderWidth: 6,
		borderColor: DONATION_COLORS.green,
		backgroundColor: DONATION_COLORS.white,
	},

	footer: {
		paddingHorizontal: DONATION_LAYOUT.horizontalPadding,
		paddingTop: 14,
		paddingBottom: 12,
		backgroundColor: DONATION_COLORS.white,
		borderTopWidth: 1,
		borderTopColor: DONATION_COLORS.border,
	},

	summaryRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 12,
	},

	summaryTextContainer: {
		flex: 1,
		marginRight: 12,
	},

	summaryTitle: {
		color: DONATION_COLORS.text,
		fontSize: 14,
		fontWeight: '800',
	},

	summaryDescription: {
		color: DONATION_COLORS.muted,
		fontSize: 12,
		marginTop: 3,
	},

	summaryAmount: {
		color: DONATION_COLORS.green,
		fontSize: 22,
		fontWeight: '900',
	},
})
