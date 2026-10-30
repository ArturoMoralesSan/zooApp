import { SectionTitle } from '@/components/ui/SectionTitle'
import { ListCard } from '@/components/ui/ListCard'
import type { SpeciesDetail } from '@/types/species'
import {
	Leaf01Icon,
	Location01Icon,
	Plant01Icon,
	Shield01Icon,
} from '@hugeicons/core-free-icons'
import { View } from 'react-native'

type SpeciesDataGridProps = {
	species: SpeciesDetail
}

export function SpeciesDataGrid({ species }: SpeciesDataGridProps) {
	return (
		<View className='mt-6'>
			<SectionTitle title='Datos de la especie' />

			<View className='flex-row flex-wrap justify-between'>
				{species.habitat && (
					<View className='mb-3 w-[48.5%]'>
						<ListCard
							className='grow'
							icon={Location01Icon}
							layout='tile'
							title='Hábitat'
							description={species.habitat}
							showChevron={false}
						/>
					</View>
				)}

				{species.origin && (
					<View className='mb-3 w-[48.5%]'>
						<ListCard
							className='grow'
							icon={Plant01Icon}
							layout='tile'
							title='Origen'
							description={species.origin}
							showChevron={false}
						/>
					</View>
				)}

				{species.diet && (
					<View className='mb-3 w-[48.5%]'>
						<ListCard
							className='grow'
							icon={Leaf01Icon}
							title='Alimentación'
							layout='tile'
							description={species.diet}
							showChevron={false}
						/>
					</View>
				)}

				{species.conservation_status && (
					<View className='mb-3 w-[48.5%]'>
						<ListCard
							className='grow'
							tone='hoja'
							icon={Shield01Icon}
							layout='tile'
							title='Conservación'
							description={species.conservation_status}
							showChevron={false}
						/>
					</View>
				)}
			</View>
		</View>
	)
}
