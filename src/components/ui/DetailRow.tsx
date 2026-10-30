import { Text, View } from 'react-native'

type DetailRowProps = {
	label: string
	value: string
	// Barlow figure for amounts instead of bold text.
	emphasis?: boolean
	selectable?: boolean
}

// Label on the left, value on the right, inside a card's detail list.
export function DetailRow({
	label,
	value,
	emphasis = false,
	selectable = false,
}: DetailRowProps) {
	return (
		<View className='min-h-10 flex-row items-center justify-between gap-3'>
			<Text className='text-body shrink-0 text-tinta-2'>{label}</Text>

			<Text
				className={`flex-1 text-right ${emphasis ? 'font-display-x text-[16px] text-bosque' : 'font-sans-bold text-[14px] text-tinta'}`}
				numberOfLines={1}
				adjustsFontSizeToFit
				minimumFontScale={0.8}
				selectable={selectable}
			>
				{value}
			</Text>
		</View>
	)
}
