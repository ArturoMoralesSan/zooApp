import { UserGroupIcon } from '@hugeicons/core-free-icons'
import { Image, Text, View } from 'react-native'

import { Card } from '@/components/ui/Card'
import { Chip } from '@/components/ui/Chip'
import { Icon } from '@/components/ui/Icon'
import colors from '@/theme/colors'
import type { Species } from '@/types/species'

type SpeciesTileProps = {
	species: Species
	onPress: () => void
}

// MiZoo carousel tile: a small version of the catalog's species card (light
// card, photo, name and a Hoja category chip), so it doesn't read as one of
// ZooDeck's dark collectible cards.
export function SpeciesTile({ species, onPress }: SpeciesTileProps) {
	const category = species.category?.name

	return (
		<Card
			padding='none'
			onPress={onPress}
			accessibilityLabel={
				category ? `${species.common_name}, ${category}` : species.common_name
			}
			className='w-[152px]'
		>
			{species.image ? (
				<Image
					source={{ uri: species.image }}
					resizeMode='cover'
					className='h-[120px] w-full'
				/>
			) : (
				<View className='h-[120px] w-full items-center justify-center bg-hoja'>
					<Icon icon={UserGroupIcon} size={32} color={colors.esmeralda} />
				</View>
			)}

			<View className='p-3'>
				<Text className='text-h3 text-tinta' numberOfLines={1}>
					{species.common_name}
				</Text>

				{category && (
					<Chip look='hoja' label={category} className='mt-2 self-start' />
				)}
			</View>
		</Card>
	)
}
