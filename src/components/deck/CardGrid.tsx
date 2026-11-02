import type { ReactNode } from 'react'
import { View } from 'react-native'

import type { DeckCard } from '@/types/cards'

type CardGridProps = {
	cards: DeckCard[]
	columns: number
	renderCard: (card: DeckCard) => ReactNode
	// Row and column gap (Tailwind class).
	gapClassName?: string
}

// Fixed-column grid; the last row keeps the same tile width.
export function CardGrid({
	cards,
	columns,
	renderCard,
	gapClassName = 'gap-3',
}: CardGridProps) {
	const rows: DeckCard[][] = []

	for (let i = 0; i < cards.length; i += columns) {
		rows.push(cards.slice(i, i + columns))
	}

	return (
		<View className={gapClassName}>
			{rows.map((row) => (
				<View key={row[0].id} className={`flex-row ${gapClassName}`}>
					{row.map((card) => (
						// Inline: NativeWind's flex-1 isn't RN's flex: 1 (see ListCard).
						<View key={card.id} style={{ flex: 1, minWidth: 0 }}>
							{renderCard(card)}
						</View>
					))}

					{Array.from({ length: columns - row.length }, (_, i) => (
						<View key={`empty-${i}`} style={{ flex: 1 }} />
					))}
				</View>
			))}
		</View>
	)
}
