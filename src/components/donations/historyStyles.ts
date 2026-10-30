import type { ViewStyle } from 'react-native'

import colors from '@/theme/colors'

export const ICON_COLOR = colors.tinta

export const cardShadow: ViewStyle = {
	shadowColor: colors.bosque,
	shadowOffset: { width: 0, height: 2 },
	shadowOpacity: 0.05,
	shadowRadius: 5,
	elevation: 2,
}
