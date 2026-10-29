import { Stack } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { AuthProvider } from '@/contexts/AuthContext'
import { DataProvider } from '@/services/swr-config'
import '../global.css'

export default function RootLayout() {
	return (
		<SafeAreaProvider>
			<DataProvider>
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
			</DataProvider>
		</SafeAreaProvider>
	)
}
