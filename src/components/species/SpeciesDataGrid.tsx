import { Badge, type BadgeTone } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { IconBox } from '@/components/ui/IconBox'
import { SectionTitle } from '@/components/ui/SectionTitle'
import type { SpeciesDetail } from '@/types/species'
import {
	Location01Icon,
	NaturalFoodIcon,
	Shield01Icon,
	Tree01Icon,
} from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react-native'
import type { ReactNode } from 'react'
import { Text, View } from 'react-native'

type SpeciesDataGridProps = {
	species: SpeciesDetail
}

type DataTileProps = {
	icon: IconSvgElement
	label: string
	children: ReactNode
}

// A-11 tile: 32 icon tile, overline label and the value below.
function DataTile({ icon, label, children }: DataTileProps) {
	return (
		<View className='mb-3 w-[48.5%]'>
			<Card padding='none' className='grow p-3'>
				<IconBox icon={icon} size='sm' />

				<Text className='text-overline mt-3 text-tinta-2'>{label}</Text>

				<View className='mt-1'>{children}</View>
			</Card>
		</View>
	)
}

// Status tone, always with its text (never color alone).
function conservationTone(status: string): BadgeTone {
	if (/menor|least/i.test(status)) return 'success'
	if (/cr[ií]tic|extint|extinct/i.test(status)) return 'error'
	return 'pending'
}

function DataValue({ value }: { value: string }) {
	return <Text className='font-sans-bold text-[14px] text-tinta'>{value}</Text>
}

export function SpeciesDataGrid({ species }: SpeciesDataGridProps) {
	return (
		<View className='mt-6'>
			<SectionTitle title='Datos de la especie' />

			<View className='flex-row flex-wrap justify-between'>
				{species.habitat && (
					<DataTile icon={Tree01Icon} label='Hábitat'>
						<DataValue value={species.habitat} />
					</DataTile>
				)}

				{species.origin && (
					<DataTile icon={Location01Icon} label='Origen'>
						<DataValue value={species.origin} />
					</DataTile>
				)}

				{species.diet && (
					<DataTile icon={NaturalFoodIcon} label='Alimentación'>
						<DataValue value={species.diet} />
					</DataTile>
				)}

				{species.conservation_status && (
					<DataTile icon={Shield01Icon} label='Conservación'>
						<Badge
							dot
							label={species.conservation_status}
							tone={conservationTone(species.conservation_status)}
						/>
					</DataTile>
				)}
			</View>
		</View>
	)
}
