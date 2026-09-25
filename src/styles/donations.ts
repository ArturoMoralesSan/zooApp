import type { ImageStyle, TextStyle, ViewStyle } from 'react-native'

export const colors = {
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

export const cardShadow: ViewStyle = {
	shadowColor: colors.primary,
	shadowOffset: { width: 0, height: 5 },
	shadowOpacity: 0.12,
	shadowRadius: 10,
	elevation: 4,
}

export const containerStyle: ViewStyle = {
	flex: 1,
	backgroundColor: colors.background,
}

export const backgroundStyle: ViewStyle = {
	flex: 1,
}

export const backgroundImageStyle: ImageStyle = {
	opacity: 0.3,
}

export const backButtonStyle: ViewStyle = {
	position: 'absolute',
	left: 20,
	top: 8,
	zIndex: 20,
}

export const backButtonPressedStyle: ViewStyle = {
	backgroundColor: colors.card,
	opacity: 0.75,
}

export const backTextStyle: TextStyle = {
	fontSize: 15,
	fontWeight: '700',
	color: colors.dark,
}

export const scrollContentStyle: ViewStyle = {
	paddingHorizontal: 20,
	paddingTop: 40,
	paddingBottom: 180,
}

export const headerStyle: ViewStyle = {
	marginBottom: 10,
}

export const titleRowStyle: ViewStyle = {
	flexDirection: 'row',
	alignItems: 'center',
}

export const titleIconStyle: ViewStyle = {
	width: 52,
	height: 52,
	borderRadius: 17,
	backgroundColor: colors.active,
	borderWidth: 1,
	borderColor: colors.border,
	alignItems: 'center',
	justifyContent: 'center',
	marginRight: 13,
}

export const titleTextContainerStyle: ViewStyle = {
	flex: 1,
	minWidth: 0,
}

export const titleStyle: TextStyle = {
	fontSize: 27,
	fontWeight: '900',
	color: colors.dark,
}

export const subtitleStyle: TextStyle = {
	marginTop: 4,
	fontSize: 14,
	lineHeight: 20,
	color: colors.muted,
}

export const introCardStyle: ViewStyle = {
	width: '100%',
	backgroundColor: colors.cardLight,
	borderRadius: 25,
	padding: 17,
	marginBottom: 20,
	flexDirection: 'row',
	alignItems: 'center',
	borderWidth: 1,
	borderColor: colors.border,
	...cardShadow,
}

export const introIconStyle: ViewStyle = {
	width: 54,
	height: 54,
	borderRadius: 18,
	backgroundColor: colors.active,
	alignItems: 'center',
	justifyContent: 'center',
	borderWidth: 1,
	borderColor: colors.border,
	marginRight: 14,
}

export const introContentStyle: ViewStyle = {
	flex: 1,
	minWidth: 0,
}

export const introTitleStyle: TextStyle = {
	fontSize: 17,
	fontWeight: '900',
	color: colors.dark,
}

export const introTextStyle: TextStyle = {
	marginTop: 4,
	fontSize: 13,
	lineHeight: 18,
	color: colors.muted,
}

export const sectionTitleStyle: TextStyle = {
	marginBottom: 12,
	fontSize: 16,
	fontWeight: '900',
	color: colors.dark,
}

export const amountGridStyle: ViewStyle = {
	flexDirection: 'row',
	flexWrap: 'wrap',
	justifyContent: 'space-between',
	marginBottom: 17,
}

export const amountCardStyle: ViewStyle = {
	width: '31.5%',
	minHeight: 82,
	marginBottom: 11,
	borderRadius: 21,
	backgroundColor: colors.cardLight,
	borderWidth: 1,
	borderColor: colors.border,
	alignItems: 'center',
	justifyContent: 'center',
	paddingHorizontal: 8,
	...cardShadow,
}

export const amountCardSelectedStyle: ViewStyle = {
	backgroundColor: colors.active,
	borderColor: colors.primary,
	borderWidth: 2,
}

export const amountCardPressedStyle: ViewStyle = {
	opacity: 0.75,
}

export const selectedLabelStyle: TextStyle = {
	marginTop: 3,
	fontSize: 9,
	fontWeight: '800',
	color: colors.primary,
}

export const customCardStyle: ViewStyle = {
	backgroundColor: colors.cardLight,
	borderRadius: 25,
	padding: 17,
	marginBottom: 17,
	borderWidth: 1,
	borderColor: colors.border,
}

export const customTitleStyle: TextStyle = {
	fontSize: 15,
	fontWeight: '900',
	color: colors.dark,
	marginBottom: 11,
}

export const inputWrapperStyle: ViewStyle = {
	height: 52,
	flexDirection: 'row',
	alignItems: 'center',
	backgroundColor: colors.white,
	borderWidth: 1,
	borderColor: colors.border,
	borderRadius: 16,
	paddingHorizontal: 15,
}

export const inputWrapperActiveStyle: ViewStyle = {
	borderColor: colors.primary,
	borderWidth: 2,
}

export const currencyStyle: TextStyle = {
	fontSize: 18,
	fontWeight: '900',
	color: colors.primary,
	marginRight: 7,
}

export const inputStyle: TextStyle = {
	flex: 1,
	height: '100%',
	fontSize: 16,
	fontWeight: '700',
	color: colors.dark,
}

export const minimumTextStyle: TextStyle = {
	marginTop: 7,
	fontSize: 11,
	color: colors.muted,
}

export const paymentCardStyle: ViewStyle = {
	backgroundColor: colors.cardLight,
	borderRadius: 25,
	padding: 17,
	borderWidth: 1,
	borderColor: colors.border,
}

export const paymentTitleStyle: TextStyle = {
	fontSize: 15,
	fontWeight: '900',
	color: colors.dark,
	marginBottom: 12,
}

export const paymentMethodStyle: ViewStyle = {
	minHeight: 64,
	flexDirection: 'row',
	alignItems: 'center',
	backgroundColor: colors.white,
	borderRadius: 18,
	borderWidth: 1,
	borderColor: colors.border,
	paddingHorizontal: 12,
	paddingVertical: 10,
}

export const paymentIconStyle: ViewStyle = {
	width: 42,
	height: 42,
	borderRadius: 13,
	backgroundColor: colors.active,
	alignItems: 'center',
	justifyContent: 'center',
	marginRight: 11,
}

export const paymentIconTextStyle: TextStyle = {
	fontSize: 20,
}

export const paymentInfoStyle: ViewStyle = {
	flex: 1,
	minWidth: 0,
}

export const paymentNameStyle: TextStyle = {
	fontSize: 14,
	fontWeight: '900',
	color: colors.dark,
}

export const paymentDescriptionStyle: TextStyle = {
	marginTop: 2,
	fontSize: 11,
	color: colors.muted,
}

export const paymentCheckStyle: ViewStyle = {
	width: 28,
	height: 28,
	borderRadius: 14,
	backgroundColor: colors.primary,
	alignItems: 'center',
	justifyContent: 'center',
}

export const paymentCheckTextStyle: TextStyle = {
	color: colors.white,
	fontSize: 16,
	fontWeight: '900',
}

export const bottomSpaceStyle: ViewStyle = {
	height: 40,
}

export const footerStyle: ViewStyle = {
	position: 'absolute',
	left: 0,
	right: 0,
	bottom: 0,
	backgroundColor: colors.footerBackground,
	paddingHorizontal: 20,
	paddingTop: 14,
	paddingBottom: 25,
	borderTopWidth: 1,
	borderTopColor: colors.border,
	...cardShadow,
}

export const totalContainerStyle: ViewStyle = {
	flexDirection: 'row',
	justifyContent: 'space-between',
	alignItems: 'center',
	marginBottom: 12,
}

export const totalLabelStyle: TextStyle = {
	fontSize: 14,
	fontWeight: '800',
	color: colors.muted,
}

export const totalDescriptionStyle: TextStyle = {
	marginTop: 2,
	fontSize: 11,
	color: colors.muted,
}

export const totalStyle: TextStyle = {
	fontSize: 23,
	fontWeight: '900',
	color: colors.primary,
	maxWidth: 150,
}

export const continueButtonWrapperStyle: ViewStyle = {
	width: '100%',
	height: 54,
	borderRadius: 17,
	backgroundColor: colors.button,
	borderWidth: 1,
	borderColor: colors.button,
	overflow: 'hidden',
	...cardShadow,
}

export const continueButtonStyle: ViewStyle = {
	width: '100%',
	height: '100%',
	alignItems: 'center',
	justifyContent: 'center',
}

export const continueButtonContentStyle: ViewStyle = {
	width: '100%',
	height: '100%',
	flexDirection: 'row',
	alignItems: 'center',
	justifyContent: 'center',
	gap: 8,
}

export const continueButtonPressedStyle: ViewStyle = {
	backgroundColor: colors.buttonPressed,
}

export const continueButtonDisabledStyle: ViewStyle = {
	opacity: 0.45,
}

export const continueButtonTextStyle: TextStyle = {
	color: colors.white,
	fontSize: 16,
	fontWeight: '900',
	textAlign: 'center',
}
