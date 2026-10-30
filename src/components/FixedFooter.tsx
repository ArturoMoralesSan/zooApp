import { Text, View } from 'react-native'

import ActionButton from '@/components/ActionButton'

type FixedFooterProps = {
	label: string
	description: string
	amount: string
	buttonTitle: string
	onButtonPress: () => void
	disabled?: boolean
}

export default function FixedFooter({
	label,
	description,
	amount,
	buttonTitle,
	onButtonPress,
	disabled = false,
}: FixedFooterProps) {
	return (
		<View
			className='absolute bottom-0 left-0 right-0 z-[999] border-t border-t-card-border bg-blanco px-5 pb-7 pt-4'
			style={{ elevation: 15 }}
		>
			<View className='flex-row items-center justify-between gap-3'>
				<View className='flex-1 justify-center'>
					<Text className='text-h3 text-tinta'>{label}</Text>

					<Text className='text-meta mt-1'>{description}</Text>
				</View>

				<Text className='text-right font-display-x text-[27px] text-bosque'>
					{amount}
				</Text>
			</View>

			<ActionButton
				title={buttonTitle}
				onPress={onButtonPress}
				disabled={disabled}
			/>
		</View>
	)
}
