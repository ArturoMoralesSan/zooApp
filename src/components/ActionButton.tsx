import { Pressable, Text, View } from 'react-native'

type ActionButtonProps = {
	title: string
	onPress: () => void
	disabled?: boolean
}

export default function ActionButton({
	title,
	onPress,
	disabled = false,
}: ActionButtonProps) {
	return (
		<View className='mt-4 w-full'>
			<Pressable
				onPress={onPress}
				disabled={disabled}
				android_ripple={{ color: '#064720' }}
				className={`h-[50px] w-full items-center justify-center rounded-[10px] border-b-[3px] border-b-[#064720] ${disabled ? 'bg-[#8BA997]' : 'bg-esmeralda'}`}
				style={{ elevation: 2 }}
			>
				<Text className='text-[16px] font-extrabold text-blanco'>{title}</Text>
			</Pressable>
		</View>
	)
}
