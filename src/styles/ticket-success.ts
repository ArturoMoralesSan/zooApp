import type { ImageStyle, TextStyle, ViewStyle } from 'react-native'

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

	// Colores complementarios del componente
	dark: '#0a2014',
	card: '#eef4f0',
	active: '#d5ead9',
	borderLight: '#eef4f0',
	borderStrong: '#a6c1b3',
	yellow: '#b8f35d',
	button: '#08783F',
	buttonPressed: '#063D22',
	buttonDisabled: '#a6c1b3',
	footerBackground: '#FFFFFF',
	price: '#12482e',
}

export const containerStyle: ViewStyle = {
	flex: 1,
	backgroundColor: colors.background,
}

export const backgroundStyle: ViewStyle = {
	flex: 1,
	backgroundColor: colors.background,
}

export const backgroundImageStyle: ImageStyle = {
	opacity: 0.025,
}

/* SOMBRAS SUAVES */

export const cardShadow: ViewStyle = {
	shadowColor: colors.primaryDark,
	shadowOffset: { width: 0, height: 2 },
	shadowOpacity: 0.04,
	shadowRadius: 4,
	elevation: 1,
}

/* HEADER */

export const headerStyle: ViewStyle = {
	paddingHorizontal: 20,
	paddingTop: 8,
	paddingBottom: 14,
	alignItems: 'flex-start',
	backgroundColor: 'transparent',
}

export const headerTextStyle: ViewStyle = {
	width: '100%',
	marginTop: 16,
}

export const titleStyle: TextStyle = {
	fontSize: 27,
	lineHeight: 34,
	fontWeight: '900',
	color: colors.dark,
	letterSpacing: -0.5,
}

export const subtitleStyle: TextStyle = {
	marginTop: 4,
	fontSize: 14,
	lineHeight: 20,
	color: colors.muted,
}

/* BACK BUTTON */

export const backButtonStyle: ViewStyle = {
	alignSelf: 'flex-start',
	minHeight: 38,
	flexDirection: 'row',
	alignItems: 'center',
	justifyContent: 'center',
	backgroundColor: colors.card,
	borderWidth: 1,
	borderColor: colors.border,
	borderRadius: 12,
	paddingHorizontal: 14,
	paddingVertical: 8,
}

export const backButtonPressedStyle: ViewStyle = {
	backgroundColor: colors.active,
	opacity: 0.85,
}

export const backTextStyle: TextStyle = {
	fontSize: 14,
	fontWeight: '700',
	color: colors.primaryDark,
}

/* CONTENIDO */

export const scrollContentStyle: ViewStyle = {
	paddingHorizontal: 20,
	paddingTop: 8,
	paddingBottom: 190,
	alignItems: 'center',
}

/* TARJETA DE COMPRA REALIZADA */

export const successCardStyle: ViewStyle = {
	width: '100%',
	backgroundColor: colors.button,
	borderRadius: 22,
	padding: 22,
	marginBottom: 15,
	alignItems: 'center',
	borderWidth: 1,
	borderColor: colors.button,
}

export const successIconStyle: ViewStyle = {
	width: 68,
	height: 68,
	borderRadius: 22,
	backgroundColor: colors.white,
	alignItems: 'center',
	justifyContent: 'center',
	marginBottom: 14,
	borderWidth: 1,
	borderColor: colors.white,
}

export const successTitleStyle: TextStyle = {
	fontSize: 23,
	fontWeight: '900',
	color: colors.white,
	textAlign: 'center',
}

export const successTextStyle: TextStyle = {
	marginTop: 7,
	fontSize: 14,
	lineHeight: 20,
	color: colors.cardLight,
	textAlign: 'center',
}

/* TARJETA DE BOLETOS */

export const orderCardStyle: ViewStyle = {
	width: '100%',
	backgroundColor: colors.card,
	borderRadius: 20,
	padding: 16,
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
	width: 48,
	height: 48,
	borderRadius: 15,
	backgroundColor: colors.active,
	alignItems: 'center',
	justifyContent: 'center',
	marginRight: 12,
	borderWidth: 1,
	borderColor: colors.border,
}

export const orderHeaderInfoStyle: ViewStyle = {
	flex: 1,
	minWidth: 0,
}

export const orderTitleStyle: TextStyle = {
	fontSize: 17,
	fontWeight: '900',
	color: colors.dark,
}

export const orderSubtitleStyle: TextStyle = {
	marginTop: 3,
	fontSize: 12,
	lineHeight: 17,
	color: colors.muted,
}

/* CÓDIGOS QR */

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
	borderRadius: 16,
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

/* TOTAL Y FOLIO */

export const totalCardStyle: ViewStyle = {
	width: '100%',
	backgroundColor: colors.card,
	borderRadius: 18,
	padding: 16,
	marginTop: 2,
	marginBottom: 15,
	borderWidth: 1,
	borderColor: colors.border,
}

export const totalLabelStyle: TextStyle = {
	fontSize: 14,
	fontWeight: '700',
	color: colors.muted,
}

export const totalAmountStyle: TextStyle = {
	marginTop: 3,
	fontSize: 25,
	fontWeight: '900',
	color: colors.price,
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

/* INFORMACIÓN */

export const infoBoxStyle: ViewStyle = {
	width: '100%',
	backgroundColor: colors.card,
	borderRadius: 16,
	padding: 15,
	flexDirection: 'row',
	alignItems: 'center',
	borderWidth: 1,
	borderColor: colors.border,
}

export const infoIconStyle: ViewStyle = {
	width: 38,
	height: 38,
	borderRadius: 12,
	backgroundColor: colors.active,
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
	color: colors.primaryDark,
}

export const infoTextStyle: TextStyle = {
	marginTop: 4,
	fontSize: 12,
	lineHeight: 18,
	color: colors.muted,
}

export const bottomSpaceStyle: ViewStyle = {
	height: 0,
}

/* FOOTER */

export const footerStyle: ViewStyle = {
	position: 'absolute',
	left: 0,
	right: 0,
	bottom: 0,
	backgroundColor: colors.footerBackground,
	paddingHorizontal: 20,
	paddingTop: 13,
	paddingBottom: 20,
	borderTopWidth: 1,
	borderTopColor: colors.borderLight,
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
	color: colors.dark,
}

export const footerTicketCountStyle: TextStyle = {
	marginTop: 3,
	fontSize: 12,
	color: colors.muted,
}

export const footerAmountStyle: TextStyle = {
	fontSize: 23,
	fontWeight: '900',
	color: colors.price,
}

/* ACTION BUTTON: IR AL INICIO */

export const actionButtonWrapperStyle: ViewStyle = {
	width: '100%',
	height: 50,
	borderRadius: 14,
	backgroundColor: colors.button,
	overflow: 'hidden',
}

export const actionButtonStyle: ViewStyle = {
	flex: 1,
	width: '100%',
	height: '100%',
	alignItems: 'center',
	justifyContent: 'center',
	backgroundColor: colors.button,
	borderRadius: 14,
}

export const actionButtonContentStyle: ViewStyle = {
	flexDirection: 'row',
	width: '100%',
	height: '100%',
	alignItems: 'center',
	justifyContent: 'center',
	gap: 9,
}

export const actionButtonPressedStyle: ViewStyle = {
	backgroundColor: colors.buttonPressed,
}

export const actionButtonTextStyle: TextStyle = {
	color: colors.white,
	fontSize: 15,
	fontWeight: '800',
	textAlign: 'center',
}
