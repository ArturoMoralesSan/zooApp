import colors from '@/theme/colors'
import { ActivityIndicator, Text, View } from 'react-native'

type FooterLoadingBarProps = {
	message: string
}

export function FooterLoadingBar({ message }: FooterLoadingBarProps) {
	return (
		<View
			className='absolute bottom-0 left-0 right-0 z-[999] flex-row items-center justify-center gap-2.5 border-t border-t-card-border bg-blanco px-5 pb-7 pt-5'
			style={{ elevation: 15 }}
		>
			<ActivityIndicator size='small' color={colors.esmeralda} />
			<Text className='font-sans-x text-[14px] text-esmeralda'>{message}</Text>
		</View>
	)
}
