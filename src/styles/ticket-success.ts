import type { TextStyle, ViewStyle } from 'react-native'

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
	coral: '#D95C4F',
	errorBackground: '#FFF3F1',
	errorBorder: '#F3D5D0',
	errorText: '#8C4037',
	mapBackground: '#F8E1DE',
	mapBorder: '#EFC2BC',
	button: '#246F4C',
	buttonPressed: '#1D5C3F',
	footerBackground: '#F7F9F8',
}

export const containerStyle: ViewStyle = {
	flex: 1,
	backgroundColor: colors.background,
}

export const backgroundStyle: ViewStyle = {
	flex: 1,
}

export const backgroundImageStyle = {
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
	backgroundColor: 'rgba(248,244,234,0.94)',
	borderWidth: 1,
	borderColor: colors.border,
	borderRadius: 18,
	paddingHorizontal: 16,
	paddingVertical: 10,
	shadowColor: colors.primary,
	shadowOffset: {
		width: 0,
		height: 5,
	},
	shadowOpacity: 0.12,
	shadowRadius: 10,
	elevation: 4,
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
	marginTop: 14,
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
	paddingBottom: 190,
	alignItems: 'center',
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

export const successCardStyle: ViewStyle = {
	width: '100%',
	backgroundColor: colors.cardLight,
	borderRadius: 26,
	padding: 22,
	marginBottom: 15,
	alignItems: 'center',
	borderWidth: 1,
	borderColor: colors.border,
}

export const successIconStyle: ViewStyle = {
	width: 72,
	height: 72,
	borderRadius: 24,
	backgroundColor: colors.active,
	alignItems: 'center',
	justifyContent: 'center',
	marginBottom: 14,
	borderWidth: 1,
	borderColor: colors.border,
}

export const successTitleStyle: TextStyle = {
	fontSize: 23,
	fontWeight: '900',
	color: colors.primary,
	textAlign: 'center',
}

export const successTextStyle: TextStyle = {
	marginTop: 7,
	fontSize: 14,
	lineHeight: 20,
	color: colors.muted,
	textAlign: 'center',
}

export const orderCardStyle: ViewStyle = {
	width: '100%',
	backgroundColor: colors.white,
	borderRadius: 25,
	padding: 18,
	marginBottom: 15,
	borderWidth: 1,
	borderColor: colors.border,
}

export const orderHeaderStyle: ViewStyle = {
	flexDirection: 'row',
	alignItems: 'center',
	marginBottom: 17,
}

export const orderIconStyle: ViewStyle = {
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

export const orderHeaderInfoStyle: ViewStyle = {
	flex: 1,
}

export const orderTitleStyle: TextStyle = {
	fontSize: 17,
	fontWeight: '900',
	color: colors.dark,
}

export const orderSubtitleStyle: TextStyle = {
	marginTop: 3,
	fontSize: 12,
	color: colors.muted,
}

export const ticketContainerStyle: ViewStyle = {
	width: '100%',
	alignItems: 'center',
	marginBottom: 15,
}

export const ticketLabelStyle: TextStyle = {
	alignSelf: 'flex-start',
	marginBottom: 9,
	fontSize: 13,
	fontWeight: '800',
	color: colors.dark,
}

export const qrContainerStyle: ViewStyle = {
	padding: 14,
	backgroundColor: colors.white,
	borderRadius: 20,
	borderWidth: 1,
	borderColor: colors.border,
	alignItems: 'center',
	justifyContent: 'center',
}

export const noTicketsStyle: ViewStyle = {
	width: '100%',
	paddingVertical: 25,
	alignItems: 'center',
	justifyContent: 'center',
}

export const noTicketsTextStyle: TextStyle = {
	fontSize: 14,
	color: colors.muted,
	textAlign: 'center',
}

export const totalCardStyle: ViewStyle = {
	width: '100%',
	backgroundColor: colors.cardLight,
	borderRadius: 22,
	padding: 17,
	marginTop: 2,
	marginBottom: 15,
	borderWidth: 1,
	borderColor: colors.border,
}

export const totalLabelStyle: TextStyle = {
	fontSize: 14,
	fontWeight: '800',
	color: colors.muted,
}

export const totalAmountStyle: TextStyle = {
	marginTop: 3,
	fontSize: 25,
	fontWeight: '900',
	color: colors.primary,
}

export const folioContainerStyle: ViewStyle = {
	marginTop: 13,
	paddingTop: 13,
	borderTopWidth: 1,
	borderTopColor: colors.border,
}

export const folioLabelStyle: TextStyle = {
	fontSize: 11,
	fontWeight: '800',
	color: colors.muted,
	textTransform: 'uppercase',
}

export const folioStyle: TextStyle = {
	marginTop: 3,
	fontSize: 14,
	fontWeight: '800',
	color: colors.dark,
}

export const infoBoxStyle: ViewStyle = {
	width: '100%',
	backgroundColor: '#F0F8F4',
	borderRadius: 20,
	padding: 16,
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
	shadowColor: colors.primary,
	shadowOffset: {
		width: 0,
		height: 5,
	},
	shadowOpacity: 0.12,
	shadowRadius: 10,
	elevation: 4,
}

export const footerInfoStyle: ViewStyle = {
	marginBottom: 12,
}

export const footerLabelStyle: TextStyle = {
	fontSize: 14,
	fontWeight: '800',
	color: colors.muted,
}

export const footerTicketCountStyle: TextStyle = {
	marginTop: 2,
	fontSize: 11,
	color: colors.muted,
}

export const footerAmountStyle: TextStyle = {
	fontSize: 23,
	fontWeight: '900',
	color: colors.primary,
}

export const homeButtonWrapperStyle: ViewStyle = {
	width: '100%',
	height: 54,
	borderRadius: 17,
	backgroundColor: colors.button,
	borderWidth: 1,
	borderColor: colors.button,
	overflow: 'hidden',
	shadowColor: colors.primary,
	shadowOffset: {
		width: 0,
		height: 5,
	},
	shadowOpacity: 0.12,
	shadowRadius: 10,
	elevation: 4,
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
	alignItems: 'center',
	justifyContent: 'center',
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
