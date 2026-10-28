import type { ViewStyle } from 'react-native'

// Shadows stay as style objects: NativeWind's shadow-* classes don't map
// 1:1 to iOS shadow props + Android elevation.

export const cardShadow: ViewStyle = {
	shadowColor: '#164A2C',
	shadowOffset: { width: 0, height: 2 },
	shadowOpacity: 0.04,
	shadowRadius: 4,
	elevation: 1,
}
