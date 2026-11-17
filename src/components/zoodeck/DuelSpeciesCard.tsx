import { Text, View } from 'react-native'

import { SelectedItemThumb } from '@/components/map/SelectedItemThumb'
import { Badge } from '@/components/ui/Badge'
import type { SelectableItem, ZooDeckCard } from '@/types/map'
import { rarityLabel } from '@/utils/cards'
import { formatDistance } from '@/utils/map'
import { duelStatus } from '@/utils/zoodeck'

type DuelSpeciesCardProps = {
	item: SelectableItem
	card: ZooDeckCard
	zoneName: string | null
	// Meters from the user, when there's a location.
	distance: number | null
}

// A-17 selected animal: photo, "Selva · a 120 m · Rara" and the card's
// state badge, with attempts or the unlock time under it.
export function DuelSpeciesCard({
	item,
	card,
	zoneName,
	distance,
}: DuelSpeciesCardProps) {
	const status = duelStatus(card)
	const meta = [
		zoneName,
		distance !== null ? `a ${formatDistance(distance)}` : null,
		rarityLabel(card.rarity),
	]
		.filter(Boolean)
		.join(' · ')

	return (
		<View className='flex-row items-center gap-3 rounded-2xl border-1.5 border-card-border bg-niebla p-4'>
			<SelectedItemThumb selectedItem={item} size={48} />

			<View className='min-w-0 flex-1'>
				<Text className='text-h3 text-tinta' numberOfLines={1}>
					{item.name}
				</Text>

				<Text className='text-meta mt-0.5'>{meta}</Text>

				{status.detail && (
					<Text className='text-meta mt-0.5'>{status.detail}</Text>
				)}
			</View>

			<Badge label={status.label} tone={status.tone} />
		</View>
	)
}
