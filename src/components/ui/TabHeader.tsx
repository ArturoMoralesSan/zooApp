import { Coins01Icon, Crown02Icon } from '@hugeicons/core-free-icons'
import type { ReactNode } from 'react'
import { type LayoutChangeEvent, Text, View } from 'react-native'

import { Chip } from '@/components/ui/Chip'
import { useAuth } from '@/contexts/AuthContext'

type ScreenHeaderProps = {
	title: string
	subtitle?: string
	trailing?: ReactNode
	// Spacing to the content below; 32 (header → content) by default.
	className?: string
	// Lets the TopBar know when the large title has scrolled away.
	onLayout?: (event: LayoutChangeEvent) => void
}

// Large H1 plus subtitle (8 below), with optional content on the right.
// Scrolls with the content under a TopBar; tabs pin it (TabHeader).
export function ScreenHeader({
	title,
	subtitle,
	trailing,
	className = 'mb-8',
	onLayout,
}: ScreenHeaderProps) {
	return (
		<View className={className} onLayout={onLayout}>
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

type TabHeaderProps = Pick<ScreenHeaderProps, 'title' | 'subtitle'> & {
	// Content is under the header: Borde de card bottom edge.
	scrolled?: boolean
}

// Header of the tab screens: H1 plus the user's level and points pills.
export function TabHeader({ title, subtitle, scrolled }: TabHeaderProps) {
	const { user } = useAuth()

	const points = (user?.points ?? 0).toLocaleString('es-MX')
	const level = user?.level?.name ?? 'Bronce'

	return (
		// Pinned on tabs: it's short and keeps level and points in view.
		<View
			className={`border-b-1.5 bg-screen px-5 pb-4 pt-2 ${scrolled ? 'border-b-card-border' : 'border-b-transparent'}`}
		>
			<ScreenHeader
				title={title}
				subtitle={subtitle}
				className=''
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
		</View>
	)
}
