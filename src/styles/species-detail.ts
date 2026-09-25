import type { ImageStyle, TextStyle, ViewStyle } from 'react-native'

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
	mapBackground: '#F8E1DE',
	mapBorder: '#EFC2BC',
	overlay: 'rgba(0,0,0,0.45)',
} as const

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

const subtleShadow: ViewStyle = {
	shadowColor: colors.primary,
	shadowOffset: {
		width: 0,
		height: 3,
	},
	shadowOpacity: 0.08,
	shadowRadius: 7,
	elevation: 2,
}

const styles = {
	// Imágenes / fondos
	patternImage: {
		opacity: 0.9,
	} satisfies ImageStyle,

	loadingBackground: {
		backgroundColor: colors.background,
	} satisfies ViewStyle,

	loadingText: {
		color: colors.textSecondary,
	} satisfies TextStyle,

	// Error
	errorBackground: {
		backgroundColor: colors.background,
	} satisfies ViewStyle,

	errorBackWrapper: {
		marginBottom: 32,
		alignSelf: 'flex-start',
		overflow: 'hidden',
		borderRadius: 16,
		backgroundColor: colors.cardLight,
		borderWidth: 1,
		borderColor: colors.border,
		...subtleShadow,
	} satisfies ViewStyle,

	errorBackButton: {
		backgroundColor: colors.cardLight,
	} satisfies ViewStyle,

	errorBackButtonPressed: {
		backgroundColor: colors.active,
	} satisfies ViewStyle,

	errorBackArrow: {
		marginRight: 4,
		fontSize: 20,
		fontWeight: '700',
		lineHeight: 20,
		color: colors.primary,
	} satisfies TextStyle,

	errorBackText: {
		fontSize: 14,
		fontWeight: '600',
		color: colors.text,
	} satisfies TextStyle,

	errorCard: {
		alignItems: 'center',
		borderRadius: 28,
		borderWidth: 1,
		borderColor: colors.errorBorder,
		backgroundColor: colors.errorBackground,
		paddingHorizontal: 24,
		paddingVertical: 40,
		...cardShadow,
	} satisfies ViewStyle,

	errorIcon: {
		width: 64,
		height: 64,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 16,
		borderWidth: 1,
		borderColor: colors.errorBorder,
		backgroundColor: colors.errorBorder,
	} satisfies ViewStyle,

	errorTitle: {
		marginTop: 20,
		fontSize: 18,
		fontWeight: '700',
		textAlign: 'center',
		color: colors.text,
	} satisfies TextStyle,

	errorMessage: {
		marginTop: 8,
		fontSize: 14,
		lineHeight: 20,
		textAlign: 'center',
		color: colors.textSecondary,
	} satisfies TextStyle,

	retryButtonWrapper: {
		marginTop: 24,
		overflow: 'hidden',
		borderRadius: 20,
		backgroundColor: colors.primary,
		...subtleShadow,
	} satisfies ViewStyle,

	retryButton: {
		backgroundColor: colors.primary,
	} satisfies ViewStyle,

	retryButtonPressed: {
		backgroundColor: colors.primaryLight,
	} satisfies ViewStyle,

	retryButtonText: {
		fontWeight: '700',
		color: colors.white,
	} satisfies TextStyle,

	// Scroll / contenido principal
	scrollView: {
		backgroundColor: colors.background,
	} satisfies ViewStyle,

	mainBackground: {
		backgroundColor: colors.background,
	} satisfies ViewStyle,

	// Hero
	heroContainer: {
		backgroundColor: colors.card,
	} satisfies ViewStyle,

	heroPlaceholder: {
		backgroundColor: colors.card,
	} satisfies ViewStyle,

	heroOverlay: {
		backgroundColor: 'rgba(7,92,59,0.08)',
	} satisfies ViewStyle,

	heroBackButton: {
		backgroundColor: 'rgba(255,255,255,0.92)',
		...cardShadow,
	} satisfies ViewStyle,

	heroBackButtonPressed: {
		backgroundColor: colors.active,
	} satisfies ViewStyle,

	heroBackArrow: {
		marginRight: 4,
		fontSize: 20,
		fontWeight: '700',
		lineHeight: 20,
		color: colors.primary,
	} satisfies TextStyle,

	heroBackText: {
		fontSize: 14,
		fontWeight: '600',
		color: colors.text,
	} satisfies TextStyle,

	// Card principal
	mainCard: {
		backgroundColor: colors.cardLight,
		borderWidth: 1,
		borderColor: colors.border,
		...cardShadow,
	} satisfies ViewStyle,

	cardBackground: {
		backgroundColor: colors.background,
	} satisfies ViewStyle,

	cardPatternImage: {
		opacity: 0.3,
	} satisfies ImageStyle,

	// Categoría
	categoryBadge: {
		backgroundColor: colors.active,
		borderWidth: 1,
		borderColor: colors.border,
	} satisfies ViewStyle,

	categoryText: {
		color: colors.primary,
	} satisfies TextStyle,

	// Información principal
	speciesName: {
		color: colors.text,
	} satisfies TextStyle,

	scientificName: {
		color: colors.textSecondary,
	} satisfies TextStyle,

	sectionTitle: {
		color: colors.primary,
	} satisfies TextStyle,

	description: {
		color: colors.textSecondary,
	} satisfies TextStyle,

	// Etiquetas
	tag: {
		backgroundColor: colors.active,
		borderColor: colors.border,
	} satisfies ViewStyle,

	tagText: {
		color: colors.primary,
	} satisfies TextStyle,

	// Galería
	galleryContent: {
		paddingHorizontal: 20,
	} satisfies ViewStyle,

	galleryItem: {
		backgroundColor: colors.card,
		borderWidth: 1,
		borderColor: colors.border,
		...subtleShadow,
	} satisfies ViewStyle,

	galleryPressable: {
		opacity: 1,
	} satisfies ViewStyle,

	galleryPressed: {
		opacity: 0.88,
	} satisfies ViewStyle,

	// Modal
	modalContainer: {
		backgroundColor: 'rgba(23,55,44,0.95)',
	} satisfies ViewStyle,

	modalCloseWrapper: {
		position: 'absolute',
		right: 20,
		top: 56,
		zIndex: 10,
		overflow: 'hidden',
		borderRadius: 999,
		backgroundColor: 'rgba(221,245,234,0.20)',
		borderWidth: 1,
		borderColor: 'rgba(189,238,217,0.35)',
	} satisfies ViewStyle,

	modalCloseButton: {
		backgroundColor: 'rgba(221,245,234,0.20)',
	} satisfies ViewStyle,

	modalCloseButtonPressed: {
		backgroundColor: 'rgba(189,238,217,0.30)',
	} satisfies ViewStyle,

	modalCloseText: {
		fontSize: 14,
		fontWeight: '700',
		color: colors.white,
	} satisfies TextStyle,

	// SpeciesDataCard
	dataCard: {
		backgroundColor: colors.white,
		borderColor: colors.border,
		...subtleShadow,
	} satisfies ViewStyle,

	dataCardAccent: {
		backgroundColor: colors.active,
	} satisfies ViewStyle,

	dataLabel: {
		color: colors.textSecondary,
	} satisfies TextStyle,

	dataLabelAccent: {
		color: colors.primary,
	} satisfies TextStyle,

	dataValue: {
		color: colors.text,
	} satisfies TextStyle,
}

export default styles
