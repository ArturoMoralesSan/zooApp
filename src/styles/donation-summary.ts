import type { ImageStyle, TextStyle, ViewStyle } from 'react-native'

export const colors = {
	background: '#FFFFFF',

	primary: '#08783F',
	primaryDark: '#063D22',
	primaryLight: '#B5F451',

	card: '#EEF5F0',
	cardLight: '#EEF5F0',
	active: '#D6EBDD',

	text: '#102E20',
	textSecondary: '#315744',

	border: '#B8D5C2',

	white: '#FFFFFF',

	coral: '#C7473D',

	errorBackground: '#FFF3F1',
	errorBorder: '#F3D5D0',
	errorText: '#8C4037',

	footerBackground: '#FFFFFF',

	iconMuted: '#607A6A',
	logoutIconBackground: '#FFE5E1',
	logoutIconBorder: '#F4D2CD',

	securityIconBackground: '#042C17',
}

/* SOMBRAS */

export const cardShadow: ViewStyle = {
	shadowColor: '#164A2C',
	shadowOffset: {
		width: 0,
		height: 2,
	},
	shadowOpacity: 0.04,
	shadowRadius: 4,
	elevation: 1,
}

/* PANTALLA */

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

export const scrollContentStyle: ViewStyle = {
	paddingHorizontal: 20,
	paddingTop: 8,
	paddingBottom: 180,
}

export const bottomSpaceStyle: ViewStyle = {
	height: 40,
}

/* ENCABEZADO */

export const backButtonStyle: ViewStyle = {
	position: 'absolute',
	left: 20,
	top: 0,
	zIndex: 20,
}

export const backButtonPressedStyle: ViewStyle = {
	backgroundColor: colors.card,
	opacity: 0.84,
}

export const backTextStyle: TextStyle = {
	fontSize: 15,
	fontWeight: '700',
	color: colors.text,
}

export const headerStyle: ViewStyle = {
	marginBottom: 20,
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
	color: colors.primaryDark,
}

export const subtitleStyle: TextStyle = {
	marginTop: 4,
	fontSize: 14,
	lineHeight: 20,
	color: colors.textSecondary,
}

/* CARD DE DONACIÓN Y DETALLE DEL PAGO */

export const amountCardStyle: ViewStyle = {
	width: '100%',
	backgroundColor: colors.card,
	borderRadius: 18,
	padding: 17,
	marginBottom: 17,
	borderWidth: 1,
	borderColor: colors.border,
	...cardShadow,
}

export const amountIconStyle: ViewStyle = {
	width: 54,
	height: 54,
	borderRadius: 17,
	backgroundColor: colors.active,
	borderWidth: 1,
	borderColor: colors.border,
	alignItems: 'center',
	justifyContent: 'center',
	flexShrink: 0,
}

export const amountLabelStyle: TextStyle = {
	fontSize: 14,
	fontWeight: '800',
	color: colors.textSecondary,
}

export const amountStyle: TextStyle = {
	marginTop: 3,
	fontSize: 38,
	lineHeight: 46,
	fontWeight: '900',
	color: colors.primary,
	maxWidth: '90%',
}

export const amountDescriptionStyle: TextStyle = {
	marginTop: 5,
	fontSize: 12,
	color: colors.textSecondary,
	textAlign: 'center',
}

export const detailCardStyle: ViewStyle = {
	width: '100%',
	backgroundColor: colors.card,
	borderRadius: 18,
	padding: 17,
	marginBottom: 17,
	borderWidth: 1,
	borderColor: colors.border,
	...cardShadow,
}

export const sectionTitleStyle: TextStyle = {
	marginBottom: 12,
	fontSize: 14,
	fontWeight: '900',
	color: colors.primaryDark,
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

export const detailTextContainerStyle: ViewStyle = {
	flex: 1,
	minWidth: 0,
}

export const detailTitleStyle: TextStyle = {
	fontSize: 14,
	fontWeight: '800',
	color: colors.text,
}

export const detailDescriptionStyle: TextStyle = {
	marginTop: 2,
	fontSize: 11,
	color: colors.textSecondary,
}

export const detailValueStyle: TextStyle = {
	fontSize: 15,
	fontWeight: '900',
	color: colors.primary,
}

export const paymentSelectedStyle: TextStyle = {
	fontSize: 13,
	fontWeight: '900',
	color: colors.primary,
}

export const separatorStyle: ViewStyle = {
	height: 1,
	backgroundColor: colors.border,
	marginVertical: 7,
}

/* PAGO SEGURO */

export const securityCardStyle: ViewStyle = {
	width: '100%',
	backgroundColor: colors.card,
	borderRadius: 18,
	padding: 17,
	marginBottom: 17,
	flexDirection: 'row',
	alignItems: 'center',
	borderWidth: 1,
	borderColor: colors.border,
	...cardShadow,
}

export const securityIconStyle: ViewStyle = {
	width: 48,
	height: 48,
	borderRadius: 15,
	backgroundColor: colors.securityIconBackground,
	borderWidth: 1,
	borderColor: colors.securityIconBackground,
	alignItems: 'center',
	justifyContent: 'center',
	marginRight: 13,
}

export const securityContentStyle: ViewStyle = {
	flex: 1,
	minWidth: 0,
}

export const securityTitleStyle: TextStyle = {
	fontSize: 15,
	fontWeight: '900',
	color: colors.primaryDark,
}

export const securityTextStyle: TextStyle = {
	marginTop: 3,
	fontSize: 12,
	lineHeight: 17,
	color: colors.textSecondary,
}

/* AGRADECIMIENTO */

export const thanksCardStyle: ViewStyle = {
	width: '100%',
	backgroundColor: colors.active,
	borderRadius: 18,
	padding: 17,
	borderWidth: 1,
	borderColor: colors.border,
	...cardShadow,
}

export const thanksTitleStyle: TextStyle = {
	fontSize: 15,
	fontWeight: '900',
	color: colors.primaryDark,
}

export const thanksTextStyle: TextStyle = {
	marginTop: 5,
	fontSize: 12,
	lineHeight: 18,
	color: colors.textSecondary,
}

/* ERRORES */

export const errorCardStyle: ViewStyle = {
	width: '100%',
	backgroundColor: colors.errorBackground,
	borderRadius: 18,
	padding: 14,
	marginTop: 15,
	borderWidth: 1,
	borderColor: colors.errorBorder,
}

export const errorTextStyle: TextStyle = {
	fontSize: 13,
	lineHeight: 18,
	fontWeight: '700',
	color: colors.errorText,
}

/* FOOTER Y TOTAL */

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
}

export const totalContainerStyle: ViewStyle = {
	flexDirection: 'row',
	justifyContent: 'space-between',
	alignItems: 'center',
	marginBottom: 12,
}

export const totalInfoStyle: ViewStyle = {
	flex: 1,
	minWidth: 0,
	marginRight: 10,
}

export const totalLabelStyle: TextStyle = {
	fontSize: 14,
	fontWeight: '800',
	color: colors.textSecondary,
}

export const totalDescriptionStyle: TextStyle = {
	marginTop: 2,
	fontSize: 11,
	color: colors.textSecondary,
}

export const totalStyle: TextStyle = {
	fontSize: 23,
	fontWeight: '900',
	color: colors.primary,
	maxWidth: 150,
}

/* BOTÓN DE CONFIRMACIÓN */

export const confirmButtonWrapperStyle: ViewStyle = {
	width: '100%',
	height: 54,
	borderRadius: 17,
	backgroundColor: colors.primary,
	borderWidth: 1,
	borderColor: colors.primary,
	overflow: 'hidden',
	...cardShadow,
}

export const confirmButtonDisabledStyle: ViewStyle = {
	opacity: 0.45,
}

export const confirmButtonLoadingStyle: ViewStyle = {
	opacity: 0.8,
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
	flexDirection: 'row',
	alignItems: 'center',
	justifyContent: 'center',
	gap: 8,
}

export const confirmButtonPressedStyle: ViewStyle = {
	backgroundColor: colors.primaryDark,
}

export const confirmButtonTextStyle: TextStyle = {
	color: colors.white,
	fontSize: 16,
	fontWeight: '900',
	textAlign: 'center',
}
