import { Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SelectedItemThumb } from '@/components/map/SelectedItemThumb'
import { Icon } from '@/components/ui/Icon'
import colors from '@/theme/colors'
import { getFloatingBottom } from '@/theme/layout'
import type { RouteResult, SelectableItem } from '@/types/map'
import { formatDistance, formatMinutes } from '@/utils/map'
import { ArrowUp01Icon } from '@hugeicons/core-free-icons'

type CollapsedRouteCardProps = {
	selectedItem: SelectableItem
	route: RouteResult | null
	onExpand: () => void
}

// Minimised route card: one row that expands back into RouteCard.
export function CollapsedRouteCard({
	selectedItem,
	route,
	onExpand,
}: CollapsedRouteCardProps) {
	const insets = useSafeAreaInsets()

	return (
		<View
			className='absolute left-5 right-5'
			style={{ bottom: getFloatingBottom(insets.bottom) }}
		>
			<Pressable
				onPress={onExpand}
				accessibilityRole='button'
				accessibilityLabel={`${selectedItem.name}, mostrar ruta`}
				className='min-h-[72px] flex-row items-center gap-3 rounded-3xl border-1.5 border-card-border bg-blanco px-4 py-3 active:bg-niebla'
			>
				<SelectedItemThumb selectedItem={selectedItem} size={40} />

				<View className='min-w-0 flex-1'>
					<Text className='text-h3 text-tinta' numberOfLines={1}>
						{selectedItem.name}
					</Text>

					<Text className='text-meta mt-0.5' numberOfLines={1}>
						{route
							? `${formatDistance(route.distance)} · ${formatMinutes(route.distance / 80)} caminando`
							: 'Ruta por caminos'}
					</Text>
				</View>

				<View className='h-8 w-8 items-center justify-center rounded-full bg-esmeralda'>
					<Icon icon={ArrowUp01Icon} size={20} color={colors.blanco} strong />
				</View>
			</Pressable>
		</View>
	)
}
