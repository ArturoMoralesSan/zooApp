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
	shadowColor: '#075C3B',
	shadowOffset: {
		width: 0,
		height: 5,
	},
	shadowOpacity: 0.12,
	shadowRadius: 10,
	elevation: 4,
}

export const backgroundStyle: ViewStyle = {
	flex: 1,
	backgroundColor: colors.background,
}

export const backgroundImageStyle: ImageStyle = {
	opacity: 0.3,
}

export const loadingContainerStyle: ViewStyle = {
	flex: 1,
	backgroundColor: colors.background,
}

export const loadingContentStyle: ViewStyle = {
	flex: 1,
	alignItems: 'center',
	justifyContent: 'center',
}

export const loadingTextStyle: TextStyle = {
	marginTop: 12,
	color: colors.muted,
	fontSize: 15,
	fontWeight: '600',
}

export const headerStyle: ViewStyle = {
	paddingHorizontal: 20,
	paddingTop: 55,
	paddingBottom: 16,
	alignItems: 'flex-start',
}

export const backButtonStyle: ViewStyle = {
	flexDirection: 'row',
	alignItems: 'center',
	justifyContent: 'center',
	backgroundColor: 'rgba(247,249,248,0.94)',
	borderWidth: 1,
	borderColor: colors.border,
	borderRadius: 18,
	paddingHorizontal: 16,
	paddingVertical: 10,
	...cardShadow,
}

export const backButtonPressedStyle: ViewStyle = {
	opacity: 0.75,
	backgroundColor: colors.card,
}

export const backTextStyle: TextStyle = {
	fontSize: 15,
	fontWeight: '700',
	color: colors.dark,
}

export const headerTextContainerStyle: ViewStyle = {
	width: '100%',
	marginTop: 17,
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

export const scrollContentStyle: ViewStyle = {
	paddingHorizontal: 20,
	paddingTop: 14,
	paddingBottom: 185,
}

export const ticketCardStyle: ViewStyle = {
	width: '100%',
	backgroundColor: colors.cardLight,
	borderRadius: 25,
	padding: 16,
	marginBottom: 15,
	flexDirection: 'row',
	alignItems: 'center',
	borderWidth: 1,
	borderColor: colors.border,
}

export const ticketIconStyle: ViewStyle = {
	width: 52,
	height: 52,
	borderRadius: 17,
	backgroundColor: colors.active,
	alignItems: 'center',
	justifyContent: 'center',
	marginRight: 13,
	borderWidth: 1,
	borderColor: colors.border,
}

export const ticketInfoStyle: ViewStyle = {
	flex: 1,
	minWidth: 0,
}

export const ticketNameStyle: TextStyle = {
	fontSize: 16,
	fontWeight: '900',
	color: colors.dark,
}

export const ticketDescriptionStyle: TextStyle = {
	marginTop: 3,
	fontSize: 12,
	color: colors.muted,
	lineHeight: 16,
}

export const ticketPriceStyle: TextStyle = {
	marginTop: 6,
	fontSize: 17,
	fontWeight: '900',
	color: colors.primary,
}

export const quantityContainerStyle: ViewStyle = {
	flexDirection: 'row',
	alignItems: 'center',
	justifyContent: 'center',
	marginLeft: 9,
}

export const quantityButtonStyle: ViewStyle = {
	width: 34,
	height: 34,
	borderRadius: 11,
	backgroundColor: colors.active,
	alignItems: 'center',
	justifyContent: 'center',
	borderWidth: 1,
	borderColor: colors.border,
}

export const quantityButtonDisabledStyle: ViewStyle = {
	backgroundColor: '#EEF3F0',
	borderColor: colors.border,
}

export const quantityStyle: TextStyle = {
	marginHorizontal: 9,
	fontSize: 16,
	fontWeight: '900',
	color: colors.dark,
	minWidth: 18,
	textAlign: 'center',
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

export const ticketCountStyle: TextStyle = {
	marginTop: 2,
	fontSize: 11,
	color: colors.muted,
}

export const totalStyle: TextStyle = {
	fontSize: 23,
	fontWeight: '900',
	color: colors.primary,
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
	flex: 1,
	width: '100%',
	alignItems: 'center',
	justifyContent: 'center',
	padding: 0,
	margin: 0,
}

export const continueButtonContentStyle: ViewStyle = {
	width: '100%',
	height: 54,
	alignItems: 'center',
	justifyContent: 'center',
	padding: 0,
	margin: 0,
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
	includeFontPadding: false,
	padding: 0,
	margin: 0,
}
