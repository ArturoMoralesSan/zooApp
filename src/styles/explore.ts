import { Dimensions, type TextStyle, type ViewStyle } from 'react-native'

const { width: screenWidth } = Dimensions.get('window')

export const horizontalPadding = 17

export const carouselGap = 12

export const eventCardWidth = screenWidth - horizontalPadding * 2

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
	blue: '#48C6D1',
	coral: '#D95C4F',
	gold: '#E8B84A',
	errorBackground: '#FFF3F1',
	errorBorder: '#F3D5D0',
	errorText: '#8C4037',
	mapBackground: '#F8E1DE',
	mapBorder: '#EFC2BC',
	eventOverlay: 'rgba(7, 92, 59, 0.84)',
	inactiveDot: '#7C9C90',
	whiteTransparent: 'rgba(255,255,255,0.9)',
	whiteTransparent65: 'rgba(255,255,255,0.65)',
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

export const screenStyle: ViewStyle = {
	flex: 1,
	backgroundColor: colors.background,
}

export const backgroundStyle: ViewStyle = {
	flex: 1,
	backgroundColor: colors.background,
}

export const backgroundImageStyle = {
	opacity: 0.08,
}

export const scrollContentStyle: ViewStyle = {
	paddingHorizontal: horizontalPadding,
	paddingTop: 10,
	paddingBottom: 120,
}

export const headerTitleStyle: TextStyle = {
	color: colors.primary,
	fontSize: 23,
	fontWeight: '800',
	letterSpacing: -0.5,
}

export const badgeStyle: ViewStyle = {
	backgroundColor: colors.card,
}

export const badgeTextStyle: TextStyle = {
	color: colors.primary,
	fontSize: 13,
	fontWeight: '800',
}

export const loadingCardStyle: ViewStyle = {
	height: 214,
	backgroundColor: colors.cardLight,
	borderWidth: 1,
	borderColor: colors.border,
	...cardShadow,
}

export const loadingTextStyle: TextStyle = {
	color: colors.textSecondary,
}

export const errorCardStyle: ViewStyle = {
	backgroundColor: colors.errorBackground,
	borderWidth: 1,
	borderColor: colors.errorBorder,
}

export const titleTextStyle: TextStyle = {
	color: colors.text,
}

export const secondaryTextStyle: TextStyle = {
	color: colors.textSecondary,
}

export const retryButtonStyle = (pressed: boolean): ViewStyle => ({
	backgroundColor: pressed ? colors.primaryLight : colors.primary,
	transform: [
		{
			scale: pressed ? 0.98 : 1,
		},
	],
})

export const eventCardContainerStyle = (
	index: number,
	total: number,
): ViewStyle => ({
	width: eventCardWidth,
	marginRight: index === total - 1 ? 0 : carouselGap,
})

export const eventCardStyle: ViewStyle = {
	height: 214,
	backgroundColor: colors.cardLight,
	borderWidth: 1,
	borderColor: colors.border,
	...cardShadow,
}

export const eventPressableStyle = (pressed: boolean): ViewStyle => ({
	opacity: pressed ? 0.97 : 1,
	transform: [
		{
			scale: pressed ? 0.995 : 1,
		},
	],
})

export const eventFallbackStyle: ViewStyle = {
	backgroundColor: colors.active,
}

export const eventFallbackTextStyle: TextStyle = {
	color: colors.primary,
	fontSize: 64,
	fontWeight: '800',
}

export const eventOverlayStyle: ViewStyle = {
	height: 118,
	backgroundColor: colors.eventOverlay,
}

export const eventTypeStyle: ViewStyle = {
	backgroundColor: colors.primaryLight,
}

export const eventTypeTextStyle: TextStyle = {
	color: colors.white,
	fontSize: 11,
	fontWeight: '800',
}

export const eventTitleStyle: TextStyle = {
	color: colors.white,
	fontSize: 18,
	fontWeight: '800',
	letterSpacing: -0.3,
}

export const eventDescriptionStyle: TextStyle = {
	color: colors.whiteTransparent,
	fontSize: 12,
	lineHeight: 17,
}

export const eventMetaStyle: TextStyle = {
	color: colors.white,
	fontSize: 9,
	fontWeight: '600',
}

export const eventSeparatorStyle: TextStyle = {
	color: colors.whiteTransparent65,
	fontSize: 9,
}

export const dotsContainerStyle: ViewStyle = {
	alignItems: 'center',
	justifyContent: 'center',
	flexDirection: 'row',
	marginTop: 10,
}

export const dotStyle = (active: boolean): ViewStyle => ({
	marginLeft: 4,
	width: active ? 28 : 7,
	height: 6,
	borderRadius: 999,
	backgroundColor: active ? colors.primary : colors.inactiveDot,
})

export const actionsContainerStyle: ViewStyle = {
	marginTop: 12,
}

export const actionsRowStyle: ViewStyle = {
	flexDirection: 'row',
	alignItems: 'flex-start',
}

export const ticketsCardStyle: ViewStyle = {
	height: 258,
	backgroundColor: colors.card,
	borderWidth: 1,
	borderColor: colors.border,
	...cardShadow,
}

export const rightColumnStyle: ViewStyle = {
	flex: 1,
	marginLeft: 8,
}

export const mapCardStyle: ViewStyle = {
	height: 122,
	backgroundColor: colors.card,
	borderWidth: 1,
	borderColor: colors.border,
	...cardShadow,
}

export const speciesCardStyle: ViewStyle = {
	height: 122,
	backgroundColor: colors.cardLight,
	borderWidth: 1,
	borderColor: colors.border,
	...cardShadow,
}

export const actionPressableStyle = (pressed: boolean): ViewStyle => ({
	opacity: pressed ? 0.95 : 1,
})

export const ticketIconBoxStyle: ViewStyle = {
	backgroundColor: colors.active,
}

export const ticketBackgroundIconStyle: ViewStyle = {
	opacity: 0.55,
}

export const mapIconStyle: ViewStyle = {
	transform: [
		{
			rotate: '8deg',
		},
	],
}

export const mapIconContainerStyle: ViewStyle = {
	right: 12,
	top: 4,
}

export const speciesIconContainerStyle: ViewStyle = {
	right: 4,
	top: 8,
	opacity: 0.42,
}

export const actionBottomTextStyle: TextStyle = {
	color: colors.text,
	fontSize: 16,
	fontWeight: '800',
}

export const speciesDescriptionStyle: TextStyle = {
	color: colors.text,
	fontSize: 11,
	lineHeight: 15,
}

export const donationCardStyle: ViewStyle = {
	backgroundColor: colors.cardLight,
	borderWidth: 1,
	borderColor: colors.border,
	...cardShadow,
}

export const donationIconBoxStyle: ViewStyle = {
	backgroundColor: colors.active,
}

export const donationTitleStyle: TextStyle = {
	color: colors.text,
	fontSize: 15,
	fontWeight: '800',
}

export const donationDescriptionStyle: TextStyle = {
	color: colors.textSecondary,
	fontSize: 11,
}

export const donationArrowStyle: TextStyle = {
	color: '#7DA996',
}
