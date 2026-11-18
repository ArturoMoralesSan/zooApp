import { Coins02Icon } from '@hugeicons/core-free-icons'
import { Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import BackButton from '@/components/ui/BackButton'
import { Chip } from '@/components/ui/Chip'
import { useAuth } from '@/contexts/AuthContext'

type DuelMapHeaderProps = {
	onBack: () => void
}

// A-17 header over the map: back button, title pill and the user's points.
// Absolute children ignore the SafeAreaView's padding, so the top inset is
// added here (as in MapHeaderCard).
export function DuelMapHeader({ onBack }: DuelMapHeaderProps) {
	const insets = useSafeAreaInsets()
	const { user } = useAuth()
	const points = (user?.points ?? 0).toLocaleString('es-MX')

	return (
		<View
			className='absolute left-5 right-5 flex-row items-center gap-2'
			style={{ top: insets.top + 16 }}
		>
			<BackButton variant='outline' position='relative' onPress={onBack} />

			<View className='h-10 flex-1 justify-center rounded-xl border-1.5 border-card-border bg-blanco px-4'>
				<Text className='text-h3 text-tinta' numberOfLines={1}>
					Duelos
				</Text>
			</View>

			<Chip
				look='outline'
				icon={Coins02Icon}
				label={`${points} pts`}
				accessibilityLabel={`${points} puntos`}
			/>
		</View>
	)
}
