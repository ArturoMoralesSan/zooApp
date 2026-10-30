import type { ViewStyle } from 'react-native'

import colors from '@/theme/colors'

export const ICON_COLOR = colors.esmeralda

export const cardShadow: ViewStyle = {
	shadowColor: colors.bosque,
	shadowOffset: { width: 0, height: 2 },
	shadowOpacity: 0.05,
	shadowRadius: 8,
	elevation: 2,
}
