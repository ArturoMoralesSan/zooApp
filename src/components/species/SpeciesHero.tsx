import colors from '@/theme/colors'
import type { SpeciesDetail, SpeciesImage } from '@/types/species'
import { UserGroupIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { Image, Pressable, View } from 'react-native'

type SpeciesHeroProps = {
	heroImage: SpeciesImage | null
	species: SpeciesDetail
	onOpenImage: (image: SpeciesImage) => void
}

export function SpeciesHero({
	heroImage,
	species,
	onOpenImage,
}: SpeciesHeroProps) {
	return (
		<View className='h-[470px] w-full overflow-hidden bg-niebla'>
			{heroImage ? (
				<Pressable
					onPress={() => onOpenImage(heroImage)}
					className='h-full w-full'
				>
					<Image
						source={{ uri: heroImage.url }}
						className='h-full w-full'
						resizeMode='cover'
						accessibilityLabel={heroImage.alt_text || species.common_name}
					/>
				</Pressable>
			) : (
				<View className='h-full w-full items-center justify-center bg-niebla'>
					<HugeiconsIcon
						icon={UserGroupIcon}
						size={80}
						strokeWidth={1.8}
						color={colors.esmeralda}
					/>
				</View>
			)}

			<View
				className='absolute inset-0 bg-bosque/[0.08]'
				pointerEvents='none'
			/>
		</View>
	)
}
