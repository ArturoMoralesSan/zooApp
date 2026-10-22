import type { TextStyle, ViewStyle } from 'react-native'

export const colors = {
	background: '#FFFFFF',
	primary: '#187744',
	primaryLight: '#23965A',
	dark: '#244334',
	muted: '#718477',
	card: '#F2F7F4',
	cardLight: '#F8FAF8',
	active: '#E4F2E8',
	border: '#DCE7DF',
	white: '#FFFFFF',
	coral: '#D95C4F',
	coralLight: '#FCEDEA',
	button: '#187744',
	buttonPressed: '#125D35',
	modalBackground: '#FFFFFF',
	overlay: 'rgba(24, 40, 30, 0.48)',
}

const cardShadow: ViewStyle = {
	shadowColor: '#244334',
	shadowOffset: {
		width: 0,
		height: 3,
	},
	shadowOpacity: 0.055,
	shadowRadius: 8,
	elevation: 2,
}

/* Container */

export const containerStyle: ViewStyle = {
	flex: 1,
	backgroundColor: colors.background,
}

export const backgroundStyle: ViewStyle = {
	flex: 1,
	backgroundColor: colors.background,
}

export const backgroundImageStyle = {
	opacity: 0.12,
}

export const scrollContentStyle: ViewStyle = {
	paddingHorizontal: 20,
	paddingTop: 10,
	paddingBottom: 40,
}

/* Back button */

export const backButtonStyle: ViewStyle = {
	alignSelf: 'flex-start',
	flexDirection: 'row',
	alignItems: 'center',
	backgroundColor: colors.card,
	borderWidth: 1,
	borderColor: colors.border,
	borderRadius: 15,
	paddingHorizontal: 14,
	paddingVertical: 9,
}

export const backButtonPressedStyle: ViewStyle = {
	backgroundColor: colors.active,
	opacity: 0.8,
}

export const backTextStyle: TextStyle = {
	fontSize: 14,
	fontWeight: '700',
	color: colors.dark,
	marginRight: 5,
}

/* Header */

export const headerStyle: ViewStyle = {
	marginTop: 18,
	marginBottom: 20,
}

export const titleStyle: TextStyle = {
	fontSize: 27,
	fontWeight: '800',
	color: colors.dark,
	letterSpacing: -0.5,
}

export const subtitleStyle: TextStyle = {
	marginTop: 5,
	fontSize: 14,
	lineHeight: 21,
	color: colors.muted,
}

/* Statistics */

export const statsContainerStyle: ViewStyle = {
	flexDirection: 'row',
	gap: 12,
	marginBottom: 20,
}

export const statCardStyle: ViewStyle = {
	flex: 1,
	backgroundColor: colors.card,
	borderRadius: 20,
	padding: 13,
	flexDirection: 'row',
	alignItems: 'center',
	borderWidth: 1,
	borderColor: colors.border,
	...cardShadow,
}

export const statIconStyle: ViewStyle = {
	width: 40,
	height: 40,
	borderRadius: 14,
	backgroundColor: colors.active,
	alignItems: 'center',
	justifyContent: 'center',
	marginRight: 10,
}

export const statNumberStyle: TextStyle = {
	fontSize: 20,
	fontWeight: '800',
	color: colors.dark,
}

export const statLabelStyle: TextStyle = {
	marginTop: 3,
	fontSize: 11,
	fontWeight: '500',
	color: colors.muted,
}

/* Tabs */

export const tabsContainerStyle: ViewStyle = {
	flexDirection: 'row',
	backgroundColor: colors.card,
	borderRadius: 16,
	padding: 4,
	marginBottom: 18,
	borderWidth: 1,
	borderColor: colors.border,
}

export const tabStyle: ViewStyle = {
	flex: 1,
	minHeight: 44,
	borderRadius: 12,
	flexDirection: 'row',
	alignItems: 'center',
	justifyContent: 'center',
	gap: 7,
}

export const tabActiveStyle: ViewStyle = {
	backgroundColor: colors.button,
	borderRadius: 12,
}

export const tabTextStyle: TextStyle = {
	fontSize: 13,
	fontWeight: '600',
	color: colors.muted,
}

export const tabTextActiveStyle: TextStyle = {
	color: colors.white,
	fontWeight: '800',
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
	backgroundColor: colors.white,
}

export const tabCountTextStyle: TextStyle = {
	fontSize: 11,
	fontWeight: '700',
	color: colors.dark,
}

export const tabCountTextActiveStyle: TextStyle = {
	color: colors.primary,
}

/* Loading */

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

/* Empty state */

export const emptyCardStyle: ViewStyle = {
	backgroundColor: colors.card,
	borderRadius: 24,
	paddingHorizontal: 24,
	paddingVertical: 32,
	alignItems: 'center',
	borderWidth: 1,
	borderColor: colors.border,
	...cardShadow,
}

export const emptyIconStyle: ViewStyle = {
	width: 66,
	height: 66,
	borderRadius: 21,
	backgroundColor: colors.active,
	alignItems: 'center',
	justifyContent: 'center',
	marginBottom: 16,
}

export const emptyTitleStyle: TextStyle = {
	fontSize: 18,
	fontWeight: '800',
	color: colors.dark,
	textAlign: 'center',
}

export const emptyTextStyle: TextStyle = {
	marginTop: 7,
	fontSize: 13,
	lineHeight: 20,
	color: colors.muted,
	textAlign: 'center',
}

/* Buy button */

export const buyButtonWrapperStyle: ViewStyle = {
	width: '100%',
	marginTop: 20,
	borderRadius: 15,
	overflow: 'hidden',
	backgroundColor: colors.button,
}

export const buyButtonStyle: ViewStyle = {
	width: '100%',
	minHeight: 48,
	alignItems: 'center',
	justifyContent: 'center',
}

export const buyButtonPressedStyle: ViewStyle = {
	backgroundColor: colors.buttonPressed,
}

export const buyButtonTextStyle: TextStyle = {
	color: colors.white,
	fontSize: 14,
	fontWeight: '700',
}

/* Purchases list */

export const purchasesListStyle: ViewStyle = {
	width: '100%',
}

export const purchaseCardStyle: ViewStyle = {
	width: '100%',
	backgroundColor: colors.card,
	borderRadius: 22,
	padding: 16,
	marginBottom: 14,
	borderWidth: 1,
	borderColor: colors.border,
	...cardShadow,
}

export const purchaseHeaderStyle: ViewStyle = {
	flexDirection: 'row',
	alignItems: 'center',
}

export const purchaseIconStyle: ViewStyle = {
	width: 46,
	height: 46,
	borderRadius: 15,
	backgroundColor: colors.active,
	alignItems: 'center',
	justifyContent: 'center',
	marginRight: 12,
}

export const purchaseInfoStyle: ViewStyle = {
	flex: 1,
	minWidth: 0,
}

export const purchaseTitleStyle: TextStyle = {
	fontSize: 15,
	fontWeight: '800',
	color: colors.dark,
}

export const folioStyle: TextStyle = {
	marginTop: 4,
	fontSize: 12,
	color: colors.muted,
}

export const statusBadgeStyle: ViewStyle = {
	borderRadius: 10,
	paddingHorizontal: 9,
	paddingVertical: 5,
	marginLeft: 8,
	backgroundColor: colors.active,
}

export const statusTextStyle: TextStyle = {
	fontSize: 11,
	fontWeight: '700',
	color: colors.primary,
}

export const dividerStyle: ViewStyle = {
	height: 1,
	backgroundColor: colors.border,
	marginVertical: 13,
}

export const infoRowStyle: ViewStyle = {
	flexDirection: 'row',
	justifyContent: 'space-between',
	gap: 12,
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
	marginTop: 4,
	fontSize: 13,
	fontWeight: '700',
	color: colors.dark,
}

export const infoTimeStyle: TextStyle = {
	marginTop: 3,
	fontSize: 11,
	color: colors.muted,
}

export const totalValueStyle: TextStyle = {
	marginTop: 4,
	fontSize: 17,
	fontWeight: '800',
	color: colors.primary,
}

/* Ticket summary badge */

export const ticketSummaryStyle: ViewStyle = {
	alignSelf: 'flex-start',
	maxWidth: '100%',
	marginTop: 14,
	flexDirection: 'row',
	alignItems: 'center',
	paddingHorizontal: 12,
	paddingVertical: 8,
	borderRadius: 12,
	backgroundColor: colors.active,
	borderWidth: 1,
	borderColor: colors.border,
}

export const ticketSummaryTextStyle: TextStyle = {
	flexShrink: 1,
	marginLeft: 8,
	fontSize: 12,
	fontWeight: '700',
	color: colors.primary,
}

/* QR button */

export const qrButtonWrapperStyle: ViewStyle = {
	width: '100%',
	height: 48,
	marginTop: 13,
	borderRadius: 15,
	overflow: 'hidden',
	backgroundColor: colors.button,
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
	gap: 8,
}

export const qrButtonPressedStyle: ViewStyle = {
	backgroundColor: colors.buttonPressed,
}

export const qrButtonTextStyle: TextStyle = {
	fontSize: 13,
	fontWeight: '700',
	color: colors.white,
	textAlign: 'center',
}

/* QR modal */

export const modalOverlayStyle: ViewStyle = {
	flex: 1,
	backgroundColor: colors.overlay,
	justifyContent: 'flex-end',
}

export const qrModalCardStyle: ViewStyle = {
	maxHeight: '90%',
	backgroundColor: colors.modalBackground,
	borderTopLeftRadius: 26,
	borderTopRightRadius: 26,
	paddingHorizontal: 20,
	paddingTop: 20,
	paddingBottom: 25,
	borderTopWidth: 1,
	borderColor: colors.border,
	overflow: 'hidden',
}

export const qrModalPatternStyle = {
	opacity: 0.3,
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
	width: 44,
	height: 44,
	borderRadius: 14,
	backgroundColor: colors.active,
	alignItems: 'center',
	justifyContent: 'center',
	marginRight: 11,
}

export const modalTitleInfoStyle: ViewStyle = {
	flex: 1,
}

export const modalTitleStyle: TextStyle = {
	fontSize: 19,
	fontWeight: '800',
	color: colors.dark,
}

export const modalSubtitleStyle: TextStyle = {
	marginTop: 4,
	fontSize: 11,
	color: colors.muted,
}

export const closeButtonStyle: ViewStyle = {
	width: 38,
	height: 38,
	borderRadius: 13,
	backgroundColor: colors.card,
	alignItems: 'center',
	justifyContent: 'center',
	marginLeft: 10,
	borderWidth: 1,
	borderColor: colors.border,
}

export const closeButtonPressedStyle: ViewStyle = {
	opacity: 0.65,
	backgroundColor: colors.active,
}

export const closeTextStyle: TextStyle = {
	fontSize: 24,
	lineHeight: 28,
	color: colors.dark,
}

export const modalDateStyle: TextStyle = {
	marginTop: 12,
	marginBottom: 10,
	fontSize: 12,
	color: colors.muted,
}

/* Individual QR tickets */

export const qrListStyle: ViewStyle = {
	paddingBottom: 5,
}

export const qrTicketCardStyle: ViewStyle = {
	backgroundColor: colors.card,
	borderRadius: 20,
	padding: 14,
	marginBottom: 12,
	borderWidth: 1,
	borderColor: colors.border,
	...cardShadow,
}

export const qrTicketHeaderStyle: ViewStyle = {
	flexDirection: 'row',
	alignItems: 'center',
	justifyContent: 'space-between',
	gap: 10,
}

export const qrTicketNameStyle: TextStyle = {
	fontSize: 15,
	fontWeight: '800',
	color: colors.dark,
}

export const qrTicketNumberStyle: TextStyle = {
	marginTop: 4,
	fontSize: 11,
	color: colors.muted,
}

export const qrTicketStatusStyle: ViewStyle = {
	paddingHorizontal: 9,
	paddingVertical: 5,
	borderRadius: 9,
	backgroundColor: colors.active,
}

export const qrTicketStatusTextStyle: TextStyle = {
	fontSize: 10,
	fontWeight: '700',
	color: colors.primary,
}

/* QR image container */

export const qrWrapperStyle: ViewStyle = {
	alignSelf: 'center',
	marginTop: 14,
	padding: 12,
	borderRadius: 18,
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
