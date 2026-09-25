import type { TextStyle, ViewStyle } from 'react-native'

export const colors = {
	background: '#F7F9F8',
	primary: '#075C3B',
	textSecondary: '#557067',
	border: '#B8E6D3',
}

export const tabBarContainerStyle: ViewStyle = {
	position: 'absolute',
	bottom: 0,
	left: 0,
	right: 0,
}

export const tabBarStyle: ViewStyle = {
	width: '100%',
	height: 76,

	backgroundColor: colors.background,

	borderTopWidth: 1,
	borderTopColor: colors.border,

	flexDirection: 'row',
	alignItems: 'center',

	paddingHorizontal: 8,
	paddingTop: 6,
	paddingBottom: 6,

	shadowColor: colors.primary,
	shadowOffset: {
		width: 0,
		height: -4,
	},
	shadowOpacity: 0.1,
	shadowRadius: 10,

	elevation: 12,
}

export const tabButtonStyle: ViewStyle = {
	flex: 1,
	height: '100%',
	alignItems: 'center',
	justifyContent: 'center',
}

export const tabLabelStyle = (focused: boolean): TextStyle => ({
	marginTop: 3,
	fontSize: 11,
	fontWeight: focused ? '700' : '500',
	color: focused ? colors.primary : colors.textSecondary,
})
