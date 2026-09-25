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
	coral: '#D95C4F',
	errorBackground: '#FFF3F1',
	errorBorder: '#F3D5D0',
	errorText: '#8C4037',
	mapBackground: '#F8E1DE',
	mapBorder: '#EFC2BC',
	button: '#246F4C',
	buttonPressed: '#1D5C3F',
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

const styles = {
	container: {
		flex: 1,
		backgroundColor: colors.background,
	} satisfies ViewStyle,

	background: {
		flex: 1,
	} satisfies ViewStyle,

	patternImage: {
		opacity: 0.3,
	} satisfies ImageStyle,

	scrollView: {
		flex: 1,
	} satisfies ViewStyle,

	scrollContent: {
		paddingHorizontal: 20,
		paddingTop: 55,
		paddingBottom: 40,
	} satisfies ViewStyle,

	loadingContainer: {
		flex: 1,
		backgroundColor: colors.background,
	} satisfies ViewStyle,

	loadingBackground: {
		flex: 1,
	} satisfies ViewStyle,

	loadingContent: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	} satisfies ViewStyle,

	loadingText: {
		marginTop: 12,
		fontSize: 15,
		fontWeight: '600',
		color: colors.muted,
	} satisfies TextStyle,

	// Regresar
	backButtonWrapper: {
		alignSelf: 'flex-start',
		marginBottom: 17,
	} satisfies ViewStyle,

	backButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(247,249,248,0.94)',
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 18,
		paddingHorizontal: 16,
		paddingVertical: 10,
		...cardShadow,
	} satisfies ViewStyle,

	backButtonPressed: {
		opacity: 0.75,
		backgroundColor: colors.card,
	} satisfies ViewStyle,

	backText: {
		fontSize: 15,
		fontWeight: '700',
		color: colors.dark,
	} satisfies TextStyle,

	// Header
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 22,
	} satisfies ViewStyle,

	headerIcon: {
		width: 52,
		height: 52,
		borderRadius: 17,
		backgroundColor: colors.active,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: colors.border,
	} satisfies ViewStyle,

	headerText: {
		flex: 1,
		marginLeft: 13,
	} satisfies ViewStyle,

	title: {
		fontSize: 27,
		fontWeight: '900',
		color: colors.dark,
	} satisfies TextStyle,

	subtitle: {
		marginTop: 4,
		fontSize: 14,
		lineHeight: 20,
		color: colors.muted,
	} satisfies TextStyle,

	// Buscador
	searchSection: {
		marginBottom: 4,
	} satisfies ViewStyle,

	searchLabel: {
		marginBottom: 8,
		fontSize: 14,
		fontWeight: '800',
		color: colors.dark,
	} satisfies TextStyle,

	searchContainer: {
		height: 54,
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: colors.cardLight,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 18,
	} satisfies ViewStyle,

	searchIcon: {
		paddingLeft: 16,
		alignItems: 'center',
		justifyContent: 'center',
	} satisfies ViewStyle,

	searchInput: {
		flex: 1,
		paddingHorizontal: 12,
		paddingVertical: 0,
		fontSize: 15,
		color: colors.dark,
	} satisfies TextStyle,

	// Filtros
	filtersScroll: {
		marginTop: 15,
		marginHorizontal: -2,
	} satisfies ViewStyle,

	filtersContent: {
		paddingHorizontal: 2,
		paddingRight: 20,
		alignItems: 'center',
	} satisfies ViewStyle,

	filterWrapper: {
		marginRight: 9,
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: 999,
		backgroundColor: colors.white,
		borderWidth: 1,
		borderColor: colors.border,
		overflow: 'hidden',
	} satisfies ViewStyle,

	filterWrapperActive: {
		backgroundColor: colors.primary,
		borderColor: colors.primary,
	} satisfies ViewStyle,

	filterButton: {
		alignItems: 'center',
		justifyContent: 'center',
	} satisfies ViewStyle,

	filterButtonActive: {
		backgroundColor: 'transparent',
	} satisfies ViewStyle,

	filterButtonPressed: {
		opacity: 0.72,
	} satisfies ViewStyle,

	filterText: {
		fontSize: 13,
		fontWeight: '800',
		color: colors.dark,
	} satisfies TextStyle,

	filterTextActive: {
		color: colors.white,
	} satisfies TextStyle,

	// Resultados
	resultsHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginTop: 19,
		marginBottom: 2,
	} satisfies ViewStyle,

	resultsCount: {
		fontSize: 13,
		fontWeight: '800',
		color: colors.muted,
	} satisfies TextStyle,

	clearButton: {
		paddingHorizontal: 10,
		paddingVertical: 7,
		borderRadius: 14,
	} satisfies ViewStyle,

	clearButtonPressed: {
		backgroundColor: colors.active,
	} satisfies ViewStyle,

	clearText: {
		fontSize: 13,
		fontWeight: '800',
		color: colors.primary,
	} satisfies TextStyle,

	// Error
	errorCard: {
		marginTop: 15,
		padding: 18,
		backgroundColor: colors.errorBackground,
		borderWidth: 1,
		borderColor: colors.errorBorder,
		borderRadius: 22,
		alignItems: 'center',
	} satisfies ViewStyle,

	errorIcon: {
		width: 44,
		height: 44,
		borderRadius: 15,
		backgroundColor: colors.white,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: colors.errorBorder,
	} satisfies ViewStyle,

	errorIconText: {
		fontSize: 21,
		fontWeight: '900',
		color: colors.errorText,
	} satisfies TextStyle,

	errorTitle: {
		marginTop: 12,
		fontSize: 15,
		fontWeight: '900',
		color: colors.errorText,
		textAlign: 'center',
	} satisfies TextStyle,

	errorText: {
		marginTop: 6,
		fontSize: 12,
		lineHeight: 18,
		color: colors.muted,
		textAlign: 'center',
	} satisfies TextStyle,

	retryButtonWrapper: {
		width: '100%',
		height: 48,
		marginTop: 15,
		borderRadius: 16,
		backgroundColor: colors.button,
		borderWidth: 1,
		borderColor: colors.button,
		overflow: 'hidden',
	} satisfies ViewStyle,

	retryButton: {
		width: '100%',
		height: '100%',
		alignItems: 'center',
		justifyContent: 'center',
	} satisfies ViewStyle,

	retryButtonContent: {
		width: '100%',
		height: '100%',
		alignItems: 'center',
		justifyContent: 'center',
	} satisfies ViewStyle,

	retryButtonPressed: {
		backgroundColor: colors.buttonPressed,
	} satisfies ViewStyle,

	retryButtonText: {
		fontSize: 14,
		fontWeight: '900',
		color: colors.white,
		textAlign: 'center',
	} satisfies TextStyle,

	// Sin resultados
	emptyCard: {
		marginTop: 15,
		paddingHorizontal: 20,
		paddingVertical: 35,
		backgroundColor: colors.cardLight,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 25,
		alignItems: 'center',
		...cardShadow,
	} satisfies ViewStyle,

	emptyIcon: {
		width: 64,
		height: 64,
		borderRadius: 20,
		backgroundColor: colors.active,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: colors.border,
	} satisfies ViewStyle,

	emptyTitle: {
		marginTop: 16,
		fontSize: 18,
		fontWeight: '900',
		color: colors.dark,
		textAlign: 'center',
	} satisfies TextStyle,

	emptyText: {
		marginTop: 6,
		fontSize: 13,
		lineHeight: 19,
		color: colors.muted,
		textAlign: 'center',
	} satisfies TextStyle,

	// Especies
	speciesList: {
		marginTop: 15,
	} satisfies ViewStyle,

	speciesCard: {
		width: '100%',
		marginBottom: 15,
		backgroundColor: colors.cardLight,
		borderRadius: 25,
		borderWidth: 1,
		borderColor: colors.border,
		overflow: 'hidden',
		...cardShadow,
	} satisfies ViewStyle,

	speciesPressable: {
		width: '100%',
		backgroundColor: colors.cardLight,
		borderRadius: 25,
		overflow: 'hidden',
	} satisfies ViewStyle,

	speciesPressed: {
		opacity: 0.94,
	} satisfies ViewStyle,

	speciesImage: {
		width: '100%',
		height: 210,
	} satisfies ImageStyle,

	speciesImagePlaceholder: {
		width: '100%',
		height: 210,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.active,
	} satisfies ViewStyle,

	speciesContent: {
		padding: 18,
	} satisfies ViewStyle,

	speciesTitleRow: {
		flexDirection: 'row',
		alignItems: 'flex-start',
	} satisfies ViewStyle,

	speciesNameContainer: {
		flex: 1,
		paddingRight: 12,
	} satisfies ViewStyle,

	speciesName: {
		fontSize: 20,
		lineHeight: 25,
		fontWeight: '900',
		color: colors.dark,
	} satisfies TextStyle,

	scientificName: {
		marginTop: 4,
		fontSize: 13,
		fontStyle: 'italic',
		color: colors.muted,
	} satisfies TextStyle,

	arrowContainer: {
		width: 42,
		height: 42,
		borderRadius: 15,
		backgroundColor: colors.active,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: colors.border,
	} satisfies ViewStyle,

	categoryBadge: {
		alignSelf: 'flex-start',
		marginTop: 14,
		paddingHorizontal: 11,
		paddingVertical: 6,
		borderRadius: 13,
		backgroundColor: colors.active,
		borderWidth: 1,
		borderColor: colors.border,
	} satisfies ViewStyle,

	categoryText: {
		fontSize: 11,
		fontWeight: '800',
		color: colors.dark,
	} satisfies TextStyle,

	description: {
		marginTop: 12,
		fontSize: 13,
		lineHeight: 19,
		color: colors.muted,
	} satisfies TextStyle,

	viewInfo: {
		marginTop: 14,
		fontSize: 13,
		fontWeight: '900',
		color: colors.primary,
	} satisfies TextStyle,

	bottomSpace: {
		height: 40,
	} satisfies ViewStyle,
}

export default styles
