import { CubeIcon } from '@hugeicons/core-free-icons'
import { Text, View } from 'react-native'

import { CardStats } from '@/components/deck/CardStats'
import { CardThumbnail } from '@/components/deck/CardThumbnail'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import colors from '@/theme/colors'
import type { DeckCard } from '@/types/cards'
import { cardSubtitle } from '@/utils/cards'

type DeckCardTileProps = {
	card: DeckCard
	// Owned cards open the 3D view; unowned ones aren't pressable.
	onPress?: () => void
	className?: string
}

// Mi Deck grid tile (A-24/A-25): photo, name, rarity · category and stats.
// Unowned cards reveal nothing, so they get a dashed placeholder.
export function DeckCardTile({
	card,
	onPress,
	className = '',
}: DeckCardTileProps) {
	if (!card.encountered) {
		return (
			<View
				accessible
				accessibilityLabel='Tarjeta sin descubrir'
				className={`overflow-hidden rounded-2xl border-1.5 border-dashed border-card-border bg-blanco ${className}`}
			>
				<View className='aspect-[1.4] w-full items-center justify-center bg-niebla'>
					<Icon icon={CubeIcon} size={32} color={colors.apagado} />
				</View>

				<View className='p-3'>
					<Text className='font-sans-bold text-[14px] text-tinta'>???</Text>
					<Text className='text-meta mt-0.5'>Sin descubrir</Text>
					<CardStats className='mt-1.5' />
				</View>
			</View>
		)
	}

	return (
		<Card
			padding='none'
			onPress={onPress}
			accessibilityLabel={`${card.name}, ${cardSubtitle(card.rarity, card.category_name)}`}
			className={className}
		>
			<CardThumbnail card={card} className='aspect-[1.4] w-full' />

			<View className='p-3'>
				<Text
					className='font-sans-bold text-[14px] text-tinta'
					numberOfLines={1}
				>
					{card.name}
				</Text>
				<Text className='text-meta mt-0.5' numberOfLines={1}>
					{cardSubtitle(card.rarity, card.category_name)}
				</Text>
				<CardStats stats={card.stats} className='mt-1.5' />
			</View>
		</Card>
	)
}
