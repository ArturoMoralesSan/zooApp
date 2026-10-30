import BackButton from '@/components/ui/BackButton'
import { type User } from '@/services/auth'
import colors from '@/theme/colors'
import { cardShadow } from '@/theme/shadows'
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

			<BackButton onPress={() => router.back()} opacity={backButtonOpacity} />

			<View className='absolute left-0 right-0 top-0 items-center pt-20'>
				<Pressable onPress={onPickAvatar} disabled={uploadingAvatar}>
					<Animated.View
						className='h-28 w-28 items-center justify-center overflow-hidden rounded-[56px] border-[5px] border-blanco bg-niebla'
						style={[
							cardShadow,
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
							<Text className='font-display-x text-[48px] text-esmeralda'>
								{user?.name?.charAt(0).toUpperCase() || '?'}
							</Text>
						)}

						{uploadingAvatar && (
							<View className='absolute inset-0 items-center justify-center bg-esmeralda/55'>
								<ActivityIndicator size='large' color={colors.blanco} />
							</View>
						)}
					</Animated.View>

					<View
						className='absolute -bottom-px -right-px h-[34px] w-[34px] items-center justify-center rounded-[17px] border-[3px] border-blanco bg-lima'
						style={cardShadow}
					>
						<Text className='font-sans-bold text-[20px] text-tinta'>+</Text>
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
