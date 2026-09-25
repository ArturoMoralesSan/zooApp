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
	infoBackground: '#F0F8F4',
}

export const cardShadow: ViewStyle = {
	shadowColor: colors.primary,
	shadowOffset: {
		width: 0,
		height: 5,
	},
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

export const headerStyle: ViewStyle = {
	paddingHorizontal: 20,
	paddingTop: 8,
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

export const headerTextStyle: ViewStyle = {
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
	paddingBottom: 190,
	alignItems: 'center',
}

export const successCardStyle: ViewStyle = {
	width: '100%',
	backgroundColor: colors.cardLight,
	borderRadius: 25,
	padding: 20,
	marginBottom: 15,
	borderWidth: 1,
	borderColor: colors.border,
	alignItems: 'center',
}

export const successIconStyle: ViewStyle = {
	width: 82,
	height: 82,
	borderRadius: 28,
	backgroundColor: colors.active,
	alignItems: 'center',
	justifyContent: 'center',
	borderWidth: 1,
	borderColor: colors.border,
	marginBottom: 14,
}

export const successTitleStyle: TextStyle = {
	fontSize: 23,
	fontWeight: '900',
	color: colors.dark,
	textAlign: 'center',
}

export const successTextStyle: TextStyle = {
	marginTop: 7,
	fontSize: 13,
	lineHeight: 19,
	color: colors.muted,
	textAlign: 'center',
	maxWidth: 340,
}

export const amountCardStyle: ViewStyle = {
	width: '100%',
	backgroundColor: colors.cardLight,
	borderRadius: 25,
	padding: 18,
	marginBottom: 20,
	borderWidth: 1,
	borderColor: colors.border,
	flexDirection: 'row',
	alignItems: 'center',
}

export const amountIconStyle: ViewStyle = {
	width: 58,
	height: 58,
	borderRadius: 19,
	backgroundColor: colors.active,
	alignItems: 'center',
	justifyContent: 'center',
	borderWidth: 1,
	borderColor: colors.border,
	marginRight: 14,
}

export const amountInfoStyle: ViewStyle = {
	flex: 1,
	minWidth: 0,
}

export const amountLabelStyle: TextStyle = {
	fontSize: 13,
	fontWeight: '800',
	color: colors.muted,
}

export const amountStyle: TextStyle = {
	marginTop: 2,
	fontSize: 30,
	lineHeight: 37,
	fontWeight: '900',
	color: colors.primary,
	maxWidth: '95%',
}

export const sectionTitleStyle: TextStyle = {
	width: '100%',
	marginBottom: 12,
	fontSize: 16,
	fontWeight: '900',
	color: colors.dark,
}

export const detailCardStyle: ViewStyle = {
	width: '100%',
	backgroundColor: colors.cardLight,
	borderRadius: 25,
	padding: 17,
	marginBottom: 15,
	borderWidth: 1,
	borderColor: colors.border,
}

export const detailRowStyle: ViewStyle = {
	minHeight: 58,
	flexDirection: 'row',
	alignItems: 'center',
	justifyContent: 'space-between',
}

export const detailLeftStyle: ViewStyle = {
	flex: 1,
	minWidth: 0,
	flexDirection: 'row',
	alignItems: 'center',
	marginRight: 10,
}

export const detailIconStyle: ViewStyle = {
	width: 43,
	height: 43,
	borderRadius: 14,
	backgroundColor: colors.active,
	borderWidth: 1,
	borderColor: colors.border,
	alignItems: 'center',
	justifyContent: 'center',
	marginRight: 11,
}

export const receiptIconTextStyle: TextStyle = {
	fontSize: 20,
	fontWeight: '900',
	color: colors.primary,
}

export const detailTextContainerStyle: ViewStyle = {
	flex: 1,
	minWidth: 0,
}

export const detailTitleStyle: TextStyle = {
	fontSize: 14,
	fontWeight: '900',
	color: colors.dark,
}

export const detailDescriptionStyle: TextStyle = {
	marginTop: 2,
	fontSize: 11,
	lineHeight: 16,
	color: colors.muted,
}

export const detailValueStyle: TextStyle = {
	fontSize: 15,
	fontWeight: '900',
	color: colors.primary,
}

export const paymentValueStyle: TextStyle = {
	fontSize: 13,
	fontWeight: '900',
	color: colors.primary,
}

export const folioStyle: TextStyle = {
	fontSize: 14,
	fontWeight: '900',
	color: colors.dark,
}

export const separatorStyle: ViewStyle = {
	height: 1,
	backgroundColor: colors.border,
	marginVertical: 7,
}

export const infoBoxStyle: ViewStyle = {
	width: '100%',
	backgroundColor: colors.infoBackground,
	borderRadius: 20,
	padding: 16,
	marginBottom: 15,
	flexDirection: 'row',
	alignItems: 'center',
	borderWidth: 1,
	borderColor: colors.border,
}

export const infoIconStyle: ViewStyle = {
	width: 38,
	height: 38,
	borderRadius: 13,
	backgroundColor: colors.white,
	alignItems: 'center',
	justifyContent: 'center',
	marginRight: 12,
	borderWidth: 1,
	borderColor: colors.border,
}

export const infoIconTextStyle: TextStyle = {
	fontSize: 19,
	fontWeight: '900',
	color: colors.primary,
}

export const infoContentStyle: ViewStyle = {
	flex: 1,
	minWidth: 0,
}

export const infoTitleStyle: TextStyle = {
	fontSize: 14,
	fontWeight: '900',
	color: colors.primary,
}

export const infoTextStyle: TextStyle = {
	marginTop: 4,
	fontSize: 12,
	lineHeight: 17,
	color: colors.muted,
}

export const thanksCardStyle: ViewStyle = {
	width: '100%',
	backgroundColor: colors.active,
	borderRadius: 20,
	padding: 16,
	flexDirection: 'row',
	alignItems: 'center',
	borderWidth: 1,
	borderColor: colors.border,
}

export const thanksIconStyle: ViewStyle = {
	width: 42,
	height: 42,
	borderRadius: 14,
	backgroundColor: colors.white,
	alignItems: 'center',
	justifyContent: 'center',
	borderWidth: 1,
	borderColor: colors.border,
}

export const thanksContentStyle: ViewStyle = {
	flex: 1,
	minWidth: 0,
	marginLeft: 11,
}

export const thanksTitleStyle: TextStyle = {
	fontSize: 14,
	fontWeight: '900',
	color: colors.primary,
}

export const thanksTextStyle: TextStyle = {
	marginTop: 3,
	fontSize: 12,
	lineHeight: 17,
	color: colors.dark,
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

export const footerInfoStyle: ViewStyle = {
	flexDirection: 'row',
	alignItems: 'center',
	justifyContent: 'space-between',
	marginBottom: 12,
}

export const footerLabelStyle: TextStyle = {
	fontSize: 14,
	fontWeight: '800',
	color: colors.muted,
}

export const footerDescriptionStyle: TextStyle = {
	marginTop: 2,
	fontSize: 11,
	color: colors.muted,
}

export const footerAmountStyle: TextStyle = {
	fontSize: 23,
	fontWeight: '900',
	color: colors.primary,
	maxWidth: 140,
}

export const homeButtonWrapperStyle: ViewStyle = {
	width: '100%',
	height: 54,
	borderRadius: 17,
	backgroundColor: colors.button,
	borderWidth: 1,
	borderColor: colors.button,
	overflow: 'hidden',
	...cardShadow,
}

export const homeButtonStyle: ViewStyle = {
	width: '100%',
	height: '100%',
	alignItems: 'center',
	justifyContent: 'center',
}

export const homeButtonContentStyle: ViewStyle = {
	width: '100%',
	height: '100%',
	flexDirection: 'row',
	alignItems: 'center',
	justifyContent: 'center',
	gap: 8,
}

export const homeButtonPressedStyle: ViewStyle = {
	backgroundColor: colors.buttonPressed,
}

export const homeButtonTextStyle: TextStyle = {
	color: colors.white,
	fontSize: 16,
	fontWeight: '900',
	textAlign: 'center',
}
