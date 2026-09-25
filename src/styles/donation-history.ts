import type { TextStyle, ViewStyle } from 'react-native'

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

	coral: '#D95C4F',
	coralLight: '#F8E1DE',

	orange: '#B76E00',
	orangeLight: '#FFF0D4',

	button: '#246F4C',
	buttonPressed: '#1D5C3F',
}

export const backgroundStyle: ViewStyle = {
	flex: 1,
}

export const backgroundImageStyle = {
	opacity: 0.3,
}

export const containerStyle: ViewStyle = {
	flex: 1,
	backgroundColor: colors.background,
}

export const backButtonStyle: ViewStyle = {
	position: 'absolute',
	left: 20,
	top: 8,
	zIndex: 20,
	borderRadius: 18,
	paddingHorizontal: 16,
	paddingVertical: 10,
}

export const backTextStyle: TextStyle = {
	fontSize: 15,
	fontWeight: '700',
	color: colors.dark,
}

export const scrollContentStyle: ViewStyle = {
	paddingHorizontal: 20,
	paddingTop: 40,
	paddingBottom: 40,
}

export const headerStyle: ViewStyle = {
	marginBottom: 20,
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

export const statsContainerStyle: ViewStyle = {
	flexDirection: 'row',
	gap: 12,
	marginBottom: 18,
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

export const statCardStyle: ViewStyle = {
	flex: 1,
	backgroundColor: colors.card,
	borderRadius: 22,
	padding: 14,
	flexDirection: 'row',
	alignItems: 'center',
	borderWidth: 1,
	borderColor: colors.border,
	...cardShadow,
}

export const statIconStyle: ViewStyle = {
	width: 42,
	height: 42,
	borderRadius: 15,
	backgroundColor: colors.active,
	alignItems: 'center',
	justifyContent: 'center',
	marginRight: 10,
	borderWidth: 1,
	borderColor: colors.border,
}

export const statNumberStyle: TextStyle = {
	fontSize: 20,
	fontWeight: '900',
	color: colors.dark,
}

export const statLabelStyle: TextStyle = {
	marginTop: 1,
	fontSize: 11,
	color: colors.muted,
}

export const totalCardStyle: ViewStyle = {
	width: '100%',
	backgroundColor: colors.cardLight,
	borderRadius: 22,
	padding: 16,
	marginBottom: 22,
	flexDirection: 'row',
	alignItems: 'center',
	borderWidth: 1,
	borderColor: colors.border,
	...cardShadow,
}

export const totalIconStyle: ViewStyle = {
	width: 50,
	height: 50,
	borderRadius: 17,
	backgroundColor: colors.active,
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
	fontWeight: '700',
	color: colors.muted,
}

export const totalAmountStyle: TextStyle = {
	marginTop: 2,
	fontSize: 24,
	fontWeight: '900',
	color: colors.primary,
}

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

export const emptyCardStyle: ViewStyle = {
	backgroundColor: colors.cardLight,
	borderRadius: 28,
	paddingHorizontal: 25,
	paddingVertical: 35,
	alignItems: 'center',
	borderWidth: 1,
	borderColor: colors.border,
	...cardShadow,
}

export const emptyIconStyle: ViewStyle = {
	width: 68,
	height: 68,
	borderRadius: 22,
	backgroundColor: colors.active,
	alignItems: 'center',
	justifyContent: 'center',
	marginBottom: 16,
	borderWidth: 1,
	borderColor: colors.border,
}

export const emptyTitleStyle: TextStyle = {
	fontSize: 18,
	fontWeight: '900',
	color: colors.dark,
	textAlign: 'center',
}

export const emptyTextStyle: TextStyle = {
	marginTop: 7,
	fontSize: 13,
	lineHeight: 19,
	color: colors.muted,
	textAlign: 'center',
}

export const buyButtonStyle: ViewStyle = {
	width: 260,
	height: 48,
	alignItems: 'center',
	justifyContent: 'center',
	borderRadius: 17,
	backgroundColor: colors.button,
}

export const buyButtonTextStyle: TextStyle = {
	color: colors.white,
	fontSize: 14,
	fontWeight: '800',
}

export const donationsListStyle: ViewStyle = {
	width: '100%',
}

export const sectionTitleStyle: TextStyle = {
	marginBottom: 12,
	fontSize: 18,
	fontWeight: '900',
	color: colors.dark,
}

export const donationCardStyle: ViewStyle = {
	width: '100%',
	backgroundColor: colors.cardLight,
	borderRadius: 28,
	padding: 17,
	marginBottom: 16,
	borderWidth: 1,
	borderColor: colors.border,
	...cardShadow,
}

export const donationHeaderStyle: ViewStyle = {
	flexDirection: 'row',
	alignItems: 'center',
}

export const donationIconStyle: ViewStyle = {
	width: 50,
	height: 50,
	borderRadius: 17,
	backgroundColor: colors.active,
	alignItems: 'center',
	justifyContent: 'center',
	marginRight: 12,
	borderWidth: 1,
	borderColor: colors.border,
}

export const donationInfoStyle: ViewStyle = {
	flex: 1,
	minWidth: 0,
}

export const donationAmountStyle: TextStyle = {
	fontSize: 19,
	fontWeight: '900',
	color: colors.primary,
}

export const donationDateStyle: TextStyle = {
	marginTop: 4,
	fontSize: 12,
	color: colors.muted,
}

export const donationTimeStyle: TextStyle = {
	marginTop: 2,
	fontSize: 11,
	color: colors.muted,
}

export const statusBadgeStyle: ViewStyle = {
	borderRadius: 12,
	paddingHorizontal: 9,
	paddingVertical: 6,
	marginLeft: 8,
	borderWidth: 1,
}

export const statusTextStyle: TextStyle = {
	fontSize: 10,
	fontWeight: '800',
}

export const dividerStyle: ViewStyle = {
	height: 1,
	backgroundColor: colors.border,
	marginVertical: 14,
}

export const infoRowStyle: ViewStyle = {
	flexDirection: 'row',
	justifyContent: 'space-between',
}

export const infoBlockStyle: ViewStyle = {
	flex: 1,
}

export const infoLabelStyle: TextStyle = {
	fontSize: 11,
	color: colors.muted,
}

export const paymentRowStyle: ViewStyle = {
	flexDirection: 'row',
	alignItems: 'center',
	marginTop: 4,
}

export const infoValueStyle: TextStyle = {
	marginLeft: 7,
	fontSize: 13,
	fontWeight: '700',
	color: colors.dark,
}

export const referenceContainerStyle: ViewStyle = {
	marginTop: 13,
	paddingTop: 13,
	borderTopWidth: 1,
	borderTopColor: colors.border,
	flexDirection: 'row',
	alignItems: 'center',
}

export const referenceInfoStyle: ViewStyle = {
	flex: 1,
	marginLeft: 8,
}
