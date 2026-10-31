import { Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import BackButton from '@/components/ui/BackButton'

type TopBarProps = {
	onBack: () => void
	// Compact title, shown once the large title has scrolled away.
	title?: string
	showTitle?: boolean
	// Content is under the bar: Borde de card bottom edge (and, over a
	// photo, the white fill).
	scrolled?: boolean
	// Floats over a hero photo: transparent until `scrolled`.
	overlay?: boolean
}

// Fixed 56px bar with the 40 × 40 back button (iOS large-title / Material
// top app bar pattern): the screen's large title scrolls with the content
// and a compact one appears here when it is gone.
export function TopBar({
	onBack,
	title,
	showTitle = false,
	scrolled = false,
	overlay = false,
}: TopBarProps) {
	const insets = useSafeAreaInsets()
	const solid = !overlay || scrolled

	return (
		<View
			className={`flex-row items-center gap-3 border-b-1.5 px-5 py-2 ${solid ? 'bg-screen' : 'bg-transparent'} ${scrolled ? 'border-b-card-border' : 'border-b-transparent'} ${overlay ? 'absolute left-0 right-0 top-0 z-10' : ''}`}
			style={overlay ? { paddingTop: insets.top + 8 } : undefined}
		>
			<BackButton
				onPress={onBack}
				position='relative'
				variant={overlay ? 'outline' : 'soft'}
			/>

			{title && showTitle && (
				<Text className='text-h3 min-w-0 flex-1 text-tinta' numberOfLines={1}>
					{title}
				</Text>
			)}
		</View>
	)
}
