import { Coins01Icon, Crown02Icon } from '@hugeicons/core-free-icons'
import type { ReactNode } from 'react'
import { Text, View } from 'react-native'

import BackButton from '@/components/ui/BackButton'
import { Chip } from '@/components/ui/Chip'
import { useAuth } from '@/contexts/AuthContext'

type ScreenHeaderProps = {
	title: string
	subtitle?: string
	trailing?: ReactNode
	// Renders the 40 × 40 back button 16 above the title.
	onBack?: () => void
	// Spacing to the content below; 32 (header → content) by default.
	className?: string
}

// H1 plus subtitle, with optional back button above and content on the right.
export function ScreenHeader({
	title,
	subtitle,
	trailing,
	onBack,
	className = 'mb-8',
}: ScreenHeaderProps) {
	return (
		<View className={className}>
			{onBack && (
				<View className='mb-4'>
					<BackButton onPress={onBack} position='relative' />
				</View>
			)}

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

			{subtitle && <Text className='text-subtitle mt-2'>{subtitle}</Text>}
		</View>
	)
}

type TabHeaderProps = Pick<ScreenHeaderProps, 'title' | 'subtitle'>

// Header of the tab screens: H1 plus the user's level and points pills.
export function TabHeader({ title, subtitle }: TabHeaderProps) {
	const { user } = useAuth()

	const points = (user?.points ?? 0).toLocaleString('es-MX')
	const level = user?.level?.name ?? 'Bronce'

	return (
		<ScreenHeader
			title={title}
			subtitle={subtitle}
			className='mb-6'
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
