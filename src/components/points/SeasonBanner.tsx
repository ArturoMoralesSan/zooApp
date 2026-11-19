import { ArrowRight01Icon, Cancel01Icon } from '@hugeicons/core-free-icons'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import {
	AccessibilityInfo,
	Animated,
	Pressable,
	Text,
	View,
} from 'react-native'

import { FocusRing, useFocusRing } from '@/components/ui/FocusRing'
import { Icon } from '@/components/ui/Icon'
import { usePointSeason } from '@/hooks/usePointSeason'
import { useSeasonDismissal } from '@/hooks/useSeasonDismissal'
import { seasonIcon, seasonTones, withAlpha } from '@/utils/pointSeason'

type SeasonBannerProps = {
	className?: string
}

// Notice of the active points season, in the colors the zoo picked (brand
// colors by default). List card anatomy: padding 16, radius 16, icon 40.
// Opens the detail screen; closing it hides it on every tab until the
// season's title changes. Renders nothing without a visible season.
export function SeasonBanner({ className = '' }: SeasonBannerProps) {
	const { data: season } = usePointSeason()
	const { dismissed, dismiss } = useSeasonDismissal(season?.title)
	const visible = Boolean(season) && !dismissed

	const { focused, focusProps } = useFocusRing()
	const close = useFocusRing()
	const [entrance] = useState(() => new Animated.Value(0))

	useEffect(() => {
		if (!visible) return

		let cancelled = false

		void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
			if (cancelled) return
			if (reduce) {
				entrance.setValue(1)
				return
			}

			Animated.timing(entrance, {
				toValue: 1,
				duration: 250,
				useNativeDriver: true,
			}).start()
		})

		return () => {
			cancelled = true
		}
	}, [visible, entrance])

	if (!season || !visible) return null

	const tones = seasonTones(season.color)

	return (
		<Animated.View
			className={className}
			style={{
				opacity: entrance,
				transform: [
					{
						translateY: entrance.interpolate({
							inputRange: [0, 1],
							outputRange: [8, 0],
						}),
					},
				],
			}}
		>
			<Pressable
				onPress={() => router.push('/points/season')}
				accessibilityRole='button'
				accessibilityLabel={`Temporada de puntos: ${season.title}. ${season.message ?? ''} Ver cambios`}
				{...focusProps}
				className={`flex-row items-start gap-3 rounded-2xl p-4 pr-14 active:opacity-90 ${focused ? 'border-2 border-bosque' : 'border-1.5'}`}
				style={{
					backgroundColor: tones.soft,
					borderColor: focused ? undefined : withAlpha(tones.accent, 0.35),
				}}
			>
				<View
					className='h-10 w-10 items-center justify-center rounded-xl'
					style={{ backgroundColor: tones.accent }}
				>
					<Icon icon={seasonIcon(season.icon)} color={tones.onAccent} />
				</View>

				<View style={{ flex: 1, minWidth: 0 }}>
					<Text className='text-overline' style={{ color: tones.text }}>
						Temporada de puntos
					</Text>
					<Text
						className='text-h3 mt-0.5'
						style={{ color: tones.text }}
						numberOfLines={2}
					>
						{season.title}
					</Text>
					{season.message && (
						<Text
							className='text-meta mt-1'
							style={{ color: tones.text }}
							numberOfLines={3}
						>
							{season.message}
						</Text>
					)}

					<View className='mt-3 flex-row items-center gap-1'>
						<Text
							className='font-sans-bold text-[14px]'
							style={{ color: tones.text }}
						>
							Ver cambios
						</Text>
						<Icon icon={ArrowRight01Icon} size={18} color={tones.text} strong />
					</View>
				</View>
			</Pressable>

			<FocusRing visible={focused} radiusClassName='rounded-[19px]' />

			{/* Sibling, not nested: an accessible card would swallow it. */}
			<View className='absolute right-2 top-2'>
				<Pressable
					onPress={dismiss}
					hitSlop={4}
					accessibilityRole='button'
					accessibilityLabel='Cerrar aviso de temporada'
					{...close.focusProps}
					className={`h-10 w-10 items-center justify-center rounded-xl active:opacity-70 ${close.focused ? 'border-2 border-bosque' : ''}`}
				>
					<Icon icon={Cancel01Icon} size={20} color={tones.text} strong />
				</Pressable>
				<FocusRing visible={close.focused} />
			</View>
		</Animated.View>
	)
}
