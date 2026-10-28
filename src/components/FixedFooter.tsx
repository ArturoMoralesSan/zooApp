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
					<Text className='text-[15px] font-extrabold text-tinta'>{label}</Text>

					<Text className='mt-1 text-[13px] font-medium text-tinta-2'>
						{description}
					</Text>
				</View>

				<Text className='text-right text-[27px] font-black text-bosque'>
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
