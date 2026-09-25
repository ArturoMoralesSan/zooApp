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

	button: '#246F4C',
	buttonPressed: '#1D5C3F',

	footerBackground: '#F7F9F8',
}

export const backgroundStyle: ViewStyle = {
	flex: 1,
}

export const backgroundImageStyle = {
	opacity: 0.3,
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
	fontSize: 15,
	fontWeight: '600',
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
	paddingBottom: 185,
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

export const cardStyle: ViewStyle = {
	width: '100%',
	backgroundColor: colors.cardLight,
	borderRadius: 25,
	padding: 18,
	marginBottom: 15,
	borderWidth: 1,
	borderColor: colors.border,
}

export const cardHeaderStyle: ViewStyle = {
	flexDirection: 'row',
	alignItems: 'center',
	marginBottom: 18,
}

export const cardHeaderTextStyle: ViewStyle = {
	flex: 1,
}

export const iconContainerStyle: ViewStyle = {
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

export const cardTitleStyle: TextStyle = {
	fontSize: 17,
	fontWeight: '900',
	color: colors.dark,
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
	paddingVertical: 11,
}

export const ticketRowInfoStyle: ViewStyle = {
	flex: 1,
	paddingRight: 12,
}

export const ticketNameStyle: TextStyle = {
	fontSize: 15,
	fontWeight: '800',
	color: colors.dark,
}

export const ticketQuantityStyle: TextStyle = {
	marginTop: 4,
	fontSize: 12,
	lineHeight: 17,
	color: colors.muted,
}

export const ticketSubtotalStyle: TextStyle = {
	fontSize: 15,
	fontWeight: '900',
	color: colors.dark,
}

export const dividerStyle: ViewStyle = {
	height: 1,
	backgroundColor: colors.border,
	marginVertical: 7,
}

export const totalRowStyle: ViewStyle = {
	flexDirection: 'row',
	alignItems: 'center',
	justifyContent: 'space-between',
	paddingTop: 9,
}

export const totalLabelStyle: TextStyle = {
	fontSize: 16,
	fontWeight: '800',
	color: colors.muted,
}

export const totalStyle: TextStyle = {
	fontSize: 23,
	fontWeight: '900',
	color: colors.primary,
}

export const paymentCardStyle: ViewStyle = {
	width: '100%',
	backgroundColor: colors.cardLight,
	borderRadius: 25,
	padding: 18,
	marginBottom: 15,
	flexDirection: 'row',
	alignItems: 'center',
	borderWidth: 1,
	borderColor: colors.border,
}

export const paymentIconStyle: ViewStyle = {
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

export const paymentInfoStyle: ViewStyle = {
	flex: 1,
}

export const paymentTitleStyle: TextStyle = {
	fontSize: 16,
	fontWeight: '900',
	color: colors.dark,
}

export const paymentTextStyle: TextStyle = {
	marginTop: 4,
	fontSize: 13,
	lineHeight: 18,
	color: colors.muted,
}

export const noticeStyle: ViewStyle = {
	width: '100%',
	backgroundColor: '#F0F8F4',
	borderRadius: 20,
	padding: 16,
	flexDirection: 'row',
	alignItems: 'center',
	borderWidth: 1,
	borderColor: colors.border,
}

export const noticeIconStyle: ViewStyle = {
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

export const noticeIconTextStyle: TextStyle = {
	fontSize: 19,
	fontWeight: '900',
	color: colors.primary,
}

export const noticeContentStyle: ViewStyle = {
	flex: 1,
}

export const noticeTitleStyle: TextStyle = {
	fontSize: 14,
	fontWeight: '900',
	color: colors.primary,
}

export const noticeTextStyle: TextStyle = {
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

export const footerTotalStyle: ViewStyle = {
	flexDirection: 'row',
	alignItems: 'center',
	justifyContent: 'space-between',
	marginBottom: 12,
}

export const footerTotalLabelStyle: TextStyle = {
	fontSize: 14,
	fontWeight: '800',
	color: colors.muted,
}

export const footerTicketCountStyle: TextStyle = {
	marginTop: 2,
	fontSize: 11,
	color: colors.muted,
}

export const footerTotalAmountStyle: TextStyle = {
	fontSize: 23,
	fontWeight: '900',
	color: colors.primary,
}

export const confirmButtonWrapperStyle: ViewStyle = {
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
	opacity: 0.55,
}

export const confirmButtonTextStyle: TextStyle = {
	color: colors.white,
	fontSize: 16,
	fontWeight: '900',
	textAlign: 'center',
}
