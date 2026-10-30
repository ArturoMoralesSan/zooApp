import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { IconBox } from '@/components/ui/IconBox'
import { Alert02Icon, ReloadIcon } from '@hugeicons/core-free-icons'
import { Text, View } from 'react-native'

type ErrorStateProps = {
	title: string
	// Overrides the default message for the variant.
	message?: string
	// The request never reached the server: ask to check the connection.
	offline?: boolean
	onRetry?: () => void
	// Spacing around the state, never its look.
	className?: string
}

// Error-tinted icon box, title, message and an outlined "Reintentar".
export function ErrorState({
	title,
	message,
	offline = false,
	onRetry,
	className = '',
}: ErrorStateProps) {
	return (
		<Card className={className}>
			<View accessibilityRole='alert' className='items-center gap-2 px-2 pt-4'>
				<IconBox icon={Alert02Icon} size='lg' tone='danger' className='mb-2' />

				<Text className='text-h3 text-center text-tinta'>{title}</Text>

				<Text className='text-body text-center text-tinta-2'>
					{message ??
						(offline
							? 'Revisa tu conexión e inténtalo de nuevo.'
							: 'Algo salió mal de nuestro lado. Inténtalo de nuevo en unos minutos.')}
				</Text>
			</View>

			{onRetry && (
				<Button
					title='Reintentar'
					variant='secondary'
					icon={ReloadIcon}
					iconPosition='leading'
					onPress={onRetry}
					className='mt-4'
				/>
			)}
		</Card>
	)
}
