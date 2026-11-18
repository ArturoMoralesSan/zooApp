import { UserGroupIcon } from '@hugeicons/core-free-icons'
import { Image, Text, View } from 'react-native'

import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import colors from '@/theme/colors'
import type { Species } from '@/types/species'

type SpeciesTileProps = {
	species: Species
	onPress: () => void
}

// MiZoo carousel tile: a light card led by a tall photo, with a compact name
// and category, so it doesn't read as one of ZooDeck's dark collectible cards.
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
					className='h-[176px] w-full'
				/>
			) : (
				<View className='h-[176px] w-full items-center justify-center bg-hoja'>
					<Icon icon={UserGroupIcon} size={32} color={colors.esmeralda} />
				</View>
			)}

			<View className='px-3 py-2'>
				<Text
					className='font-sans-bold text-[14px] text-tinta'
					numberOfLines={1}
				>
					{species.common_name}
				</Text>

				{category && (
					<Text className='text-meta' numberOfLines={1}>
						{category}
					</Text>
				)}
			</View>
		</Card>
	)
}
