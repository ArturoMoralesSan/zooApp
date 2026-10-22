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
		<View style={{ width: '100%', marginTop: 16 }}>
			<Pressable
				onPress={onPress}
				disabled={disabled}
				android_ripple={{ color: '#064720' }}
				style={{
					height: 50,
					width: '100%',
					backgroundColor: disabled ? '#8BA997' : '#06733A',
					borderBottomWidth: 3,
					borderBottomColor: '#064720',
					borderRadius: 10,
					alignItems: 'center',
					justifyContent: 'center',
					elevation: 2,
				}}
			>
				<Text
					style={{
						color: '#FFFFFF',
						fontSize: 16,
						fontWeight: '800',
						includeFontPadding: true,
					}}
				>
					{title}
				</Text>
			</Pressable>
		</View>
	)
}
