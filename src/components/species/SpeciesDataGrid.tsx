import AppCard from '@/components/AppCard'
import colors from '@/theme/colors'
import type { SpeciesDetail } from '@/types/species'
import {
	Leaf01Icon,
	Location01Icon,
	Plant01Icon,
	Shield01Icon,
} from '@hugeicons/core-free-icons'
import { Text, View } from 'react-native'

type SpeciesDataGridProps = {
	species: SpeciesDetail
}

export function SpeciesDataGrid({ species }: SpeciesDataGridProps) {
	return (
		<View className='mt-7'>
			<Text className='text-[21px] font-bold text-tinta'>
				Datos de la especie
			</Text>

			<View className='mt-3.5 flex-row flex-wrap justify-between'>
				{species.habitat && (
					<View className='mb-3 w-[48.5%]'>
						<AppCard
							icon={Location01Icon}
							iconPosition='top'
							title='Hábitat'
							description={species.habitat}
							backgroundColor={colors.niebla}
							borderColor={colors.cardBorder}
							iconColor={colors.esmeralda}
							iconBackgroundColor={colors.hoja}
							textColor={colors.bosque}
							descriptionColor={colors.tinta}
							showArrow={false}
						/>
					</View>
				)}

				{species.origin && (
					<View className='mb-3 w-[48.5%]'>
						<AppCard
							icon={Plant01Icon}
							iconPosition='top'
							title='Origen'
							description={species.origin}
							backgroundColor={colors.niebla}
							borderColor={colors.cardBorder}
							iconColor={colors.esmeralda}
							iconBackgroundColor={colors.hoja}
							textColor={colors.bosque}
							descriptionColor={colors.tinta}
							showArrow={false}
						/>
					</View>
				)}

				{species.diet && (
					<View className='mb-3 w-[48.5%]'>
						<AppCard
							icon={Leaf01Icon}
							title='Alimentación'
							iconPosition='top'
							description={species.diet}
							backgroundColor={colors.niebla}
							borderColor={colors.cardBorder}
							iconColor={colors.esmeralda}
							iconBackgroundColor={colors.hoja}
							textColor={colors.bosque}
							descriptionColor={colors.tinta}
							showArrow={false}
						/>
					</View>
				)}

				{species.conservation_status && (
					<View className='mb-3 w-[48.5%]'>
						<AppCard
							icon={Shield01Icon}
							iconPosition='top'
							title='Conservación'
							description={species.conservation_status}
							backgroundColor={colors.hoja}
							borderColor={colors.cardBorder}
							iconColor={colors.esmeralda}
							iconBackgroundColor={colors.niebla}
							textColor={colors.bosque}
							descriptionColor={colors.tinta}
							showArrow={false}
						/>
					</View>
				)}
			</View>
		</View>
	)
}
