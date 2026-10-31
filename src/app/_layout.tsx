import { Barlow_700Bold, Barlow_800ExtraBold } from '@expo-google-fonts/barlow'
import {
	NotoSans_500Medium,
	NotoSans_600SemiBold,
	NotoSans_700Bold,
	NotoSans_800ExtraBold,
} from '@expo-google-fonts/noto-sans'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { OfflineBanner } from '@/components/ui/OfflineBanner'
import { AuthProvider } from '@/contexts/AuthContext'
import { DataProvider } from '@/services/swr-config'
import { StatusBar } from 'expo-status-bar'
import '../global.css'

// Keep the native splash up until the fonts are ready, so the first screen
// never renders in the system font.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
	const [fontsLoaded, fontError] = useFonts({
		Barlow_700Bold,
		Barlow_800ExtraBold,
		NotoSans_500Medium,
		NotoSans_600SemiBold,
		NotoSans_700Bold,
		NotoSans_800ExtraBold,
	})

	useEffect(() => {
		if (fontsLoaded || fontError) {
			SplashScreen.hideAsync()
		}
	}, [fontsLoaded, fontError])

	if (!fontsLoaded && !fontError) {
		return null
	}

	return (
		<SafeAreaProvider>
			{/* Tracks the keyboard for KeyboardScrollView on every screen. */}
			<KeyboardProvider>
				<DataProvider>
					<AuthProvider>
						{/* Dark icons by default: every screen is white, so the
						    phone's dark theme must not switch them to light. */}
						<StatusBar style='dark' />

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

						<OfflineBanner />
					</AuthProvider>
				</DataProvider>
			</KeyboardProvider>
		</SafeAreaProvider>
	)
}
