import type { ImageStyle, TextStyle, ViewStyle } from 'react-native'

export const colors = {
	background: '#F7F9F8',
	primary: '#075C3B',
	primaryLight: '#16845D',
	dark: '#17372C',
	muted: '#557067',
	card: '#DDF5EA',
	cardLight: '#E8F7F0',
	active: '#BDEED9',
	border: '#B8E6D3',
	white: '#FFFFFF',
	button: '#246F4C',
	buttonPressed: '#1D5C3F',
	footerBackground: '#F7F9F8',
	errorBackground: '#F8E1DE',
	errorBorder: '#EABCB6',
	errorText: '#B74439',
}

export const cardShadow: ViewStyle = {
	shadowColor: colors.primary,
	shadowOffset: { width: 0, height: 5 },
	shadowOpacity: 0.12,
	shadowRadius: 10,
	elevation: 4,
}

export const containerStyle: ViewStyle = {
	flex: 1,
	backgroundColor: colors.background,
}

export const backgroundStyle: ViewStyle = {
	flex: 1,
}

export const backgroundImageStyle: ImageStyle = {
	opacity: 0.3,
}

export const backButtonStyle: ViewStyle = {
	position: 'absolute',
	left: 20,
	top: 8,
	zIndex: 20,
}

export const backButtonPressedStyle: ViewStyle = {
	backgroundColor: colors.card,
	opacity: 0.75,
}

export const backTextStyle: TextStyle = {
	fontSize: 15,
	fontWeight: '700',
	color: colors.dark,
}

export const scrollContentStyle: ViewStyle = {
	paddingHorizontal: 20,
	paddingTop: 40,
	paddingBottom: 180,
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
	color: colors.dark,
}

export const subtitleStyle: TextStyle = {
	marginTop: 4,
	fontSize: 14,
	lineHeight: 20,
	color: colors.muted,
}

export const amountCardStyle: ViewStyle = {
	width: '100%',
	backgroundColor: colors.cardLight,
	borderRadius: 25,
	padding: 22,
	marginBottom: 21,
	alignItems: 'center',
	borderWidth: 1,
	borderColor: colors.border,
	...cardShadow,
}

export const amountIconStyle: ViewStyle = {
	width: 60,
	height: 60,
	borderRadius: 20,
	backgroundColor: colors.active,
	borderWidth: 1,
	borderColor: colors.border,
	alignItems: 'center',
	justifyContent: 'center',
	marginBottom: 12,
}

export const amountLabelStyle: TextStyle = {
	fontSize: 14,
	fontWeight: '800',
	color: colors.muted,
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
	color: colors.muted,
	textAlign: 'center',
}

export const sectionTitleStyle: TextStyle = {
	marginBottom: 12,
	fontSize: 16,
	fontWeight: '900',
	color: colors.dark,
}

export const detailCardStyle: ViewStyle = {
	width: '100%',
	backgroundColor: colors.cardLight,
	borderRadius: 25,
	padding: 17,
	marginBottom: 17,
	borderWidth: 1,
	borderColor: colors.border,
	...cardShadow,
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
	fontWeight: '900',
	color: colors.dark,
}

export const detailDescriptionStyle: TextStyle = {
	marginTop: 2,
	fontSize: 11,
	color: colors.muted,
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

export const securityCardStyle: ViewStyle = {
	width: '100%',
	backgroundColor: colors.cardLight,
	borderRadius: 25,
	padding: 17,
	marginBottom: 17,
	flexDirection: 'row',
	alignItems: 'center',
	borderWidth: 1,
	borderColor: colors.border,
}

export const securityIconStyle: ViewStyle = {
	width: 48,
	height: 48,
	borderRadius: 16,
	backgroundColor: colors.active,
	borderWidth: 1,
	borderColor: colors.border,
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
	color: colors.dark,
}

export const securityTextStyle: TextStyle = {
	marginTop: 3,
	fontSize: 12,
	lineHeight: 17,
	color: colors.muted,
}

export const thanksCardStyle: ViewStyle = {
	width: '100%',
	backgroundColor: colors.active,
	borderRadius: 25,
	padding: 17,
	borderWidth: 1,
	borderColor: colors.border,
}

export const thanksTitleStyle: TextStyle = {
	fontSize: 15,
	fontWeight: '900',
	color: colors.primary,
}

export const thanksTextStyle: TextStyle = {
	marginTop: 5,
	fontSize: 12,
	lineHeight: 18,
	color: colors.dark,
}

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

export const bottomSpaceStyle: ViewStyle = {
	height: 40,
}

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
	...cardShadow,
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
	color: colors.muted,
}

export const totalDescriptionStyle: TextStyle = {
	marginTop: 2,
	fontSize: 11,
	color: colors.muted,
}

export const totalStyle: TextStyle = {
	fontSize: 23,
	fontWeight: '900',
	color: colors.primary,
	maxWidth: 150,
}

export const confirmButtonWrapperStyle: ViewStyle = {
	width: '100%',
	height: 54,
	borderRadius: 17,
	backgroundColor: colors.button,
	borderWidth: 1,
	borderColor: colors.button,
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
	backgroundColor: colors.buttonPressed,
}

export const confirmButtonTextStyle: TextStyle = {
	color: colors.white,
	fontSize: 16,
	fontWeight: '900',
	textAlign: 'center',
}
