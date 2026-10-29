import type { SpeciesDetail } from '@/types/species'
import { Text, View } from 'react-native'

type SpeciesTagsProps = {
	species: SpeciesDetail
}

export function SpeciesTags({ species }: SpeciesTagsProps) {
	return (
		<View className='mt-7'>
			<Text className='text-[21px] font-bold text-tinta'>Etiquetas</Text>

			<View className='mt-3.5 flex-row flex-wrap gap-2'>
				{species.tags.map((tag) => (
					<View
						key={tag.id}
						className='rounded-full border border-card-border bg-esmeralda px-3.5 py-2'
					>
						<Text className='text-xs font-semibold text-blanco'>
							{tag.name}
						</Text>
					</View>
				))}
			</View>
		</View>
	)
}
