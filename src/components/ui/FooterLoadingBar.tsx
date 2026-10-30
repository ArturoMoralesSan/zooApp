import colors from '@/theme/colors'
import { getFooterBottomPadding } from '@/theme/layout'
import { ActivityIndicator, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type FooterLoadingBarProps = {
	message: string
}

export function FooterLoadingBar({ message }: FooterLoadingBarProps) {
	const insets = useSafeAreaInsets()

	return (
		<View
			className='absolute bottom-0 left-0 right-0 z-[999] flex-row items-center justify-center gap-2.5 border-t-1.5 border-t-card-border bg-blanco px-5 pt-5'
			style={{
				paddingBottom: getFooterBottomPadding(insets.bottom),
			}}
		>
			<ActivityIndicator size='small' color={colors.esmeralda} />
			<Text className='font-sans-x text-[14px] text-esmeralda'>{message}</Text>
		</View>
	)
}
