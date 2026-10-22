import { StyleSheet } from 'react-native'

export const COLORS = {
	background: '#FFFFFF',
	primary: '#08783F',
	primaryDark: '#063D22',
	text: '#102E20',
	muted: '#668475',
	border: '#AECCBD',
	borderLight: '#EEF5F0',
	card: '#EEF4F0',
	white: '#FFFFFF',
	infoBackground: '#08783F',
	successBackground: '#063D1E',
	successIcon: '#B8F35D',
	thanksBackground: '#D3EBDB',
	thanksText: '#36634C',
	thanksIconBackground: '#087137',
	detailText: '#1E4930',
	detailDivider: '#D5E5DD',
} as const

export const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	background: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	backgroundImage: {
		opacity: 0.13,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingHorizontal: 20,
		paddingTop: 10,
		paddingBottom: 24,
	},
	headerContainer: {
		marginBottom: 20,
		gap: 12,
	},

	/* TARJETA DE ÉXITO */
	successCard: {
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: COLORS.successBackground,
		borderRadius: 24,
		paddingHorizontal: 22,
		paddingVertical: 30,
		marginBottom: 16,
	},
	successIconContainer: {
		width: 78,
		height: 78,
		borderRadius: 39,
		backgroundColor: 'rgba(184, 243, 93, 0.13)',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 18,
	},
	successTitle: {
		fontSize: 25,
		fontWeight: '800',
		color: COLORS.white,
		textAlign: 'center',
		marginBottom: 10,
	},
	successDescription: {
		fontSize: 14,
		lineHeight: 22,
		color: COLORS.white,
		textAlign: 'center',
		opacity: 0.94,
	},

	/* MONTO Y DETALLE */
	amountCard: {
		backgroundColor: COLORS.card,
		borderRadius: 22,
		borderWidth: 1,
		borderColor: COLORS.border,
		padding: 20,
		marginBottom: 16,
	},
	amountHeader: {
		marginBottom: 8,
	},
	amountLabel: {
		fontSize: 14,
		fontWeight: '600',
		color: COLORS.detailText,
	},
	amountValue: {
		fontSize: 34,
		fontWeight: '800',
		color: COLORS.detailText,
		letterSpacing: -0.7,
	},
	sectionHeading: {
		marginBottom: 12,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '800',
		color: COLORS.detailText,
	},
	detailRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 12,
		paddingVertical: 8,
	},
	detailLabel: {
		fontSize: 13,
		color: COLORS.detailText,
		flexShrink: 0,
	},
	detailValue: {
		fontSize: 13,
		fontWeight: '700',
		color: COLORS.detailText,
		textAlign: 'right',
		flex: 1,
	},
	detailDivider: {
		height: 1,
		backgroundColor: COLORS.detailDivider,
		marginVertical: 10,
	},

	/* ¡TU APOYO CUENTA! */
	thanksInfoCard: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 13,
		backgroundColor: COLORS.thanksBackground,
		borderRadius: 20,
		padding: 18,
		marginBottom: 16,
	},
	thanksInfoIconContainer: {
		width: 38,
		height: 38,
		borderRadius: 12,
		backgroundColor: COLORS.thanksIconBackground,
		alignItems: 'center',
		justifyContent: 'center',
	},
	thanksInfoContent: {
		flex: 1,
	},
	thanksInfoTitle: {
		fontSize: 15,
		fontWeight: '800',
		color: COLORS.thanksText,
		marginBottom: 6,
	},
	thanksInfoDescription: {
		fontSize: 13,
		lineHeight: 20,
		color: COLORS.thanksText,
	},

	bottomSpace: {
		height: 12,
	},

	/* FOOTER FIJO */
	footer: {
		backgroundColor: COLORS.white,
		borderTopWidth: 1,
		borderTopColor: COLORS.borderLight,
		paddingHorizontal: 20,
		paddingTop: 14,
		paddingBottom: 12,
	},
	footerAmountContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 12,
	},
	footerTextContainer: {
		flex: 1,
		minWidth: 0,
		marginRight: 12,
	},
	footerLabel: {
		fontSize: 13,
		fontWeight: '700',
		color: COLORS.primaryDark,
	},
	footerDescription: {
		fontSize: 12,
		color: COLORS.muted,
		marginTop: 4,
	},
	footerAmount: {
		fontSize: 19,
		fontWeight: '800',
		color: COLORS.primaryDark,
	},
})
