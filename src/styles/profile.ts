import { Dimensions, StyleSheet } from 'react-native'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export const colors = {
	background: '#FFFFFF',

	primary: '#08783F',
	primaryDark: '#063D22',
	primaryLight: '#b8f35d',

	card: '#eef4f0',
	cardLight: '#eef4f0',

	active: '#d5ead9',
	text: '#06371c',
	textSecondary: '#06371c',
	border: '#a6c1b3',
	white: '#FFFFFF',

	coral: '#08783F',
	errorBackground: '#eef4f0',
	errorBorder: '#a6c1b3',
	errorText: '#06371c',

	overlay: 'rgba(6, 61, 34, 0.55)',
	placeholder: '#06371c',

	lime: '#b8f35d',

	// Solo la tarjeta de puntos va en verde
	pointsGreen: '#08783F',
	pointsGreenDark: '#063D22',
}

const cardShadow = {
	shadowColor: '#164A2C',
	shadowOffset: {
		width: 0,
		height: 2,
	},
	shadowOpacity: 0.04,
	shadowRadius: 4,
	elevation: 1,
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
		opacity: 0.2,
	},

	loadingText: {
		marginTop: 16,
		fontSize: 14,
		fontWeight: '500',
		color: colors.textSecondary,
	},

	backgroundPattern: {
		opacity: 0.2,
	},

	// HEADER
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
		backgroundColor: 'rgba(255,255,255,0.95)',
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
		backgroundColor: colors.card,
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
		backgroundColor: 'rgba(8,120,63,0.55)',
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
		backgroundColor: colors.lime,
		...cardShadow,
	},

	changeAvatarText: {
		fontSize: 20,
		fontWeight: '700',
		color: colors.text,
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

	// PROGRESO
	progressContainer: {
		position: 'relative',
		zIndex: 10,
		overflow: 'hidden',
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		backgroundColor: colors.background,
	},

	progressBackground: {
		backgroundColor: colors.background,
	},

	progressPattern: {
		opacity: 0.12,
	},

	progressContent: {
		paddingHorizontal: 20,
		paddingTop: 24,
		paddingBottom: 28,
	},

	sectionTitle: {
		fontSize: 21,
		fontWeight: '700',
		color: colors.text,
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

	// SOLO LA TARJETA DE PUNTOS ES VERDE
	pointsCard: {
		flex: 1,
		borderRadius: 18,
		padding: 16,
		backgroundColor: colors.pointsGreen,
		borderWidth: 1,
		borderColor: colors.pointsGreenDark,
	},

	levelCard: {
		flex: 1,
		marginLeft: 12,
		borderRadius: 18,
		padding: 16,
		backgroundColor: colors.card,
		borderWidth: 1,
		borderColor: colors.border,
		...cardShadow,
	},

	pointsLabel: {
		fontSize: 11,
		fontWeight: '700',
		textTransform: 'uppercase',
		letterSpacing: 1.2,
		color: '#E1F3E7',
	},

	pointsValue: {
		marginTop: 4,
		fontSize: 29,
		fontWeight: '800',
		color: colors.white,
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
		borderRadius: 18,
		padding: 16,
		backgroundColor: colors.card,
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
		alignSelf: 'flex-start',
		borderRadius: 999,
		paddingHorizontal: 10,
		paddingVertical: 4,
		backgroundColor: colors.lime,
	},

	progressBadgeText: {
		fontSize: 12,
		fontWeight: '800',
		color: colors.text,
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

	// DATOS PERSONALES
	personalBackground: {
		backgroundColor: colors.background,
	},

	personalPattern: {
		opacity: 0.12,
	},

	personalContent: {
		paddingHorizontal: 20,
		paddingTop: 4,
		paddingBottom: 48,
	},

	personalCard: {
		borderRadius: 22,
		paddingHorizontal: 18,
		paddingTop: 20,
		paddingBottom: 24,
		backgroundColor: colors.card,
		borderWidth: 1,
		borderColor: colors.border,
		...cardShadow,
	},

	// CAMPOS
	fieldWrapper: {
		marginTop: 20,
	},

	dateFieldWrapper: {
		marginTop: 20,
	},

	fieldLabel: {
		marginBottom: 8,
		fontSize: 12,
		fontWeight: '800',
		textTransform: 'uppercase',
		letterSpacing: 0.8,
		color: colors.text,
	},

	fieldContainer: {
		minHeight: 56,
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 14,
		paddingHorizontal: 16,
		backgroundColor: colors.white,
		borderWidth: 1,
		borderColor: colors.primary,
	},

	fieldContainerError: {
		borderColor: colors.coral,
		backgroundColor: colors.errorBackground,
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
		color: colors.text,
	},

	// BOTÓN GUARDAR: SE CONSERVA POR COMPATIBILIDAD
	saveButton: {
		marginTop: 28,
		borderRadius: 10,
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
		borderRadius: 10,
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
