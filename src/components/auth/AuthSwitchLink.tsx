import { TextLink } from '@/components/ui/TextLink'
import { Text, View } from 'react-native'

type AuthSwitchLinkProps = {
	prompt: string
	label: string
	onPress: () => void
}

// "¿No tienes una cuenta? Regístrate" line under the auth button, 16px below.
export function AuthSwitchLink({
	prompt,
	label,
	onPress,
}: AuthSwitchLinkProps) {
	return (
		<View className='mt-4 flex-row flex-wrap items-center justify-center'>
			<Text className='text-body text-tinta-2'>{prompt} </Text>
			<TextLink label={label} onPress={onPress} />
		</View>
	)
}
