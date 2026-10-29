import type { ViewStyle } from 'react-native'

import colors from '@/theme/colors'

export const ICON_COLORS = {
	primary: colors.esmeralda,
	muted: colors.tinta2,
	coral: colors.error,
} as const

export const cardShadow: ViewStyle = {
	shadowColor: colors.tinta,
	shadowOffset: { width: 0, height: 3 },
	shadowOpacity: 0.055,
	shadowRadius: 8,
	elevation: 2,
}
