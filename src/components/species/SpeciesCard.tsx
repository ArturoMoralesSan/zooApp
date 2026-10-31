import { ArrowRight01Icon, UserGroupIcon } from '@hugeicons/core-free-icons'
import { Image, Text, View } from 'react-native'

import { Card } from '@/components/ui/Card'
import { Chip } from '@/components/ui/Chip'
import { Icon } from '@/components/ui/Icon'
import colors from '@/theme/colors'
import type { Species } from '@/types/species'

type SpeciesCardProps = {
	species: Species
	onPress: () => void
	className?: string
}

// A-10 catalog card: photo (or a Hoja placeholder), name with the
// scientific name, category chip, description and "Ver información".
export function SpeciesCard({ species, onPress, className }: SpeciesCardProps) {
	return (
		<Card
			padding='none'
			onPress={onPress}
			accessibilityLabel={`${species.common_name}, ver información`}
			className={className}
		>
			{species.image ? (
				<Image
					source={{ uri: species.image }}
					resizeMode='cover'
					className='h-[165px] w-full'
				/>
			) : (
				<View className='h-[165px] w-full items-center justify-center bg-hoja'>
					<Icon icon={UserGroupIcon} size={40} color={colors.esmeralda} />
				</View>
			)}

			<View className='p-4'>
				<View className='flex-row items-center gap-3'>
					<View className='min-w-0 flex-1'>
						<Text className='text-h3 text-tinta' numberOfLines={1}>
							{species.common_name}
						</Text>

						{species.scientific_name && (
							<Text className='text-meta mt-1 italic' numberOfLines={1}>
								{species.scientific_name}
							</Text>
						)}
					</View>

					<View className='h-8 w-8 shrink-0 items-center justify-center rounded-full bg-esmeralda'>
						<Icon
							icon={ArrowRight01Icon}
							size={20}
							color={colors.blanco}
							strong
						/>
					</View>
				</View>

				{species.category?.name && (
					<Chip look='hoja' label={species.category.name} className='mt-3' />
				)}

				{species.description && (
					<Text className='text-body mt-3 text-tinta' numberOfLines={3}>
						{species.description}
					</Text>
				)}

				<Text className='mt-3 font-sans-bold text-[14px] text-esmeralda underline'>
					Ver información
				</Text>
			</View>
		</Card>
	)
}
