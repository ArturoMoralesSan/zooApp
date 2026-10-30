import type { ViewStyle } from 'react-native'

export const mapShadow: ViewStyle = {
	// eslint-disable-next-line no-restricted-syntax -- neutral shadow over the map imagery
	shadowColor: '#000000',
	shadowOffset: { width: 0, height: 5 },
	shadowOpacity: 0.18,
	shadowRadius: 8,
	elevation: 1,
}
