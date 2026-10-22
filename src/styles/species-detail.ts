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
	card: '#eef4f0',
	cardLight: '#eef4f0',
	active: '#d5ead9',
	iconBackground: '#d5ead9',
	white: '#FFFFFF',
	coral: '#08783F',
	errorBackground: '#eef4f0',
	errorBorder: '#a6c1b3',
	errorText: '#0a2014',
	mapBackground: '#eef4f0',
	mapBorder: '#a6c1b3',
	overlay: 'rgba(6,61,34,0.55)',
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
		backgroundColor: colors.active,
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
		backgroundColor: colors.primaryDark,
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
		backgroundColor: 'rgba(6,61,34,0.08)',
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
		backgroundColor: colors.iconBackground,
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

	// Títulos de secciones:
	// Conoce a esta especie, Datos de la especie,
	// Etiquetas y Galería.
	sectionTitle: {
		color: '#0a2014',
	} satisfies TextStyle,

	description: {
		color: colors.textSecondary,
	} satisfies TextStyle,

	// Etiquetas
	tag: {
		backgroundColor: colors.iconBackground,
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
		backgroundColor: 'rgba(6,32,20,0.95)',
	} satisfies ViewStyle,

	modalCloseWrapper: {
		position: 'absolute',
		right: 20,
		top: 56,
		zIndex: 10,
		overflow: 'hidden',
		borderRadius: 999,
		backgroundColor: 'rgba(238,244,240,0.20)',
		borderWidth: 1,
		borderColor: 'rgba(166,193,179,0.35)',
	} satisfies ViewStyle,

	modalCloseButton: {
		backgroundColor: 'rgba(238,244,240,0.20)',
	} satisfies ViewStyle,

	modalCloseButtonPressed: {
		backgroundColor: 'rgba(213,234,217,0.30)',
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
