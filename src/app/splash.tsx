import { Redirect } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Image, ImageBackground, View } from 'react-native'

import { useAuth } from '@/contexts/AuthContext'

const MIN_SPLASH_TIME = 5000

export default function SplashScreen() {
	const { loading, isAuthenticated } = useAuth()
	const [splashFinished, setSplashFinished] = useState(false)

	useEffect(() => {
		const timeout = setTimeout(() => {
			setSplashFinished(true)
		}, MIN_SPLASH_TIME)

		return () => clearTimeout(timeout)
	}, [])

	if (splashFinished && !loading) {
		return <Redirect href={isAuthenticated ? '/(tabs)' : '/login'} />
	}

	return (
		<ImageBackground
			source={require('../../assets/images/login-background.png')}
			resizeMode='cover'
			className='flex-1 items-center justify-center'
		>
			{/* Capa blanca con 10 % de opacidad */}
			<View pointerEvents='none' className='absolute inset-0 bg-white/10' />

			<View className='w-full items-center justify-center px-7'>
				<Image
					source={require('../../assets/images/zooapp-logo.png')}
					resizeMode='contain'
					accessibilityLabel='Logo de ZooApp'
					className='mb-3 h-[180px] w-[230px]'
				/>

				<ActivityIndicator size='large' color='#baf561' className='mt-9' />
			</View>
		</ImageBackground>
	)
}
