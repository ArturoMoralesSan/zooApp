import type { TextStyle, ViewStyle } from 'react-native'

export const colors = {
	background: '#F7F9F8',
	primary: '#075C3B',
	primaryLight: '#16845D',

	card: '#DDF5EA',
	cardLight: '#E8F7F0',
	active: '#BDEED9',

	text: '#17372C',
	textSecondary: '#557067',

	border: '#B8E6D3',

	white: '#FFFFFF',

	coral: '#D95C4F',

	errorBackground: '#FFF3F1',
	errorBorder: '#F3D5D0',
	errorText: '#8C4037',

	mapBackground: '#F8E1DE',
	mapBorder: '#EFC2BC',

	overlay: 'rgba(0,0,0,0.45)',

	iconMuted: '#7DA996',
	logoutIconBackground: '#FFE5E1',
	logoutIconBorder: '#F4D2CD',
}
export const profileContainerStyle: ViewStyle = {
	alignItems: 'center',
}

export const profileAvatarPlaceholderStyle: ViewStyle = {
	backgroundColor: colors.active,
	borderWidth: 1,
	borderColor: colors.border,
}

export const profileNameStyle: TextStyle = {
	color: colors.text,
}

export const profileViewProfileStyle: TextStyle = {
	color: colors.primary,
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

export const menuItemContainerStyle: ViewStyle = {
	backgroundColor: colors.card,
	borderWidth: 1,
	borderColor: colors.border,
	...cardShadow,
}

export const menuItemStyle = (pressed: boolean): ViewStyle => ({
	backgroundColor: colors.card,
	opacity: pressed ? 0.96 : 1,
	transform: [
		{
			scale: pressed ? 0.99 : 1,
		},
	],
})

export const menuIconContainerStyle: ViewStyle = {
	backgroundColor: colors.active,
	borderWidth: 1,
	borderColor: colors.border,
}

export const menuTitleStyle: TextStyle = {
	color: colors.text,
}

export const menuDescriptionStyle: TextStyle = {
	color: colors.textSecondary,
}

export const menuArrowStyle: TextStyle = {
	color: colors.iconMuted,
}

export const logoutContainerStyle: ViewStyle = {
	backgroundColor: colors.errorBackground,
	borderWidth: 1,
	borderColor: colors.errorBorder,
	...cardShadow,
}

export const logoutPressableStyle = (pressed: boolean): ViewStyle => ({
	opacity: pressed ? 0.96 : 1,
	transform: [
		{
			scale: pressed ? 0.99 : 1,
		},
	],
})

export const logoutIconContainerStyle: ViewStyle = {
	backgroundColor: colors.logoutIconBackground,
	borderWidth: 1,
	borderColor: colors.logoutIconBorder,
}

export const logoutTitleStyle: TextStyle = {
	color: colors.coral,
}

export const logoutDescriptionStyle: TextStyle = {
	color: colors.textSecondary,
}

export const footerTitleStyle: TextStyle = {
	color: colors.textSecondary,
}

export const footerSubtitleStyle: TextStyle = {
	color: colors.iconMuted,
}

export const scrollContentStyle: ViewStyle = {
	paddingHorizontal: 20,
	paddingTop: 10,
	paddingBottom: 120,
}

export const backgroundStyle: ViewStyle = {
	backgroundColor: colors.background,
}

export const backgroundImageStyle = {
	opacity: 0.3,
}

export const modalOverlayStyle: ViewStyle = {
	flex: 1,
	backgroundColor: colors.overlay,
	alignItems: 'center',
	justifyContent: 'center',
	paddingHorizontal: 24,
}

export const qrModalStyle: ViewStyle = {
	maxWidth: 400,
	backgroundColor: colors.cardLight,
	borderWidth: 1,
	borderColor: colors.border,
	...cardShadow,
}

export const qrHeaderIconStyle: ViewStyle = {
	backgroundColor: colors.active,
	borderWidth: 1,
	borderColor: colors.border,
}

export const qrTitleStyle: TextStyle = {
	color: colors.text,
}

export const qrDescriptionStyle: TextStyle = {
	color: colors.textSecondary,
}

export const qrContainerStyle: ViewStyle = {
	backgroundColor: colors.white,
	borderWidth: 1,
	borderColor: colors.border,
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
	color: colors.primary,
}

export const qrInfoDescriptionStyle: TextStyle = {
	color: colors.textSecondary,
}

export const qrCloseStyle = (pressed: boolean): ViewStyle => ({
	opacity: pressed ? 0.9 : 1,
	transform: [
		{
			scale: pressed ? 0.98 : 1,
		},
	],
})
