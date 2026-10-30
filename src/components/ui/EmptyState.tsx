import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { IconBox } from '@/components/ui/IconBox'
import type { IconSvgElement } from '@hugeicons/react-native'
import { Text, View } from 'react-native'

export type EmptyStateProps = {
	icon: IconSvgElement
	title: string
	message?: string
	// Optional next step, e.g. "Hacer una donación" (A-42).
	action?: {
		title: string
		onPress: () => void
		icon?: IconSvgElement
	}
	// Spacing around the state, never its look.
	className?: string
}

// Hoja icon box, title and text for a list with nothing to show.
export function EmptyState({
	icon,
	title,
	message,
	action,
	className = '',
}: EmptyStateProps) {
	return (
		<Card className={className}>
			<View className='items-center gap-2 px-2 py-4'>
				<IconBox icon={icon} size='lg' className='mb-2' />

				<Text className='text-h3 text-center text-tinta'>{title}</Text>

				{message && (
					<Text className='text-body text-center text-tinta-2'>{message}</Text>
				)}
			</View>

			{action && (
				<Button
					title={action.title}
					icon={action.icon}
					onPress={action.onPress}
					className='mt-2'
				/>
			)}
		</Card>
	)
}
