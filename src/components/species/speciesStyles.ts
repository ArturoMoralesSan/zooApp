import type { ViewStyle } from 'react-native'

import colors from '@/theme/colors'

export const cardShadow: ViewStyle = {
	shadowColor: colors.esmeralda,
	shadowOffset: { width: 0, height: 5 },
	shadowOpacity: 0.12,
	shadowRadius: 10,
	elevation: 4,
}
