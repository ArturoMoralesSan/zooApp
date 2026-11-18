import { UserGroupIcon } from '@hugeicons/core-free-icons'
import { Image, Pressable, Text, View } from 'react-native'

import { Icon } from '@/components/ui/Icon'
import colors from '@/theme/colors'
import type { Species } from '@/types/species'

type SpeciesTileProps = {
	species: Species
	onPress: () => void
}

// MiZoo carousel tile: same look as the collection tile (photo over a
// Bosque label with the name and, in Lima, the category).
export function SpeciesTile({ species, onPress }: SpeciesTileProps) {
	const category = species.category?.name

	return (
		<Pressable
			onPress={onPress}
			accessibilityRole='button'
			accessibilityLabel={
				category ? `${species.common_name}, ${category}` : species.common_name
			}
			className='aspect-[0.75] w-[120px] overflow-hidden rounded-xl border-1.5 border-bosque bg-bosque active:opacity-80'
		>
			{species.image ? (
				<Image
					source={{ uri: species.image }}
					resizeMode='cover'
					className='w-full'
					style={{ flex: 1 }}
				/>
			) : (
				<View
					className='w-full items-center justify-center bg-hoja'
					style={{ flex: 1 }}
				>
					<Icon icon={UserGroupIcon} size={32} color={colors.esmeralda} />
				</View>
			)}

			<View className='px-2 py-1.5'>
				<Text
					className='font-sans-bold text-[12px] text-blanco'
					numberOfLines={1}
				>
					{species.common_name}
				</Text>
				<Text
					className='font-sans-semibold text-[12px] text-lima'
					numberOfLines={1}
				>
					{category ?? 'Especie'}
				</Text>
			</View>
		</Pressable>
	)
}
