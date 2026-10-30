import type { ViewStyle } from 'react-native'

// The one shadow left in the App: map markers are white-ringed circles over
// light map tiles, and without it the ring blends into the map. Cards over
// the map use the 1.5px card border instead.
export const markerShadow: ViewStyle = {
	// eslint-disable-next-line no-restricted-syntax -- neutral shadow over the map imagery
	shadowColor: '#000000',
	shadowOffset: { width: 0, height: 2 },
	shadowOpacity: 0.18,
	shadowRadius: 4,
	elevation: 2,
}
