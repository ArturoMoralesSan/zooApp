import type { ReactNode } from 'react'
import { Text, View } from 'react-native'

type SectionTitleProps = {
	title: string
	subtitle?: string
	// Optional action on the right, e.g. a "Ver todo" link or a count.
	trailing?: ReactNode
	// Spacing around the title; 12px to the content below by default.
	className?: string
}

// H2 section heading (Barlow 700 · 18).
export function SectionTitle({
	title,
	subtitle,
	trailing,
	className = 'mb-3',
}: SectionTitleProps) {
	return (
		<View
			className={`flex-row items-center justify-between gap-3 ${className}`}
		>
			<View className='min-w-0 flex-1'>
				<Text className='text-h2 text-tinta' accessibilityRole='header'>
					{title}
				</Text>

				{subtitle && <Text className='text-subtitle mt-1'>{subtitle}</Text>}
			</View>

			{trailing}
		</View>
	)
}
