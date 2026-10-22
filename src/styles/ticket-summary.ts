import type { TextStyle, ViewStyle } from 'react-native'

export const colors = {
	background: '#FFFFFF',
	primary: '#08783F',
	primaryDark: '#063D22',
	primaryLight: '#b8f35d',
	text: '#0a2014',
	textSecondary: '#668475',
	muted: '#607A6A',
	border: '#a6c1b3',
	cardLight: '#eef4f0',
	iconBackground: '#d5ead9',
	white: '#FFFFFF',
	coral: '#08783F',

	// Colores adicionales para este componente
	card: '#eef4f0',
	cardLightActive: '#d5ead9',
	button: '#08783F',
	buttonPressed: '#063D22',
	buttonDisabled: '#a6c1b3',
	footerBackground: '#FFFFFF',
	price: '#12482e',
}

export const backgroundStyle: ViewStyle = {
	flex: 1,
	backgroundColor: colors.background,
}

export const backgroundImageStyle = {
	opacity: 0.12,
}

export const containerStyle: ViewStyle = {
	flex: 1,
	backgroundColor: colors.background,
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
	fontSize: 14,
	fontWeight: '500',
}

export const headerStyle: ViewStyle = {
	paddingHorizontal: 20,
	paddingTop: 12,
	paddingBottom: 16,
	alignItems: 'flex-start',
}

export const backButtonStyle: ViewStyle = {
	flexDirection: 'row',
	alignItems: 'center',
	justifyContent: 'center',
	backgroundColor: colors.card,
	borderWidth: 1,
	borderColor: colors.border,
	borderRadius: 14,
	paddingHorizontal: 14,
	paddingVertical: 9,
}

export const backButtonPressedStyle: ViewStyle = {
	opacity: 0.75,
	backgroundColor: colors.cardLightActive,
}

export const backTextStyle: TextStyle = {
	fontSize: 14,
	fontWeight: '600',
	color: colors.text,
}

export const headerTextStyle: ViewStyle = {
	width: '100%',
	marginTop: 12,
}

export const titleStyle: TextStyle = {
	fontSize: 25,
	fontWeight: '800',
	color: colors.text,
}

export const subtitleStyle: TextStyle = {
	marginTop: 5,
	fontSize: 14,
	lineHeight: 20,
	color: colors.muted,
}

export const scrollContentStyle: ViewStyle = {
	paddingHorizontal: 20,
	paddingTop: 8,
	paddingBottom: 190,
}

export const cardShadow: ViewStyle = {
	shadowColor: colors.primaryDark,
	shadowOffset: {
		width: 0,
		height: 2,
	},
	shadowOpacity: 0.05,
	shadowRadius: 8,
	elevation: 2,
}

export const cardStyle: ViewStyle = {
	width: '100%',
	backgroundColor: colors.card,
	borderRadius: 20,
	padding: 16,
	marginBottom: 14,
	borderWidth: 1,
	borderColor: colors.border,
}

export const cardHeaderStyle: ViewStyle = {
	flexDirection: 'row',
	alignItems: 'center',
	marginBottom: 16,
}

export const cardHeaderTextStyle: ViewStyle = {
	flex: 1,
}

export const iconContainerStyle: ViewStyle = {
	width: 46,
	height: 46,
	borderRadius: 14,
	backgroundColor: colors.iconBackground,
	alignItems: 'center',
	justifyContent: 'center',
	marginRight: 12,
	borderWidth: 1,
	borderColor: colors.border,
}

export const cardTitleStyle: TextStyle = {
	fontSize: 16,
	fontWeight: '800',
	color: colors.text,
}

export const cardSubtitleStyle: TextStyle = {
	marginTop: 3,
	fontSize: 12,
	color: colors.muted,
}

export const ticketRowStyle: ViewStyle = {
	flexDirection: 'row',
	alignItems: 'center',
	justifyContent: 'space-between',
	paddingVertical: 12,
	borderBottomWidth: 1,
	borderBottomColor: colors.cardLight,
}

export const ticketRowInfoStyle: ViewStyle = {
	flex: 1,
	paddingRight: 12,
}

export const ticketNameStyle: TextStyle = {
	fontSize: 14,
	fontWeight: '700',
	color: colors.text,
}

export const ticketQuantityStyle: TextStyle = {
	marginTop: 4,
	fontSize: 12,
	lineHeight: 18,
	color: colors.muted,
}

export const ticketSubtotalStyle: TextStyle = {
	fontSize: 15,
	fontWeight: '800',
	color: colors.price,
}

export const dividerStyle: ViewStyle = {
	height: 1,
	backgroundColor: colors.border,
	marginVertical: 12,
}

export const totalRowStyle: ViewStyle = {
	flexDirection: 'row',
	alignItems: 'center',
	justifyContent: 'space-between',
	paddingTop: 4,
}

export const totalLabelStyle: TextStyle = {
	fontSize: 14,
	fontWeight: '700',
	color: colors.text,
}

export const totalStyle: TextStyle = {
	fontSize: 22,
	fontWeight: '800',
	color: colors.price,
}

export const paymentCardStyle: ViewStyle = {
	width: '100%',
	backgroundColor: colors.card,
	borderRadius: 20,
	padding: 16,
	marginBottom: 14,
	flexDirection: 'row',
	alignItems: 'center',
	borderWidth: 1,
	borderColor: colors.border,
}

export const paymentIconStyle: ViewStyle = {
	width: 46,
	height: 46,
	borderRadius: 14,
	backgroundColor: colors.iconBackground,
	alignItems: 'center',
	justifyContent: 'center',
	marginRight: 12,
	borderWidth: 1,
	borderColor: colors.border,
}

export const paymentInfoStyle: ViewStyle = {
	flex: 1,
}

export const paymentTitleStyle: TextStyle = {
	fontSize: 15,
	fontWeight: '800',
	color: colors.text,
}

export const paymentTextStyle: TextStyle = {
	marginTop: 4,
	fontSize: 13,
	lineHeight: 18,
	color: colors.muted,
}

export const noticeStyle: ViewStyle = {
	width: '100%',
	backgroundColor: colors.cardLight,
	borderRadius: 16,
	padding: 14,
	marginBottom: 14,
	flexDirection: 'row',
	alignItems: 'center',
	borderWidth: 1,
	borderColor: colors.border,
}

export const noticeIconStyle: ViewStyle = {
	width: 34,
	height: 34,
	borderRadius: 11,
	backgroundColor: colors.primary,
	alignItems: 'center',
	justifyContent: 'center',
	marginRight: 12,
}

export const noticeIconTextStyle: TextStyle = {
	fontSize: 18,
	fontWeight: '800',
	color: colors.white,
}

export const noticeContentStyle: ViewStyle = {
	flex: 1,
}

export const noticeTitleStyle: TextStyle = {
	fontSize: 14,
	fontWeight: '700',
	color: colors.text,
}

export const noticeTextStyle: TextStyle = {
	marginTop: 4,
	fontSize: 12,
	lineHeight: 18,
	color: colors.textSecondary,
}

export const bottomSpaceStyle: ViewStyle = {
	height: 24,
}

export const footerStyle: ViewStyle = {
	position: 'absolute',
	left: 0,
	right: 0,
	bottom: 0,
	backgroundColor: colors.footerBackground,
	paddingHorizontal: 20,
	paddingTop: 14,
	paddingBottom: 20,
	borderTopWidth: 1,
	borderTopColor: colors.cardLight,

	shadowColor: colors.primaryDark,
	shadowOffset: {
		width: 0,
		height: -2,
	},
	shadowOpacity: 0.04,
	shadowRadius: 8,
	elevation: 5,
}

export const footerTotalStyle: ViewStyle = {
	flexDirection: 'row',
	alignItems: 'center',
	justifyContent: 'space-between',
	marginBottom: 14,
}

export const footerTotalLabelStyle: TextStyle = {
	fontSize: 13,
	fontWeight: '700',
	color: colors.text,
}

export const footerTicketCountStyle: TextStyle = {
	marginTop: 3,
	fontSize: 12,
	color: colors.muted,
}

export const footerTotalAmountStyle: TextStyle = {
	fontSize: 23,
	fontWeight: '800',
	color: colors.price,
}

export const confirmButtonWrapperStyle: ViewStyle = {
	width: '100%',
	height: 52,
	borderRadius: 14,
	backgroundColor: colors.button,
	borderWidth: 1,
	borderColor: colors.button,
	overflow: 'hidden',
}

export const confirmButtonStyle: ViewStyle = {
	width: '100%',
	height: '100%',
	alignItems: 'center',
	justifyContent: 'center',
}

export const confirmButtonContentStyle: ViewStyle = {
	width: '100%',
	height: '100%',
	alignItems: 'center',
	justifyContent: 'center',
}

export const confirmButtonPressedStyle: ViewStyle = {
	backgroundColor: colors.buttonPressed,
}

export const confirmButtonDisabledStyle: ViewStyle = {
	backgroundColor: colors.buttonDisabled,
	borderColor: colors.buttonDisabled,
	opacity: 0.8,
}

export const confirmButtonTextStyle: TextStyle = {
	color: colors.white,
	fontSize: 15,
	fontWeight: '700',
	textAlign: 'center',
}
