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
	button: '#246F4C',
	buttonPressed: '#1D5C3F',
	modalBackground: '#F7F9F8',
	overlay: 'rgba(0,0,0,0.45)',
}

const cardShadow: ViewStyle = {
	shadowColor: colors.primary,
	shadowOffset: {
		width: 0,
		height: 5,
	},
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

export const backgroundImageStyle = {
	opacity: 0.3,
}

export const scrollContentStyle: ViewStyle = {
	paddingHorizontal: 20,
	paddingTop: 10,
	paddingBottom: 40,
}

export const backButtonStyle: ViewStyle = {
	alignSelf: 'flex-start',
	flexDirection: 'row',
	alignItems: 'center',
	backgroundColor: colors.cardLight,
	borderWidth: 1,
	borderColor: colors.border,
	borderRadius: 18,
	paddingHorizontal: 16,
	paddingVertical: 10,
	shadowColor: colors.primary,
	shadowOffset: {
		width: 0,
		height: 3,
	},
	shadowOpacity: 0.1,
	shadowRadius: 7,
	elevation: 3,
}

export const backButtonPressedStyle: ViewStyle = {
	backgroundColor: colors.card,
	opacity: 0.75,
}

export const backTextStyle: TextStyle = {
	fontSize: 15,
	fontWeight: '700',
	color: colors.dark,
	marginRight: 5,
}

export const headerStyle: ViewStyle = {
	marginTop: 18,
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

export const tabsContainerStyle: ViewStyle = {
	flexDirection: 'row',
	backgroundColor: colors.card,
	borderRadius: 18,
	padding: 4,
	marginBottom: 16,
	borderWidth: 1,
	borderColor: colors.border,
}

export const tabStyle: ViewStyle = {
	flex: 1,
	height: 45,
	borderRadius: 14,
	flexDirection: 'row',
	alignItems: 'center',
	justifyContent: 'center',
	gap: 7,
}

export const tabActiveStyle: ViewStyle = {
	backgroundColor: colors.white,
	...cardShadow,
}

export const tabTextStyle: TextStyle = {
	fontSize: 14,
	fontWeight: '700',
	color: colors.muted,
}

export const tabTextActiveStyle: TextStyle = {
	color: colors.primary,
}

export const tabCountStyle: ViewStyle = {
	minWidth: 22,
	height: 22,
	paddingHorizontal: 6,
	borderRadius: 11,
	backgroundColor: colors.active,
	alignItems: 'center',
	justifyContent: 'center',
}

export const tabCountActiveStyle: ViewStyle = {
	backgroundColor: colors.primary,
}

export const tabCountTextStyle: TextStyle = {
	fontSize: 11,
	fontWeight: '800',
	color: colors.muted,
}

export const tabCountTextActiveStyle: TextStyle = {
	color: colors.white,
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

export const buyButtonWrapperStyle: ViewStyle = {
	width: '100%',
	marginTop: 20,
	borderRadius: 17,
	overflow: 'hidden',
	backgroundColor: colors.button,
	...cardShadow,
}

export const buyButtonStyle: ViewStyle = {
	width: '100%',
	height: 48,
	alignItems: 'center',
	justifyContent: 'center',
}

export const buyButtonPressedStyle: ViewStyle = {
	backgroundColor: colors.buttonPressed,
}

export const buyButtonTextStyle: TextStyle = {
	color: colors.white,
	fontSize: 14,
	fontWeight: '800',
}

export const purchasesListStyle: ViewStyle = {
	width: '100%',
}

export const purchaseCardStyle: ViewStyle = {
	width: '100%',
	backgroundColor: colors.cardLight,
	borderRadius: 28,
	padding: 17,
	marginBottom: 16,
	borderWidth: 1,
	borderColor: colors.border,
	...cardShadow,
}

export const purchaseHeaderStyle: ViewStyle = {
	flexDirection: 'row',
	alignItems: 'center',
}

export const purchaseIconStyle: ViewStyle = {
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

export const purchaseInfoStyle: ViewStyle = {
	flex: 1,
	minWidth: 0,
}

export const purchaseTitleStyle: TextStyle = {
	fontSize: 16,
	fontWeight: '800',
	color: colors.dark,
}

export const folioStyle: TextStyle = {
	marginTop: 4,
	fontSize: 12,
	color: colors.muted,
}

export const statusBadgeStyle: ViewStyle = {
	borderRadius: 12,
	paddingHorizontal: 10,
	paddingVertical: 6,
	marginLeft: 8,
	backgroundColor: colors.active,
	borderWidth: 1,
	borderColor: colors.border,
}

export const statusTextStyle: TextStyle = {
	fontSize: 11,
	fontWeight: '800',
	color: colors.primary,
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

export const infoBlockRightStyle: ViewStyle = {
	alignItems: 'flex-end',
}

export const infoLabelStyle: TextStyle = {
	fontSize: 11,
	color: colors.muted,
}

export const infoValueStyle: TextStyle = {
	marginTop: 3,
	fontSize: 13,
	fontWeight: '700',
	color: colors.dark,
}

export const infoTimeStyle: TextStyle = {
	marginTop: 2,
	fontSize: 11,
	color: colors.muted,
}

export const totalValueStyle: TextStyle = {
	marginTop: 3,
	fontSize: 17,
	fontWeight: '900',
	color: colors.primary,
}

export const ticketSummaryStyle: ViewStyle = {
	width: '100%',
	marginTop: 15,
	flexDirection: 'row',
	alignItems: 'center',
	paddingHorizontal: 12,
	paddingVertical: 10,
	borderRadius: 16,
	backgroundColor: colors.active,
	borderWidth: 1,
	borderColor: colors.border,
}

export const ticketSummaryTextStyle: TextStyle = {
	flex: 1,
	marginLeft: 8,
	fontSize: 12,
	fontWeight: '700',
	color: colors.dark,
}

export const qrButtonWrapperStyle: ViewStyle = {
	width: '100%',
	height: 50,
	marginTop: 14,
	borderRadius: 17,
	overflow: 'hidden',
	backgroundColor: colors.button,
	borderWidth: 1,
	borderColor: colors.button,
	...cardShadow,
}

export const qrButtonStyle: ViewStyle = {
	width: '100%',
	height: '100%',
	alignItems: 'center',
	justifyContent: 'center',
}

export const qrButtonContentStyle: ViewStyle = {
	width: '100%',
	height: '100%',
	flexDirection: 'row',
	alignItems: 'center',
	justifyContent: 'center',
}

export const qrButtonPressedStyle: ViewStyle = {
	backgroundColor: colors.buttonPressed,
}

export const qrButtonTextStyle: TextStyle = {
	marginLeft: 8,
	fontSize: 13,
	fontWeight: '800',
	color: colors.white,
	textAlign: 'center',
}

export const modalOverlayStyle: ViewStyle = {
	flex: 1,
	backgroundColor: colors.overlay,
	justifyContent: 'flex-end',
}

export const qrModalCardStyle: ViewStyle = {
	maxHeight: '90%',
	backgroundColor: colors.modalBackground,
	borderTopLeftRadius: 30,
	borderTopRightRadius: 30,
	paddingHorizontal: 20,
	paddingTop: 20,
	paddingBottom: 25,
	borderTopWidth: 1,
	borderColor: colors.border,
	overflow: 'hidden',
}

export const qrModalPatternStyle = {
	opacity: 0.6,
}

export const modalHeaderStyle: ViewStyle = {
	flexDirection: 'row',
	alignItems: 'center',
	justifyContent: 'space-between',
}

export const modalTitleContainerStyle: ViewStyle = {
	flex: 1,
	flexDirection: 'row',
	alignItems: 'center',
}

export const modalIconStyle: ViewStyle = {
	width: 46,
	height: 46,
	borderRadius: 16,
	backgroundColor: colors.active,
	alignItems: 'center',
	justifyContent: 'center',
	marginRight: 11,
	borderWidth: 1,
	borderColor: colors.border,
}

export const modalTitleInfoStyle: ViewStyle = {
	flex: 1,
}

export const modalTitleStyle: TextStyle = {
	fontSize: 19,
	fontWeight: '900',
	color: colors.dark,
}

export const modalSubtitleStyle: TextStyle = {
	marginTop: 3,
	fontSize: 11,
	color: colors.muted,
}

export const closeButtonStyle: ViewStyle = {
	width: 40,
	height: 40,
	borderRadius: 20,
	backgroundColor: colors.card,
	alignItems: 'center',
	justifyContent: 'center',
	marginLeft: 10,
	borderWidth: 1,
	borderColor: colors.border,
}

export const closeButtonPressedStyle: ViewStyle = {
	opacity: 0.7,
}

export const closeTextStyle: TextStyle = {
	fontSize: 25,
	lineHeight: 28,
	color: colors.dark,
}

export const modalDateStyle: TextStyle = {
	marginTop: 12,
	marginBottom: 10,
	fontSize: 12,
	color: colors.muted,
}

export const qrListStyle: ViewStyle = {
	paddingBottom: 5,
}

export const qrTicketCardStyle: ViewStyle = {
	backgroundColor: colors.cardLight,
	borderRadius: 24,
	padding: 15,
	marginBottom: 12,
	borderWidth: 1,
	borderColor: colors.border,
	...cardShadow,
}

export const qrTicketHeaderStyle: ViewStyle = {
	flexDirection: 'row',
	alignItems: 'center',
	justifyContent: 'space-between',
}

export const qrTicketNameStyle: TextStyle = {
	fontSize: 15,
	fontWeight: '800',
	color: colors.dark,
}

export const qrTicketNumberStyle: TextStyle = {
	marginTop: 3,
	fontSize: 11,
	color: colors.muted,
}

export const qrTicketStatusStyle: ViewStyle = {
	paddingHorizontal: 9,
	paddingVertical: 5,
	borderRadius: 10,
	backgroundColor: colors.active,
	borderWidth: 1,
	borderColor: colors.border,
}

export const qrTicketStatusTextStyle: TextStyle = {
	fontSize: 10,
	fontWeight: '800',
	color: colors.primary,
}

export const qrWrapperStyle: ViewStyle = {
	alignSelf: 'center',
	marginTop: 14,
	padding: 12,
	borderRadius: 20,
	backgroundColor: colors.white,
	borderWidth: 1,
	borderColor: colors.border,
	minWidth: 236,
	minHeight: 236,
	alignItems: 'center',
	justifyContent: 'center',
	...cardShadow,
}

export const qrErrorStyle: ViewStyle = {
	width: 210,
	height: 210,
	alignItems: 'center',
	justifyContent: 'center',
	paddingHorizontal: 15,
}

export const qrErrorTextStyle: TextStyle = {
	marginTop: 10,
	fontSize: 13,
	textAlign: 'center',
	color: colors.coral,
	fontWeight: '700',
}

export const qrTokenDebugStyle: TextStyle = {
	marginTop: 8,
	fontSize: 9,
	textAlign: 'center',
	color: colors.muted,
}

export const bottomSpaceStyle: ViewStyle = {
	height: 40,
}
