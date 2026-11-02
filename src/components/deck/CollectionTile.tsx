import { SquareLock02Icon } from '@hugeicons/core-free-icons'
import { Image, Pressable, Text, View } from 'react-native'

import { Icon } from '@/components/ui/Icon'
import colors from '@/theme/colors'
import type { DeckCard } from '@/types/cards'
import { rarityLabel } from '@/utils/cards'

type CollectionTileProps = {
	card: DeckCard
	// Owned cards open the 3D view.
	onPress?: () => void
	className?: string
}

// Small "Mi colección" tile (A-06): photo with the name and rarity on a
// Bosque label; a dashed, locked placeholder for unowned cards.
export function CollectionTile({
	card,
	onPress,
	className = '',
}: CollectionTileProps) {
	if (!card.encountered) {
		return (
			<View
				accessible
				accessibilityLabel='Tarjeta sin descubrir'
				className={`aspect-[0.75] items-center justify-center gap-1 rounded-xl border-1.5 border-dashed border-card-border bg-niebla ${className}`}
			>
				<Icon icon={SquareLock02Icon} size={20} color={colors.apagado} />
				<Text className='text-meta text-apagado'>???</Text>
			</View>
		)
	}

	return (
		<Pressable
			onPress={onPress}
			disabled={!onPress}
			accessibilityRole='button'
			accessibilityLabel={`${card.name}, ${rarityLabel(card.rarity)}`}
			className={`aspect-[0.75] overflow-hidden rounded-xl border-1.5 border-bosque bg-bosque active:opacity-80 ${className}`}
		>
			{card.thumbnail_image ? (
				<Image
					source={{ uri: card.thumbnail_image }}
					resizeMode='cover'
					accessibilityIgnoresInvertColors
					className='w-full bg-hoja'
					style={{ flex: 1 }}
				/>
			) : (
				<View className='w-full bg-hoja' style={{ flex: 1 }} />
			)}

			<View className='px-2 py-1.5'>
				<Text
					className='font-sans-bold text-[12px] text-blanco'
					numberOfLines={1}
				>
					{card.name}
				</Text>
				<Text className='font-sans-semibold text-[12px] text-lima'>
					{rarityLabel(card.rarity)}
				</Text>
			</View>
		</Pressable>
	)
}
