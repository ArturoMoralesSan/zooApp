import { ProfileForm } from '@/components/profile/ProfileForm'
import { useProfile } from '@/hooks/useProfile'
import { useSessionRedirect } from '@/hooks/useSessionRedirect'
import colors from '@/theme/colors'
import { ActivityIndicator, ImageBackground, Text } from 'react-native'

export default function ProfileScreen() {
	const { data: user, error, isLoading } = useProfile()

	useSessionRedirect()

	if (isLoading) {
		return (
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				resizeMode='repeat'
				imageClassName='opacity-20'
				className='flex-1 items-center justify-center bg-blanco'
			>
				<ActivityIndicator size='large' color={colors.esmeralda} />
				<Text className='mt-4 text-[14px] font-medium text-tinta'>
					Cargando perfil...
				</Text>
			</ImageBackground>
		)
	}

	return (
		<ProfileForm
			key={user?.id ?? 'empty'}
			initialUser={user ?? null}
			loadError={error}
		/>
	)
}
