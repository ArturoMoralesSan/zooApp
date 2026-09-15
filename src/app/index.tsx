import { isAuthenticated } from '@/services/auth'
import { Redirect } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'

export default function Index() {
	const [loading, setLoading] = useState(true)
	const [authenticated, setAuthenticated] = useState(false)

	useEffect(() => {
		const checkSession = async () => {
			try {
				const result = await isAuthenticated()

				setAuthenticated(result)
			} finally {
				setLoading(false)
			}
		}

		checkSession()
	}, [])

	if (loading) {
		return (
			<View className='flex-1 items-center justify-center bg-gray-50'>
				<ActivityIndicator size='large' />
			</View>
		)
	}

	if (authenticated) {
		return <Redirect href='/(tabs)' />
	}

	return <Redirect href='/login' />
}
