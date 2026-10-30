import { Card } from '@/components/ui/Card'
import colors from '@/theme/colors'
import { ActivityIndicator, Text, View } from 'react-native'

// tiles: one tall block beside two short ones (Explore, A-43) · list: rows.
export type SkeletonLayout = 'tiles' | 'list'

type LoadingStateProps = {
	message?: string
	// Skeleton blocks under the card, only where the design shows them.
	layout?: SkeletonLayout
	// Spacing around the state, never its look.
	className?: string
}

function Skeleton({ className }: { className: string }) {
	return <View className={`rounded-2xl bg-niebla ${className}`} />
}

// Spinner and message inside a Card, with optional Niebla skeletons below.
export function LoadingState({
	message = 'Cargando…',
	layout,
	className = '',
}: LoadingStateProps) {
	return (
		<View className={className}>
			<Card>
				<View
					accessible
					accessibilityRole='progressbar'
					accessibilityLabel={message}
					accessibilityLiveRegion='polite'
					className='min-h-[190px] items-center justify-center gap-3'
				>
					<ActivityIndicator size='large' color={colors.esmeralda} />

					<Text className='text-body text-center text-tinta-2'>{message}</Text>
				</View>
			</Card>

			{layout === 'tiles' && (
				<View className='mt-6 flex-row gap-3'>
					<Skeleton className='h-[228px] flex-1' />

					<View className='flex-1 gap-3'>
						<Skeleton className='h-[108px]' />
						<Skeleton className='h-[108px]' />
					</View>
				</View>
			)}

			{layout === 'list' && (
				<View className='mt-3 gap-3'>
					<Skeleton className='h-20' />
					<Skeleton className='h-20' />
					<Skeleton className='h-20' />
				</View>
			)}
		</View>
	)
}
