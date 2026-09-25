import { StyleSheet } from 'react-native'

const cardShadow = {
	shadowColor: '#000000',
	shadowOffset: {
		width: 0,
		height: 5,
	},
	shadowOpacity: 0.18,
	shadowRadius: 8,
	elevation: 1,
}

export const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F7F8F3',
	},

	map: {
		flex: 1,
	},

	loadingContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#F7F8F3',
		paddingHorizontal: 24,
	},

	loadingCard: {
		width: '100%',
		maxWidth: 320,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#F7F7EE',
		borderRadius: 24,
		paddingVertical: 30,
		paddingHorizontal: 24,
		...cardShadow,
	},

	loadingText: {
		marginTop: 14,
		fontSize: 15,
		fontWeight: '600',
		color: '#6F8A7D',
	},

	errorCard: {
		width: '100%',
		maxWidth: 360,
		alignItems: 'center',
		backgroundColor: '#FFF1F0',
		borderRadius: 24,
		borderWidth: 1,
		borderColor: '#FFE3E1',
		paddingVertical: 28,
		paddingHorizontal: 24,
		...cardShadow,
	},

	errorIconContainer: {
		width: 52,
		height: 52,
		borderRadius: 18,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#FFE3E1',
		marginBottom: 14,
	},

	errorIcon: {
		fontSize: 28,
		fontWeight: '800',
		color: '#C24141',
	},

	errorTitle: {
		fontSize: 20,
		fontWeight: '800',
		color: '#123C32',
		textAlign: 'center',
		marginBottom: 8,
	},

	errorText: {
		fontSize: 14,
		lineHeight: 21,
		color: '#6F8A7D',
		textAlign: 'center',
	},

	topPanel: {
		position: 'absolute',
		top: 60,
		left: 12,
		right: 12,
		backgroundColor: '#F7F7EE',
		borderRadius: 22,
		padding: 16,
		...cardShadow,
	},

	headerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},

	headerTextContainer: {
		flex: 1,
		paddingRight: 10,
	},

	title: {
		fontSize: 19,
		fontWeight: '800',
		color: '#123C32',
	},

	subtitle: {
		marginTop: 3,
		fontSize: 12,
		color: '#6F8A7D',
	},

	statusBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 16,
		paddingHorizontal: 10,
		paddingVertical: 7,
		backgroundColor: '#DCEFE5',
	},

	statusDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		marginRight: 5,
	},

	statusText: {
		fontSize: 11,
		fontWeight: '700',
		color: '#123C32',
	},

	locationBadge: {
		position: 'absolute',
		right: 14,
		top: 150,
		backgroundColor: '#F7F7EE',
		borderRadius: 16,
		paddingHorizontal: 11,
		paddingVertical: 8,
		flexDirection: 'row',
		alignItems: 'center',
		...cardShadow,
	},

	locationBadgeDot: {
		width: 9,
		height: 9,
		borderRadius: 5,
		backgroundColor: '#0977B8',
		marginRight: 7,
	},

	locationBadgeTitle: {
		fontSize: 11,
		fontWeight: '700',
		color: '#123C32',
	},

	locationBadgeText: {
		marginTop: 1,
		fontSize: 9,
		color: '#6F8A7D',
	},

	mapMarker: {
		width: 38,
		height: 38,
		borderRadius: 19,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#087A5A',
		borderWidth: 3,
		borderColor: '#F7F7EE',
		overflow: 'hidden',
		...cardShadow,
	},

	mapMarkerImage: {
		width: 30,
		height: 30,
		borderRadius: 15,
	},

	speciesMarker: {
		width: 42,
		height: 42,
		borderRadius: 21,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#064D36',
		borderWidth: 3,
		borderColor: '#F7F7EE',
		overflow: 'hidden',
		...cardShadow,
	},

	speciesMarkerImage: {
		width: 36,
		height: 36,
		borderRadius: 18,
	},

	mapMarkerIcon: {
		fontSize: 18,
	},

	userLocationOuter: {
		width: 46,
		height: 46,
		borderRadius: 23,
		backgroundColor: 'rgba(8, 118, 161, 0.2)',
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: 'rgba(8, 121, 141, 0.4)',
	},

	userLocationInner: {
		width: 17,
		height: 17,
		borderRadius: 9,
		backgroundColor: '#0977B8',
		borderWidth: 3,
		borderColor: '#F7F7EE',
		...cardShadow,
	},

	destinationMarker: {
		width: 46,
		height: 46,
		borderRadius: 23,
		backgroundColor: '#064D36',
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 4,
		borderColor: '#F7F7EE',
		overflow: 'hidden',
		...cardShadow,
	},

	destinationMarkerImage: {
		width: 36,
		height: 36,
		borderRadius: 18,
	},

	destinationSpecies: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: '#087A5A',
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 4,
		borderColor: '#F7F7EE',
		overflow: 'hidden',
		...cardShadow,
	},

	destinationSpeciesImage: {
		width: 40,
		height: 40,
		borderRadius: 20,
	},

	destinationIcon: {
		fontSize: 20,
	},

	bottomCard: {
		position: 'absolute',
		left: 12,
		right: 12,
		bottom: 15,
		backgroundColor: '#F7F7EE',
		borderRadius: 22,
		padding: 16,
		...cardShadow,
	},

	bottomCardHeader: {
		flexDirection: 'row',
		alignItems: 'center',
	},

	itemIcon: {
		width: 42,
		height: 42,
		borderRadius: 16,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#DCEFE5',
		overflow: 'hidden',
	},

	itemIconSpecies: {
		backgroundColor: '#DCEFE5',
	},

	itemIconMarker: {
		backgroundColor: '#DCEFE5',
	},

	itemSpeciesImage: {
		width: 42,
		height: 42,
		borderRadius: 16,
	},

	itemMarkerImage: {
		width: 34,
		height: 34,
		borderRadius: 12,
	},

	itemTextContainer: {
		flex: 1,
		minWidth: 0,
		marginLeft: 10,
		marginRight: 10,
	},

	itemTitle: {
		fontSize: 16,
		fontWeight: '800',
		color: '#123C32',
	},

	itemType: {
		marginTop: 2,
		fontSize: 11,
		color: '#6F8A7D',
	},

	scientificName: {
		marginTop: 8,
		fontSize: 12,
		fontStyle: 'italic',
		color: '#6F8A7D',
	},

	closeButton: {
		width: 34,
		height: 34,
		borderRadius: 16,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#DCEFE5',
	},

	closeButtonText: {
		fontSize: 23,
		lineHeight: 25,
		color: '#123C32',
	},

	itemDescription: {
		marginTop: 12,
		fontSize: 13,
		lineHeight: 19,
		color: '#6F8A7D',
	},

	actionRow: {
		width: '100%',
		marginTop: 14,
	},

	howToButtonContainer: {
		width: '100%',
		height: 56,
		borderRadius: 16,
		borderWidth: 1,
		shadowColor: '#000000',
		shadowOffset: {
			width: 0,
			height: 5,
		},
		shadowOpacity: 0.18,
		shadowRadius: 8,
		elevation: 1,
		overflow: 'hidden',
	},

	howToButton: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'transparent',
	},

	howToButtonText: {
		fontSize: 16,
		fontWeight: '800',
		color: '#FFFFFF',
		textAlign: 'center',
		textAlignVertical: 'center',
		includeFontPadding: false,
		lineHeight: 56,
		padding: 0,
		margin: 0,
	},

	outsideZooText: {
		marginTop: 10,
		fontSize: 11,
		lineHeight: 17,
		color: '#6F8A7D',
	},

	routeInfo: {
		marginTop: 14,
		paddingTop: 13,
		borderTopWidth: 1,
		borderTopColor: '#B8DCCA',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 10,
	},

	routeSummary: {
		flex: 1,
		minWidth: 0,
	},

	routeLabel: {
		fontSize: 11,
		color: '#6F8A7D',
	},

	routeDistance: {
		marginTop: 2,
		fontSize: 17,
		fontWeight: '800',
		color: '#064D36',
	},

	routeTimeBox: {
		alignItems: 'center',
		minWidth: 48,
	},

	routeTime: {
		fontSize: 13,
		fontWeight: '800',
		color: '#123C32',
	},

	routeTimeLabel: {
		fontSize: 9,
		color: '#6F8A7D',
	},

	routeButton: {
		backgroundColor: '#064D36',
		borderRadius: 16,
		paddingHorizontal: 15,
		paddingVertical: 10,
		...cardShadow,
	},

	routeButtonText: {
		fontSize: 11,
		fontWeight: '700',
		color: '#FFFFFF',
	},

	routeHint: {
		marginTop: 10,
		fontSize: 11,
		lineHeight: 17,
		color: '#6F8A7D',
	},

	noRouteText: {
		marginTop: 12,
		fontSize: 12,
		lineHeight: 18,
		color: '#6F8A7D',
	},

	collapsedCardShadow: {
		position: 'absolute',
		left: 12,
		right: 12,
		bottom: 15,
		height: 72,
		borderRadius: 20,
		backgroundColor: '#F7F7EE',
		shadowColor: '#000000',
		shadowOffset: {
			width: 0,
			height: 5,
		},
		shadowOpacity: 0.18,
		shadowRadius: 8,
		elevation: 1,
	},

	collapsedRouteCard: {
		position: 'relative',
		width: '100%',
		height: 72,
		backgroundColor: '#F7F7EE',
		borderRadius: 20,
		paddingLeft: 12,
		paddingRight: 12,
		justifyContent: 'center',
	},

	collapsedRouteIcon: {
		position: 'absolute',
		left: 12,
		top: 15,
		width: 35,
		height: 35,
		borderRadius: 14,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#087A5A',
		overflow: 'hidden',
	},

	collapsedSpeciesImage: {
		width: 35,
		height: 35,
		borderRadius: 14,
	},

	collapsedMarkerImage: {
		width: 30,
		height: 30,
		borderRadius: 12,
	},

	collapsedRouteIconText: {
		fontSize: 18,
	},

	collapsedRouteMain: {
		position: 'absolute',
		left: 59,
		right: 92,
		top: 12,
		height: 48,
		justifyContent: 'center',
	},

	collapsedRouteName: {
		width: '100%',
		justifyContent: 'center',
	},

	collapsedRouteTitle: {
		fontSize: 14,
		fontWeight: '800',
		color: '#123C32',
		lineHeight: 18,
	},

	collapsedRouteSubtitle: {
		marginTop: 2,
		fontSize: 9,
		color: '#6F8A7D',
		lineHeight: 12,
	},

	collapsedRouteStats: {
		position: 'absolute',
		right: -30,
		top: 0,
		width: 125,
		height: 48,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-end',
	},

	collapsedRouteStat: {
		width: 52,
		alignItems: 'center',
		justifyContent: 'center',
	},

	collapsedRouteDistance: {
		fontSize: 14,
		fontWeight: '800',
		color: '#064D36',
		textAlign: 'center',
		lineHeight: 17,
	},

	collapsedRouteTime: {
		fontSize: 13,
		fontWeight: '800',
		color: '#123C32',
		textAlign: 'center',
		lineHeight: 16,
	},

	collapsedRouteLabel: {
		marginTop: 1,
		fontSize: 7,
		color: '#6F8A7D',
		textAlign: 'center',
		lineHeight: 9,
	},

	collapsedRouteSeparator: {
		width: 1,
		height: 24,
		marginHorizontal: 5,
		backgroundColor: '#B8DCCA',
	},

	collapsedRouteExpand: {
		position: 'absolute',
		right: 12,
		top: 20,
		width: 32,
		height: 32,
		borderRadius: 16,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#DCEFE5',
	},
})
