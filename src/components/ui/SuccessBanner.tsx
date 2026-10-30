import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import colors from '@/theme/colors'
import { Tick02Icon } from '@hugeicons/core-free-icons'
import { Text, View } from 'react-native'

type SuccessBannerProps = {
	title: string
	message: string
	className?: string
}

// Bosque card that confirms a completed purchase or donation.
export function SuccessBanner({
	title,
	message,
	className = 'mb-3',
}: SuccessBannerProps) {
	return (
		<Card tone='dark' className={`items-center px-5 py-6 ${className}`}>
			<View className='h-14 w-14 items-center justify-center rounded-full bg-lima'>
				<Icon icon={Tick02Icon} size={24} color={colors.bosque} strong />
			</View>

			<Text
				className='text-h1 mt-4 text-center text-blanco'
				accessibilityRole='header'
			>
				{title}
			</Text>

			<Text className='text-subtitle mt-2 text-center text-hoja'>
				{message}
			</Text>
		</Card>
	)
}
