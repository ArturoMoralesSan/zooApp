import { Stack } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { AuthProvider } from '@/contexts/AuthContext'
import '../global.css'

export default function RootLayout() {
	return (
		<SafeAreaProvider>
			<AuthProvider>
				<Stack
					initialRouteName='index'
					screenOptions={{
						headerShown: false,
					}}
				>
					<Stack.Screen name='index' />
					<Stack.Screen name='splash' />
					<Stack.Screen name='login' />
					<Stack.Screen name='(tabs)' />
				</Stack>
			</AuthProvider>
		</SafeAreaProvider>
	)
}
