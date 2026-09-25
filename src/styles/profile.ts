import { Dimensions, StyleSheet } from 'react-native'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

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
	overlay: 'rgba(0,0,0,0.45)',
	placeholder: '#789187',
}

const cardShadow = {
	shadowColor: '#075C3B',
	shadowOffset: {
		width: 0,
		height: 5,
	},
	shadowOpacity: 0.12,
	shadowRadius: 10,
	elevation: 4,
}

export const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.background,
	},

	keyboardContainer: {
		flex: 1,
	},

	scrollView: {
		flex: 1,
	},

	loadingContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.background,
	},

	loadingPattern: {
		opacity: 0.3,
	},

	loadingText: {
		marginTop: 16,
		fontSize: 14,
		fontWeight: '500',
		color: colors.textSecondary,
	},

	backgroundPattern: {
		opacity: 0.3,
	},

	/*
	 * HEADER
	 */

	header: {
		position: 'relative',
	},

	coverImage: {
		width: SCREEN_WIDTH,
	},

	backButtonWrapper: {
		position: 'absolute',
		left: 20,
		top: 56,
		zIndex: 20,
	},

	backButton: {
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 999,
		paddingHorizontal: 14,
		paddingVertical: 10,
		backgroundColor: 'rgba(255,255,255,0.92)',
		...cardShadow,
	},

	backArrow: {
		marginRight: 4,
		fontSize: 20,
		fontWeight: '700',
		color: colors.primary,
		lineHeight: 20,
	},

	backText: {
		fontSize: 14,
		fontWeight: '600',
		color: colors.text,
	},

	profileHeader: {
		position: 'absolute',
		left: 0,
		right: 0,
		top: 0,
		alignItems: 'center',
		paddingTop: 80,
	},

	avatar: {
		width: 112,
		height: 112,
		borderRadius: 56,
		alignItems: 'center',
		justifyContent: 'center',
		overflow: 'hidden',
		borderWidth: 5,
		borderColor: colors.white,
		backgroundColor: colors.cardLight,
		...cardShadow,
	},

	avatarImage: {
		width: '100%',
		height: '100%',
	},

	avatarInitial: {
		fontSize: 48,
		fontWeight: '700',
		color: colors.primary,
	},

	avatarLoading: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(7,92,59,0.52)',
	},

	changeAvatarButton: {
		position: 'absolute',
		right: -1,
		bottom: -1,
		width: 34,
		height: 34,
		borderRadius: 17,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 3,
		borderColor: colors.white,
		backgroundColor: colors.primary,
		...cardShadow,
	},

	changeAvatarText: {
		fontSize: 20,
		fontWeight: '700',
		color: colors.white,
	},

	profileName: {
		marginTop: 20,
		fontSize: 23,
		fontWeight: '700',
		color: colors.white,
		textShadowColor: 'rgba(0,0,0,0.2)',
		textShadowOffset: {
			width: 0,
			height: 1,
		},
		textShadowRadius: 4,
	},

	profileEmail: {
		marginTop: 4,
		paddingHorizontal: 32,
		textAlign: 'center',
		fontSize: 14,
		color: '#F7F7EE',
	},

	/*
	 * PROGRESO
	 */

	progressContainer: {
		position: 'relative',
		zIndex: 10,
		overflow: 'hidden',
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		backgroundColor: 'rgba(248,244,234,0.94)',
	},

	progressBackground: {
		backgroundColor: colors.background,
	},

	progressPattern: {
		opacity: 0.3,
	},

	progressContent: {
		paddingHorizontal: 20,
		paddingTop: 24,
		paddingBottom: 28,
	},

	sectionTitle: {
		fontSize: 21,
		fontWeight: '700',
		color: colors.primary,
	},

	sectionSubtitle: {
		marginTop: 4,
		fontSize: 14,
		color: colors.textSecondary,
	},

	statsRow: {
		flexDirection: 'row',
		marginTop: 20,
	},

	pointsCard: {
		flex: 1,
		borderRadius: 22,
		padding: 16,
		backgroundColor: colors.card,
		borderWidth: 1,
		borderColor: colors.border,
	},

	levelCard: {
		flex: 1,
		marginLeft: 12,
		borderRadius: 22,
		padding: 16,
		backgroundColor: colors.cardLight,
		borderWidth: 1,
		borderColor: colors.border,
	},

	pointsLabel: {
		fontSize: 11,
		fontWeight: '700',
		textTransform: 'uppercase',
		letterSpacing: 1.2,
		color: colors.primary,
	},

	pointsValue: {
		marginTop: 4,
		fontSize: 29,
		fontWeight: '700',
		color: colors.primary,
	},

	levelLabel: {
		fontSize: 11,
		fontWeight: '700',
		textTransform: 'uppercase',
		letterSpacing: 1.2,
		color: colors.textSecondary,
	},

	levelValue: {
		marginTop: 4,
		fontSize: 18,
		fontWeight: '700',
		color: colors.text,
	},

	nextLevelCard: {
		marginTop: 20,
		borderRadius: 22,
		padding: 16,
		backgroundColor: colors.cardLight,
		borderWidth: 1,
		borderColor: colors.border,
		...cardShadow,
	},

	nextLevelHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},

	nextLevelTitle: {
		flex: 1,
		fontSize: 14,
		fontWeight: '600',
		color: colors.text,
	},

	progressBadge: {
		borderRadius: 999,
		paddingHorizontal: 10,
		paddingVertical: 4,
		backgroundColor: colors.active,
	},

	progressBadgeText: {
		fontSize: 12,
		fontWeight: '700',
		color: colors.primary,
	},

	progressTrack: {
		height: 10,
		marginTop: 12,
		overflow: 'hidden',
		borderRadius: 999,
		backgroundColor: colors.border,
	},

	progressFill: {
		height: '100%',
		borderRadius: 999,
		backgroundColor: colors.primary,
	},

	progressDescription: {
		marginTop: 12,
		fontSize: 14,
		lineHeight: 20,
		color: colors.textSecondary,
	},

	progressStrongText: {
		fontWeight: '700',
		color: colors.text,
	},

	progressLevelText: {
		fontWeight: '600',
		color: colors.text,
	},

	/*
	 * DATOS PERSONALES
	 */

	personalBackground: {
		backgroundColor: colors.background,
	},

	personalPattern: {
		opacity: 0.3,
	},

	personalContent: {
		paddingHorizontal: 20,
		paddingTop: 4,
		paddingBottom: 48,
	},

	personalCard: {
		borderRadius: 28,
		paddingHorizontal: 20,
		paddingTop: 20,
		paddingBottom: 24,
		backgroundColor: colors.card,
		borderWidth: 1,
		borderColor: colors.border,
		...cardShadow,
	},

	/*
	 * CAMPOS
	 */

	fieldWrapper: {
		marginTop: 20,
	},

	dateFieldWrapper: {
		marginTop: 20,
	},

	fieldLabel: {
		marginBottom: 8,
		fontSize: 12,
		fontWeight: '700',
		textTransform: 'uppercase',
		letterSpacing: 0.8,
		color: colors.textSecondary,
	},

	fieldContainer: {
		minHeight: 56,
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 18,
		paddingHorizontal: 16,
		backgroundColor: colors.cardLight,
		borderWidth: 1,
		borderColor: colors.border,
	},

	fieldContainerError: {
		borderColor: colors.coral,
	},

	fieldInput: {
		flex: 1,
		paddingHorizontal: 12,
		paddingVertical: 14,
		fontSize: 16,
		color: colors.text,
	},

	fieldError: {
		marginTop: 4,
		fontSize: 12,
		color: colors.coral,
	},

	dateValue: {
		flex: 1,
		marginLeft: 12,
		fontSize: 16,
	},

	/*
	 * GUARDAR
	 */

	saveButton: {
		marginTop: 28,
		borderRadius: 20,
		overflow: 'hidden',
		...cardShadow,
	},

	saveButtonDisabled: {
		opacity: 0.6,
	},

	saveButtonContent: {
		width: '100%',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 20,
		paddingHorizontal: 20,
		paddingVertical: 16,
		backgroundColor: colors.primary,
	},

	saveButtonPressed: {
		backgroundColor: colors.primaryLight,
	},

	saveButtonText: {
		fontSize: 16,
		fontWeight: '700',
		color: colors.white,
	},
})
