import { Image, View } from 'react-native'

import { useCardAsset } from '@/hooks/useCardAsset'
import type { OwnedCard } from '@/types/cards'

type CardThumbnailProps = {
	card: OwnedCard
	className?: string
	// Fills a column whose height depends on its content (see ListCard).
	fill?: boolean
}

// An owned card's thumbnail from the offline pack when it's on the phone,
// its URL otherwise; a Hoja block when there's none.
export function CardThumbnail({
	card,
	className = '',
	fill = false,
}: CardThumbnailProps) {
	const { uri } = useCardAsset(
		card.id,
		'thumbnail',
		card.pack?.thumbnail,
		card.thumbnail_image,
	)

	const style = fill ? { flex: 1 } : undefined

	if (!uri) return <View className={`bg-hoja ${className}`} style={style} />

	return (
		<Image
			source={{ uri }}
			resizeMode='cover'
			accessibilityIgnoresInvertColors
			className={`bg-hoja ${className}`}
			style={style}
		/>
	)
}
