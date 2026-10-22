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
}

export const horizontalPadding = 12
export const carouselGap = 10
export const eventCardWidth = 292

export const cardShadow: ViewStyle = {
	shadowColor: '#164A2C',
	shadowOffset: { width: 0, height: 2 },
	shadowOpacity: 0.04,
	shadowRadius: 4,
	elevation: 1,
}

export const screenStyle: ViewStyle = {
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
	paddingHorizontal: horizontalPadding,
	paddingTop: 8,
	paddingBottom: 24,
}

export const titleTextStyle: TextStyle = {
	color: colors.text,
	fontSize: 16,
	fontWeight: '800',
	lineHeight: 21,
}

export const secondaryTextStyle: TextStyle = {
	color: colors.textSecondary,
	fontSize: 13,
	lineHeight: 18,
}

export const loadingCardStyle: ViewStyle = {
	minHeight: 190,
	alignItems: 'center',
	justifyContent: 'center',
	backgroundColor: colors.cardLight,
	borderRadius: 24,
	borderWidth: 1,
	borderColor: colors.border,
}

export const loadingTextStyle: TextStyle = {
	color: colors.textSecondary,
	fontSize: 13,
}

export const errorCardStyle: ViewStyle = {
	backgroundColor: colors.cardLight,
	borderWidth: 1,
	borderColor: colors.border,
	...cardShadow,
}

export const retryButtonStyle = (pressed: boolean): ViewStyle => ({
	backgroundColor: colors.primary,
	opacity: pressed ? 0.8 : 1,
	borderRadius: 16,
})

/* EVENTOS */

export const eventCardContainerStyle = (
	index: number,
	total: number,
): ViewStyle => ({
	width: eventCardWidth,
	marginRight: index === total - 1 ? 0 : carouselGap,
})

export const eventCardStyle: ViewStyle = {
	height: 203,
	backgroundColor: colors.primaryDark,
	borderRadius: 24,
	overflow: 'hidden',
	...cardShadow,
}

export const eventPressableStyle = (pressed: boolean): ViewStyle => ({
	flex: 1,
	opacity: pressed ? 0.92 : 1,
})

export const eventFallbackStyle: ViewStyle = {
	backgroundColor: '#315744',
}

export const eventFallbackTextStyle: TextStyle = {
	color: colors.primaryLight,
	fontSize: 64,
	fontWeight: '900',
}

export const eventOverlayStyle: ViewStyle = {
	position: 'absolute',
	left: 0,
	right: 0,
	bottom: 0,
	height: '55%',
	backgroundColor: colors.primaryDark,
	opacity: 0.98,
}

export const eventTypeStyle: ViewStyle = {
	backgroundColor: colors.primaryLight,
	borderRadius: 20,
	paddingHorizontal: 12,
	paddingVertical: 4,
}

export const eventTypeTextStyle: TextStyle = {
	color: colors.primaryDark,
	fontSize: 10,
	fontWeight: '800',
	letterSpacing: 0.3,
}

export const eventTitleStyle: TextStyle = {
	color: colors.white,
	fontSize: 23,
	fontWeight: '800',
	lineHeight: 28,
}

export const eventDescriptionStyle: TextStyle = {
	color: colors.white,
	fontSize: 12,
	fontWeight: '600',
	lineHeight: 17,
}

export const eventMetaStyle: TextStyle = {
	color: colors.white,
	fontSize: 12,
	fontWeight: '700',
}

export const eventSeparatorStyle: TextStyle = {
	color: colors.primaryLight,
	fontWeight: '900',
}

export const dotsContainerStyle: ViewStyle = {
	flexDirection: 'row',
	alignItems: 'center',
	justifyContent: 'center',
	marginTop: 12,
	gap: 6,
}

export const dotStyle = (active: boolean): ViewStyle => ({
	width: active ? 21 : 7,
	height: 7,
	borderRadius: 10,
	backgroundColor: active ? colors.primary : colors.textSecondary,
	opacity: active ? 1 : 0.8,
})

/* ACCIONES */

export const actionsContainerStyle: ViewStyle = {
	marginTop: 20,
}

export const actionsRowStyle: ViewStyle = {
	flexDirection: 'row',
	alignItems: 'stretch',
	gap: 10,
}

export const ticketsCardStyle: ViewStyle = {
	flex: 1,
	minHeight: 164,
	backgroundColor: colors.cardLight,
	borderColor: colors.border,
	borderWidth: 1,
	borderRadius: 18,
	overflow: 'hidden',
}

export const rightColumnStyle: ViewStyle = {
	flex: 1,
	gap: 10,
}

export const mapCardStyle: ViewStyle = {
	backgroundColor: colors.cardLight,
	borderColor: colors.border,
	borderWidth: 1,
	borderRadius: 18,
	overflow: 'hidden',
}

export const speciesCardStyle: ViewStyle = {
	flex: 1,
	minHeight: 164,
	backgroundColor: colors.cardLight,
	borderColor: colors.border,
	borderWidth: 1,
	borderRadius: 18,
	overflow: 'hidden',
}

export const actionPressableStyle = (pressed: boolean): ViewStyle => ({
	flex: 1,
	opacity: pressed ? 0.84 : 1,
})

export const ticketIconBoxStyle: ViewStyle = {
	width: 47,
	height: 47,
	alignItems: 'center',
	justifyContent: 'center',
	backgroundColor: colors.iconBackground,
	borderRadius: 13,
}

export const ticketBackgroundIconStyle: ViewStyle = {
	position: 'absolute',
	opacity: 0.07,
}

export const mapIconContainerStyle: ViewStyle = {
	top: 10,
	right: 10,
	opacity: 0.18,
}

export const mapIconStyle: ViewStyle = {
	alignItems: 'center',
	justifyContent: 'center',
}

export const speciesIconContainerStyle: ViewStyle = {
	top: 10,
	right: 10,
	opacity: 0.18,
}

export const actionBottomTextStyle: TextStyle = {
	color: colors.text,
	fontSize: 16,
	fontWeight: '800',
	lineHeight: 20,
}

export const speciesDescriptionStyle: TextStyle = {
	color: colors.textSecondary,
	fontSize: 12,
	fontWeight: '600',
	lineHeight: 16,
}

export const donationCardStyle: ViewStyle = {
	backgroundColor: colors.cardLight,
	borderColor: colors.border,
	borderWidth: 1,
	borderRadius: 18,
	overflow: 'hidden',
}

export const donationIconBoxStyle: ViewStyle = {
	width: 44,
	height: 44,
	alignItems: 'center',
	justifyContent: 'center',
	backgroundColor: colors.iconBackground,
	borderRadius: 13,
}

export const donationTitleStyle: TextStyle = {
	color: colors.text,
	fontSize: 15,
	fontWeight: '800',
}

export const donationDescriptionStyle: TextStyle = {
	color: colors.textSecondary,
	fontSize: 12,
	lineHeight: 16,
}

export const donationArrowStyle = {
	color: colors.white,
}
