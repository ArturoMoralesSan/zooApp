import type { ViewStyle } from 'react-native'
import colors from '@/theme/colors'

// Shadows stay as style objects: NativeWind's shadow-* classes don't map
// 1:1 to iOS shadow props + Android elevation.

export const cardShadow: ViewStyle = {
	shadowColor: colors.bosque,
	shadowOffset: { width: 0, height: 2 },
	shadowOpacity: 0.04,
	shadowRadius: 4,
	elevation: 1,
}
