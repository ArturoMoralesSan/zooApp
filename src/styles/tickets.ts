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
	borderLight: '#eef4f0',
	borderStrong: '#a6c1b3',
	card: '#eef4f0',
	cardLight: '#eef4f0',
	active: '#d5ead9',
	iconBackground: '#d5ead9',
	white: '#FFFFFF',
	coral: '#08783F',
	button: '#08783F',
	buttonPressed: '#063D22',
	buttonDisabled: '#a6c1b3',
	footerBackground: '#FFFFFF',
	price: '#12482e',
} as const

/* SOMBRAS */

export const cardShadow: ViewStyle = {
	shadowColor: colors.primaryDark,
	shadowOffset: { width: 0, height: 2 },
	shadowOpacity: 0.04,
	shadowRadius: 4,
	elevation: 1,
}

/* FONDO */

export const backgroundStyle: ViewStyle = {
	flex: 1,
	backgroundColor: colors.background,
}

export const backgroundImageStyle: ImageStyle = {
	opacity: 0.025,
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
	color: colors.textSecondary,
	fontSize: 15,
	fontWeight: '600',
}

/* ENCABEZADO */

export const screenHeaderStyle: ViewStyle = {
	paddingBottom: 12,
}

export const backButtonContainerStyle: ViewStyle = {
	marginBottom: 12,
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
	backgroundColor: colors.white,
	borderWidth: 1,
	borderColor: colors.border,
	borderRadius: 16,
	paddingHorizontal: 15,
	paddingVertical: 9,
	...cardShadow,
}

export const backButtonPressedStyle: ViewStyle = {
	opacity: 0.84,
	backgroundColor: colors.card,
}

export const backTextStyle: TextStyle = {
	fontSize: 14,
	fontWeight: '700',
	color: colors.text,
}

export const headerTextContainerStyle: ViewStyle = {
	width: '100%',
	marginTop: 17,
}

export const titleStyle: TextStyle = {
	fontSize: 27,
	lineHeight: 34,
	fontWeight: '900',
	color: colors.text,
	letterSpacing: -0.5,
}

export const subtitleStyle: TextStyle = {
	marginTop: 4,
	fontSize: 14,
	lineHeight: 20,
	color: colors.textSecondary,
}

/* LISTA */

export const scrollContentStyle: ViewStyle = {
	paddingHorizontal: 20,
	paddingTop: 4,
	paddingBottom: 24,
	flexGrow: 1,
}

export const bottomSpaceStyle: ViewStyle = {
	height: 12,
}

/* TARJETA DEL BOLETO */

export const ticketCardStyle: ViewStyle = {
	width: '100%',
	backgroundColor: colors.card,
	borderRadius: 18,
	padding: 15,
	marginBottom: 13,
	borderWidth: 1,
	borderColor: colors.border,
	...cardShadow,
}

/* SECCIÓN SUPERIOR */

export const ticketHeaderStyle: ViewStyle = {
	flexDirection: 'row',
	alignItems: 'flex-start',
	width: '100%',
}

export const ticketIconStyle: ViewStyle = {
	width: 48,
	height: 48,
	borderRadius: 14,
	backgroundColor: colors.active,
	alignItems: 'center',
	justifyContent: 'center',
	marginRight: 12,
	borderWidth: 1,
	borderColor: colors.border,
	flexShrink: 0,
}

export const ticketInfoStyle: ViewStyle = {
	flex: 1,
	minWidth: 0,
	justifyContent: 'center',
}

export const ticketNameStyle: TextStyle = {
	fontSize: 15,
	lineHeight: 20,
	fontWeight: '800',
	color: colors.text,
}

export const ticketDescriptionStyle: TextStyle = {
	marginTop: 3,
	fontSize: 12,
	color: colors.textSecondary,
	lineHeight: 16,
}

/* DIVISOR */

export const ticketDividerStyle: ViewStyle = {
	height: 1,
	backgroundColor: colors.border,
	marginTop: 15,
	marginBottom: 13,
}

/* PRECIO Y MONTO */

export const ticketBottomStyle: ViewStyle = {
	flexDirection: 'row',
	alignItems: 'center',
	justifyContent: 'space-between',
	width: '100%',
}

export const ticketPriceContainerStyle: ViewStyle = {
	flex: 1,
	minWidth: 0,
	justifyContent: 'center',
	paddingRight: 8,
}

export const ticketPriceLabelStyle: TextStyle = {
	fontSize: 11,
	fontWeight: '600',
	color: colors.textSecondary,
}

export const ticketPriceStyle: TextStyle = {
	marginTop: 2,
	fontSize: 20,
	fontWeight: '900',
	color: colors.price,
}

export const ticketAmountStyle: TextStyle = {
	marginTop: 3,
	fontSize: 12,
	fontWeight: '600',
	color: colors.textSecondary,
}

/* CONTROLES DE CANTIDAD */

export const quantityContainerStyle: ViewStyle = {
	flexDirection: 'row',
	alignItems: 'center',
	justifyContent: 'flex-end',
	marginLeft: 4,
	gap: 8,
	flexShrink: 0,
}

/* BOTÓN MENOS */

export const quantityButtonStyle: ViewStyle = {
	width: 40,
	height: 40,
	minWidth: 40,
	minHeight: 40,
	borderRadius: 12,
	backgroundColor: colors.white,
	alignItems: 'center',
	justifyContent: 'center',
	borderWidth: 1,
	borderColor: colors.border,
	flexShrink: 0,
	padding: 0,
}

export const quantityButtonDisabledStyle: ViewStyle = {
	backgroundColor: colors.card,
	borderColor: colors.border,
	opacity: 0.7,
}

/* BOTÓN MÁS */

export const quantityPlusButtonStyle: ViewStyle = {
	width: 40,
	height: 40,
	minWidth: 40,
	minHeight: 40,
	flexGrow: 0,
	flexShrink: 0,
	borderRadius: 12,
	backgroundColor: colors.primary,
	alignItems: 'center',
	justifyContent: 'center',
	borderWidth: 0,
	padding: 0,
}

export const quantityPlusPressedStyle: ViewStyle = {
	backgroundColor: colors.primaryDark,
}

export const quantityPlusDisabledStyle: ViewStyle = {
	backgroundColor: colors.buttonDisabled,
}

export const quantityPlusTextStyle: TextStyle = {
	color: colors.white,
	fontSize: 28,
	fontWeight: '600',
	lineHeight: 32,
	textAlign: 'center',
	includeFontPadding: false,
}

/* CANTIDAD */

export const quantityStyle: ViewStyle = {
	width: 34,
	minWidth: 34,
	height: 40,
	alignItems: 'center',
	justifyContent: 'center',
	flexShrink: 0,
}

export const quantityTextStyle: TextStyle = {
	fontSize: 15,
	fontWeight: '800',
	color: colors.text,
	textAlign: 'center',
	includeFontPadding: false,
}

/* ESTADO VACÍO */

export const emptyStateStyle: ViewStyle = {
	alignItems: 'center',
	justifyContent: 'center',
	paddingHorizontal: 24,
	paddingVertical: 32,
	backgroundColor: colors.card,
	borderRadius: 18,
	borderWidth: 1,
	borderColor: colors.border,
	...cardShadow,
}

export const emptyStateIconContainerStyle: ViewStyle = {
	width: 58,
	height: 58,
	borderRadius: 16,
	backgroundColor: colors.active,
	alignItems: 'center',
	justifyContent: 'center',
	marginBottom: 14,
	borderWidth: 1,
	borderColor: colors.border,
}

export const emptyStateTitleStyle: TextStyle = {
	color: colors.text,
	fontSize: 17,
	fontWeight: '800',
	textAlign: 'center',
}

export const emptyStateDescriptionStyle: TextStyle = {
	color: colors.textSecondary,
	fontSize: 13,
	lineHeight: 19,
	textAlign: 'center',
	marginTop: 6,
}

/* ESPACIO FINAL */

export const listBottomSpaceStyle: ViewStyle = {
	height: 8,
}

/* FOOTER FIJO */

export const footerStyle: ViewStyle = {
	flexShrink: 0,
	backgroundColor: colors.footerBackground,
	paddingHorizontal: 20,
	paddingTop: 14,
	paddingBottom: 16,
	borderTopWidth: 1,
	borderTopColor: colors.borderLight,
	shadowColor: colors.primaryDark,
	shadowOffset: { width: 0, height: -2 },
	shadowOpacity: 0.04,
	shadowRadius: 8,
	elevation: 5,
}

export const footerSummaryStyle: ViewStyle = {
	flexDirection: 'row',
	justifyContent: 'space-between',
	alignItems: 'center',
	marginBottom: 12,
}

export const footerTextContainerStyle: ViewStyle = {
	flex: 1,
	minWidth: 0,
	paddingRight: 12,
}

export const footerTotalLabelStyle: TextStyle = {
	fontSize: 15,
	fontWeight: '700',
	color: colors.text,
}

export const footerTicketCountStyle: TextStyle = {
	marginTop: 4,
	fontSize: 14,
	color: colors.muted,
}

export const footerTotalAmountStyle: TextStyle = {
	fontSize: 30,
	fontWeight: '800',
	color: colors.price,
	fontVariant: ['tabular-nums'],
}

/* RESUMEN ALTERNATIVO */

export const totalContainerStyle: ViewStyle = {
	flexDirection: 'row',
	justifyContent: 'space-between',
	alignItems: 'center',
	backgroundColor: colors.card,
	borderRadius: 18,
	borderWidth: 1,
	borderColor: colors.border,
	paddingHorizontal: 15,
	paddingVertical: 12,
	marginBottom: 13,
}

export const totalLabelStyle: TextStyle = {
	fontSize: 15,
	fontWeight: '800',
	color: colors.text,
}

export const ticketCountStyle: TextStyle = {
	marginTop: 3,
	fontSize: 12,
	color: colors.textSecondary,
}

export const totalStyle: TextStyle = {
	fontSize: 23,
	fontWeight: '900',
	color: colors.price,
	letterSpacing: -0.4,
}

/* BOTÓN CONTINUAR */

export const continueButtonWrapperStyle: ViewStyle = {
	width: '100%',
	height: 52,
	borderRadius: 16,
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
}

export const continueButtonContentStyle: ViewStyle = {
	width: '100%',
	height: 52,
	alignItems: 'center',
	justifyContent: 'center',
}

export const continueButtonPressedStyle: ViewStyle = {
	backgroundColor: colors.buttonPressed,
}

export const continueButtonDisabledStyle: ViewStyle = {
	backgroundColor: colors.buttonDisabled,
	borderColor: colors.buttonDisabled,
	opacity: 0.8,
}

export const continueButtonTextStyle: TextStyle = {
	color: colors.white,
	fontSize: 16,
	fontWeight: '800',
	textAlign: 'center',
	includeFontPadding: false,
}
