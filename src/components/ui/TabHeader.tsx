import { Coins01Icon, Crown02Icon } from '@hugeicons/core-free-icons'
import type { ReactNode } from 'react'
import { Text, View } from 'react-native'

import BackButton from '@/components/ui/BackButton'
import { Chip } from '@/components/ui/Chip'
import { useAuth } from '@/contexts/AuthContext'

type ScreenHeaderProps = {
	// Optional on success screens, where the banner carries the title.
	title?: string
	subtitle?: string
	trailing?: ReactNode
	// Renders the 40 × 40 back button 16 above the title.
	onBack?: () => void
	// Shows the bottom border once the content scrolls under the bar.
	scrolled?: boolean
}

// Fixed top bar: back button, H1 and subtitle (8 below), with optional
// content on the right. It sits outside the scroll view; the content
// below starts with pt-4 so header → content stays 32 (pt-2 on tabs, 24).
export function ScreenHeader({
	title,
	subtitle,
	trailing,
	onBack,
	scrolled = false,
}: ScreenHeaderProps) {
	return (
		<View
			className={`border-b-1.5 bg-screen px-5 pb-4 pt-2 ${scrolled ? 'border-b-card-border' : 'border-b-transparent'}`}
		>
			{onBack && (
				<View className={title ? 'mb-4' : ''}>
					<BackButton onPress={onBack} position='relative' />
				</View>
			)}

			{title && (
				<View className='flex-row items-center justify-between gap-2'>
					<Text
						className='text-h1 min-w-0 flex-1'
						numberOfLines={1}
						accessibilityRole='header'
					>
						{title}
					</Text>

					{trailing}
				</View>
			)}

			{subtitle && <Text className='text-subtitle mt-2'>{subtitle}</Text>}
		</View>
	)
}

type TabHeaderProps = Pick<ScreenHeaderProps, 'subtitle' | 'scrolled'> & {
	title: string
}

// Header of the tab screens: H1 plus the user's level and points pills.
export function TabHeader({ title, subtitle, scrolled }: TabHeaderProps) {
	const { user } = useAuth()

	const points = (user?.points ?? 0).toLocaleString('es-MX')
	const level = user?.level?.name ?? 'Bronce'

	return (
		<ScreenHeader
			title={title}
			subtitle={subtitle}
			scrolled={scrolled}
			trailing={
				<View className='flex-row items-center gap-2'>
					<Chip
						look='soft'
						icon={Crown02Icon}
						label={level}
						accessibilityLabel={`Nivel ${level}`}
					/>
					<Chip
						look='soft'
						icon={Coins01Icon}
						label={`${points} pts`}
						accessibilityLabel={`${points} puntos`}
					/>
				</View>
			}
		/>
	)
}
