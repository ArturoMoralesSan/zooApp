import type { ImageStyle, TextStyle, ViewStyle } from 'react-native'

export const colors = {
	background: '#FFFFFF',

	primary: '#08783F',
	primaryDark: '#063D22',
	primaryLight: '#b8f35d',

	card: '#eef4f0',
	cardLight: '#eef4f0',
	active: '#d5ead9',

	text: '#06371c',
	textSecondary: '#06371c',

	border: '#a6c1b3',

	white: '#FFFFFF',

	coral: '#08783F',

	errorBackground: '#eef4f0',
	errorBorder: '#a6c1b3',
	errorText: '#06371c',

	mapBackground: '#eef4f0',
	mapBorder: '#a6c1b3',

	overlay: 'rgba(6, 61, 34, 0.55)',

	iconMuted: '#06371c',
	logoutIconBackground: '#d5ead9',
	logoutIconBorder: '#a6c1b3',
}

// PERFIL

export const profileContainerStyle: ViewStyle = {
	alignItems: 'center',
}

export const profileAvatarPlaceholderStyle: ViewStyle = {
	backgroundColor: colors.cardLight,
	borderWidth: 1,
	borderColor: colors.border,
}

export const profileNameStyle: TextStyle = {
	color: colors.text,
	fontWeight: '800',
}

export const profileViewProfileStyle: TextStyle = {
	color: colors.primary,
}

// SOMBRAS

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

// TARJETAS DEL MENÚ

export const menuItemContainerStyle: ViewStyle = {
	backgroundColor: colors.card,
	borderWidth: 1,
	borderColor: colors.border,
	borderRadius: 18,
	...cardShadow,
}

export const menuItemStyle = (pressed: boolean): ViewStyle => ({
	backgroundColor: colors.card,
	opacity: pressed ? 0.84 : 1,
})

export const menuIconContainerStyle: ViewStyle = {
	backgroundColor: colors.active,
	borderWidth: 1,
	borderColor: colors.border,
}

export const menuTitleStyle: TextStyle = {
	color: colors.text,
	fontWeight: '800',
	fontSize: 16,
}

export const menuDescriptionStyle: TextStyle = {
	color: colors.textSecondary,
	fontSize: 12,
	lineHeight: 16,
}

export const menuArrowStyle: TextStyle = {
	color: colors.primary,
}

// CERRAR SESIÓN

export const logoutContainerStyle: ViewStyle = {
	backgroundColor: colors.errorBackground,
	borderWidth: 1,
	borderColor: colors.errorBorder,
	borderRadius: 18,
	...cardShadow,
}

export const logoutPressableStyle = (pressed: boolean): ViewStyle => ({
	opacity: pressed ? 0.84 : 1,
})

export const logoutIconContainerStyle: ViewStyle = {
	backgroundColor: colors.logoutIconBackground,
	borderWidth: 1,
	borderColor: colors.logoutIconBorder,
}

export const logoutTitleStyle: TextStyle = {
	color: colors.text,
	fontWeight: '800',
}

export const logoutDescriptionStyle: TextStyle = {
	color: colors.textSecondary,
}

// FOOTER

export const footerTitleStyle: TextStyle = {
	color: colors.textSecondary,
	fontWeight: '800',
}

export const footerSubtitleStyle: TextStyle = {
	color: colors.iconMuted,
}

// PANTALLA

export const scrollContentStyle: ViewStyle = {
	paddingHorizontal: 12,
	paddingTop: 8,
	paddingBottom: 120,
}

export const backgroundStyle: ViewStyle = {
	flex: 1,
	backgroundColor: colors.background,
}

export const backgroundImageStyle: ImageStyle = {
	opacity: 0.025,
}

// MODAL QR

export const modalOverlayStyle: ViewStyle = {
	flex: 1,
	backgroundColor: colors.overlay,
	alignItems: 'center',
	justifyContent: 'center',
	paddingHorizontal: 24,
}

export const qrModalStyle: ViewStyle = {
	width: '100%',
	maxWidth: 400,
	backgroundColor: colors.cardLight,
	borderWidth: 1,
	borderColor: colors.border,
	borderRadius: 28,
	...cardShadow,
}

export const qrHeaderIconStyle: ViewStyle = {
	backgroundColor: colors.active,
	borderWidth: 1,
	borderColor: colors.border,
}

export const qrTitleStyle: TextStyle = {
	color: colors.text,
	fontWeight: '800',
}

export const qrDescriptionStyle: TextStyle = {
	color: colors.textSecondary,
}

export const qrContainerStyle: ViewStyle = {
	backgroundColor: colors.white,
	borderWidth: 1,
	borderColor: colors.border,
	borderRadius: 24,
	...cardShadow,
}

export const qrLoadingStyle: ViewStyle = {
	width: 240,
	height: 240,
	alignItems: 'center',
	justifyContent: 'center',
}

export const qrInfoStyle: ViewStyle = {
	backgroundColor: colors.active,
	borderWidth: 1,
	borderColor: colors.border,
}

export const qrInfoTitleStyle: TextStyle = {
	color: colors.text,
	fontWeight: '800',
}

export const qrInfoDescriptionStyle: TextStyle = {
	color: colors.textSecondary,
}

export const qrCloseStyle = (pressed: boolean): ViewStyle => ({
	opacity: pressed ? 0.85 : 1,
})
