import { Chip } from '@/components/ui/Chip'
import { SectionTitle } from '@/components/ui/SectionTitle'
import type { SpeciesDetail } from '@/types/species'
import { View } from 'react-native'

type SpeciesTagsProps = {
	species: SpeciesDetail
}

export function SpeciesTags({ species }: SpeciesTagsProps) {
	return (
		<View className='mt-6'>
			<SectionTitle title='Etiquetas' />

			<View className='flex-row flex-wrap gap-2'>
				{species.tags.map((tag) => (
					<Chip key={tag.id} label={tag.name} look='hoja' />
				))}
			</View>
		</View>
	)
}
