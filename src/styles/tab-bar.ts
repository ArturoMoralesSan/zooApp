import type { TextStyle, ViewStyle } from 'react-native'

export const colors = {
	background: '#FFFFFF',
	primary: '#075C2B',
	textSecondary: '#557067',
	border: '#A7C9B1',
	activeBackground: '#075C2B',
}

export const tabBarContainerStyle: ViewStyle = {
	position: 'absolute',
	bottom: 0,
	left: 0,
	right: 0,
	paddingHorizontal: 12,
	paddingBottom: 22,
	backgroundColor: 'transparent',
}

export const tabBarStyle: ViewStyle = {
	width: '100%',
	minHeight: 72,
	backgroundColor: colors.background,

	// Borde verde fino en los cuatro lados
	borderWidth: 0.8,
	borderTopWidth: 0.8,
	borderBottomWidth: 0.8,
	borderLeftWidth: 0.8,
	borderRightWidth: 0.8,
	borderColor: colors.border,
	borderRadius: 22,

	flexDirection: 'row',
	alignItems: 'center',
	paddingHorizontal: 6,
	paddingVertical: 6,

	// Sin sombra
	elevation: 0,
	shadowColor: 'transparent',
	shadowOffset: {
		width: 0,
		height: 0,
	},
	shadowOpacity: 0,
	shadowRadius: 0,
}

export const tabButtonStyle: ViewStyle = {
	flex: 1,
	minWidth: 0,
	height: 58,
	borderRadius: 16,
	alignItems: 'center',
	justifyContent: 'center',
}

export const activeTabButtonStyle: ViewStyle = {
	backgroundColor: colors.activeBackground,
}

export const tabLabelStyle = (focused: boolean): TextStyle => ({
	marginTop: 4,
	fontSize: 11,
	fontWeight: focused ? '700' : '500',
	color: focused ? '#FFFFFF' : colors.textSecondary,
})
