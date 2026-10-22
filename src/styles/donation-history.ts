import type { TextStyle, ViewStyle } from 'react-native'

export const colors = {
	background: '#FFFFFF',
	primary: '#06371c',
	primaryDark: '#063D22',
	primaryLight: '#b8f35d',

	// Todos los textos
	text: '#06371c',
	textSecondary: '#06371c',
	dark: '#06371c',
	muted: '#06371c',

	border: '#a6c1b3',
	card: '#eef4f0',
	cardLight: '#eef4f0',
	active: '#d5ead9',
	iconBackground: '#d5ead9',
	white: '#FFFFFF',

	coral: '#08783F',
	coralLight: '#d5ead9',
	orange: '#06371c',
	orangeLight: '#eef4f0',

	button: '#08783F',
	buttonPressed: '#063D22',
}
export const containerStyle: ViewStyle = {
	flex: 1,
	backgroundColor: colors.background,
}

export const backgroundStyle: ViewStyle = {
	flex: 1,
}

export const backgroundImageStyle = {
	opacity: 0.15,
}

export const scrollContentStyle: ViewStyle = {
	paddingHorizontal: 20,
	paddingTop: 0,
	paddingBottom: 40,
}

export const backButtonStyle: ViewStyle = {
	position: 'absolute',
	left: 20,
	top: 8,
	zIndex: 20,
	borderRadius: 16,
	paddingHorizontal: 15,
	paddingVertical: 9,
}

export const backTextStyle: TextStyle = {
	fontSize: 15,
	fontWeight: '700',
	color: colors.text,
}

export const headerStyle: ViewStyle = {
	marginBottom: 20,
}

export const titleStyle: TextStyle = {
	fontSize: 27,
	fontWeight: '800',
	color: colors.text,
}

export const subtitleStyle: TextStyle = {
	marginTop: 4,
	fontSize: 14,
	lineHeight: 20,
	color: colors.textSecondary,
}

/* Sombras ligeras como en el Panel */
export const cardShadow: ViewStyle = {
	shadowColor: colors.primaryDark,
	shadowOffset: {
		width: 0,
		height: 2,
	},
	shadowOpacity: 0.05,
	shadowRadius: 5,
	elevation: 2,
}

/* Estadísticas */
export const statsContainerStyle: ViewStyle = {
	width: '100%',
	flexDirection: 'row',
	alignItems: 'stretch',
	gap: 10,
	marginBottom: 22,
}

export const statCardStyle: ViewStyle = {
	flex: 1,
	minWidth: 0,
	backgroundColor: colors.card,
	borderRadius: 18,
	paddingHorizontal: 7,
	paddingVertical: 16,
	flexDirection: 'column',
	alignItems: 'center',
	justifyContent: 'center',
	borderWidth: 1,
	borderColor: colors.border,
	...cardShadow,
}

export const statIconStyle: ViewStyle = {
	width: 42,
	height: 42,
	borderRadius: 14,
	backgroundColor: colors.iconBackground,
	alignItems: 'center',
	justifyContent: 'center',
	marginRight: 10,
	borderWidth: 1,
	borderColor: colors.border,
}

export const statNumberStyle: TextStyle = {
	fontSize: 21,
	fontWeight: '800',
	color: colors.primary,
	textAlign: 'center',
}

export const statLabelStyle: TextStyle = {
	marginTop: 6,
	fontSize: 11,
	fontWeight: '500',
	color: colors.muted,
	textAlign: 'center',
}

/* Tarjeta de total */
export const totalCardStyle: ViewStyle = {
	width: '100%',
	backgroundColor: colors.cardLight,
	borderRadius: 18,
	padding: 16,
	marginBottom: 22,
	flexDirection: 'row',
	alignItems: 'center',
	borderWidth: 1,
	borderColor: colors.border,
	...cardShadow,
}

export const totalIconStyle: ViewStyle = {
	width: 48,
	height: 48,
	borderRadius: 15,
	backgroundColor: colors.iconBackground,
	alignItems: 'center',
	justifyContent: 'center',
	marginRight: 12,
	borderWidth: 1,
	borderColor: colors.border,
}

export const totalInfoStyle: ViewStyle = {
	flex: 1,
}

export const totalLabelStyle: TextStyle = {
	fontSize: 12,
	fontWeight: '600',
	color: colors.textSecondary,
}

export const totalAmountStyle: TextStyle = {
	marginTop: 3,
	fontSize: 24,
	fontWeight: '800',
	color: colors.primary,
}

/* Cargando */
export const loadingContainerStyle: ViewStyle = {
	paddingVertical: 60,
	alignItems: 'center',
	justifyContent: 'center',
}

export const loadingTextStyle: TextStyle = {
	marginTop: 12,
	fontSize: 14,
	color: colors.muted,
}

/* Estado vacío */
export const emptyCardStyle: ViewStyle = {
	width: '100%',
	backgroundColor: colors.cardLight,
	borderRadius: 22,
	paddingHorizontal: 25,
	paddingVertical: 32,
	alignItems: 'center',
	borderWidth: 1,
	borderColor: colors.border,
	...cardShadow,
}

export const emptyIconStyle: ViewStyle = {
	width: 62,
	height: 62,
	borderRadius: 18,
	backgroundColor: colors.iconBackground,
	alignItems: 'center',
	justifyContent: 'center',
	marginBottom: 16,
	borderWidth: 1,
	borderColor: colors.border,
}

export const emptyTitleStyle: TextStyle = {
	fontSize: 18,
	fontWeight: '800',
	color: colors.text,
	textAlign: 'center',
}

export const emptyTextStyle: TextStyle = {
	marginTop: 7,
	fontSize: 13,
	lineHeight: 19,
	color: colors.textSecondary,
	textAlign: 'center',
}

export const buyButtonStyle: ViewStyle = {
	width: '100%',
	minHeight: 48,
	alignItems: 'center',
	justifyContent: 'center',
	borderRadius: 14,
	backgroundColor: colors.button,
}

export const buyButtonTextStyle: TextStyle = {
	color: colors.white,
	fontSize: 14,
	fontWeight: '700',
}

/* Historial */
export const donationsListStyle: ViewStyle = {
	width: '100%',
}

export const sectionTitleStyle: TextStyle = {
	marginBottom: 12,
	fontSize: 18,
	fontWeight: '800',
	color: colors.text,
}

export const donationCardStyle: ViewStyle = {
	width: '100%',
	backgroundColor: colors.cardLight,
	borderRadius: 20,
	padding: 16,
	marginBottom: 13,
	borderWidth: 1,
	borderColor: colors.border,
	...cardShadow,
}

export const donationHeaderStyle: ViewStyle = {
	flexDirection: 'row',
	alignItems: 'center',
}

export const donationIconStyle: ViewStyle = {
	width: 46,
	height: 46,
	borderRadius: 15,
	backgroundColor: colors.iconBackground,
	alignItems: 'center',
	justifyContent: 'center',
	marginRight: 11,
	borderWidth: 1,
	borderColor: colors.border,
}

export const donationInfoStyle: ViewStyle = {
	flex: 1,
	minWidth: 0,
}

export const donationAmountStyle: TextStyle = {
	fontSize: 19,
	fontWeight: '800',
	color: colors.primary,
}

export const donationDateStyle: TextStyle = {
	marginTop: 4,
	fontSize: 12,
	color: colors.textSecondary,
}

export const donationTimeStyle: TextStyle = {
	marginTop: 2,
	fontSize: 11,
	color: colors.muted,
}

export const statusBadgeStyle: ViewStyle = {
	borderRadius: 10,
	paddingHorizontal: 8,
	paddingVertical: 5,
	marginLeft: 7,
	borderWidth: 1,
}

export const statusTextStyle: TextStyle = {
	fontSize: 10,
	fontWeight: '700',
}

export const dividerStyle: ViewStyle = {
	height: 1,
	backgroundColor: colors.border,
	marginVertical: 14,
}

/* Dos columnas: método de pago y referencia */
export const infoRowStyle: ViewStyle = {
	width: '100%',
	flexDirection: 'row',
	alignItems: 'flex-start',
	gap: 16,
}

export const infoBlockStyle: ViewStyle = {
	flex: 1,
	minWidth: 0,
}

export const infoLabelStyle: TextStyle = {
	fontSize: 11,
	fontWeight: '500',
	color: colors.textSecondary,
}

export const paymentRowStyle: ViewStyle = {
	flexDirection: 'row',
	alignItems: 'center',
	marginTop: 6,
}

export const infoValueStyle: TextStyle = {
	marginLeft: 6,
	fontSize: 12,
	fontWeight: '600',
	lineHeight: 18,
	color: colors.text,
	flexShrink: 1,
}

export const referenceContainerStyle: ViewStyle = {
	flex: 1,
	minWidth: 0,
	marginTop: 0,
	paddingTop: 0,
	borderTopWidth: 0,
	flexDirection: 'column',
	alignItems: 'flex-start',
}

export const referenceInfoStyle: ViewStyle = {
	width: '100%',
	marginLeft: 0,
}
