import { ProfileForm } from '@/components/profile/ProfileForm'
import BackButton from '@/components/ui/BackButton'
import { QueryView } from '@/components/ui/QueryView'
import { useProfile } from '@/hooks/useProfile'
import { useSessionRedirect } from '@/hooks/useSessionRedirect'
import { router } from 'expo-router'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function ProfileScreen() {
	const profile = useProfile()
	const insets = useSafeAreaInsets()

	useSessionRedirect()

	return (
		<QueryView
			query={profile}
			loadingMessage='Cargando perfil…'
			errorTitle='No pudimos cargar tu perfil'
			// The states fill the screen; the form brings its own back button.
			wrapper={(state) => (
				<View className='flex-1 bg-blanco'>
					<BackButton top={insets.top + 8} onPress={() => router.back()} />

					<View className='flex-1 justify-center px-5'>{state}</View>
				</View>
			)}
		>
			{(user) => <ProfileForm key={user.id} initialUser={user} />}
		</QueryView>
	)
}
