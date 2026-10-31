import BackButton from '@/components/ui/BackButton'
import { Icon } from '@/components/ui/Icon'
import { Add01Icon } from '@hugeicons/core-free-icons'
import { type User } from '@/services/auth'
import { getInitials } from '@/utils/profile'
import colors from '@/theme/colors'
import { router } from 'expo-router'
import {
	ActivityIndicator,
	Animated,
	Dimensions,
	Image,
	Pressable,
	Text,
	View,
} from 'react-native'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

type ProfileHeaderProps = {
	coverHeight: Animated.AnimatedInterpolation<number>
	backButtonOpacity: Animated.AnimatedInterpolation<number>
	avatarScale: Animated.AnimatedInterpolation<number>
	avatarTranslateY: Animated.AnimatedInterpolation<number>
	nameTranslateY: Animated.AnimatedInterpolation<number>
	emailOpacity: Animated.AnimatedInterpolation<number>
	avatarUrl: string | null
	user: User | null
	uploadingAvatar: boolean
	onPickAvatar: () => void
}

export function ProfileHeader({
	coverHeight,
	backButtonOpacity,
	avatarScale,
	avatarTranslateY,
	nameTranslateY,
	emailOpacity,
	avatarUrl,
	user,
	uploadingAvatar,
	onPickAvatar,
}: ProfileHeaderProps) {
	return (
		<View className='relative'>
			<Animated.Image
				source={require('@/assets/images/profile-background.png')}
				resizeMode='cover'
				style={{ width: SCREEN_WIDTH, height: coverHeight }}
			/>

			<BackButton
				variant='outline'
				onPress={() => router.back()}
				opacity={backButtonOpacity}
			/>

			<View className='absolute left-0 right-0 top-0 items-center pt-20'>
				<Pressable
					onPress={onPickAvatar}
					disabled={uploadingAvatar}
					accessibilityRole='button'
					accessibilityLabel='Cambiar foto de perfil'
				>
					<Animated.View
						className='h-[88px] w-[88px] items-center justify-center overflow-hidden rounded-full border-[3px] border-blanco bg-esmeralda'
						style={[
							{
								transform: [
									{ scale: avatarScale },
									{ translateY: avatarTranslateY },
								],
							},
						]}
					>
						{avatarUrl ? (
							<Image
								source={{ uri: avatarUrl }}
								className='h-full w-full'
								resizeMode='cover'
							/>
						) : (
							<Text className='font-display-x text-[32px] text-blanco'>
								{getInitials(user?.name)}
							</Text>
						)}

						{uploadingAvatar && (
							<View className='absolute inset-0 items-center justify-center bg-esmeralda/55'>
								<ActivityIndicator size='large' color={colors.blanco} />
							</View>
						)}
					</Animated.View>

					<View className='absolute -bottom-1 -right-1 h-8 w-8 items-center justify-center rounded-full border-2 border-blanco bg-lima'>
						<Icon icon={Add01Icon} size={20} color={colors.bosque} strong />
					</View>
				</Pressable>

				<Animated.Text
					className='text-h1 mt-5 text-blanco'
					style={{
						// eslint-disable-next-line no-restricted-syntax -- neutral text shadow over the cover photo
						textShadowColor: 'rgba(0,0,0,0.2)',
						textShadowOffset: { width: 0, height: 1 },
						textShadowRadius: 4,
						transform: [{ translateY: nameTranslateY }],
					}}
				>
					{user?.name || 'Visitante'}
				</Animated.Text>

				<Animated.Text
					className='text-subtitle mt-1 px-8 text-center text-blanco'
					style={{ opacity: emailOpacity }}
					numberOfLines={1}
				>
					{user?.email || ''}
				</Animated.Text>
			</View>
		</View>
	)
}
