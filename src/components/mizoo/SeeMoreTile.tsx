import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { Pressable, Text } from 'react-native'

import { IconBox } from '@/components/ui/IconBox'

type SeeMoreTileProps = {
	// Species left out of the carousel.
	remaining: number
	onPress: () => void
}

// Last carousel tile: as tall as the species tiles (the row stretches it),
// opens the full species list.
export function SeeMoreTile({ remaining, onPress }: SeeMoreTileProps) {
	const label = `${remaining} ${remaining === 1 ? 'especie más' : 'especies más'}`

	return (
		<Pressable
			onPress={onPress}
			accessibilityRole='button'
			accessibilityLabel={`Ver más, ${label}`}
			className='w-[152px] items-center justify-center gap-2 rounded-2xl border-1.5 border-dashed border-card-border bg-niebla px-2 active:bg-hoja'
		>
			<IconBox icon={ArrowRight01Icon} tone='solid' />
			<Text className='text-h3 text-tinta'>Ver más</Text>
			<Text className='text-meta text-center'>{label}</Text>
		</Pressable>
	)
}
