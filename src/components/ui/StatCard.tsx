import { IconBox } from '@/components/ui/IconBox'
import type { IconSvgElement } from '@hugeicons/react-native'
import { Text, View } from 'react-native'

type StatCardProps = {
	value: string | number
	label: string
	// row: IconBox beside value and label (tickets) · stack: centered value
	// over label (donations) · overline: label above a large value (profile).
	layout?: 'row' | 'stack' | 'overline'
	icon?: IconSvgElement
	// brand: Esmeralda tile for the headline stat.
	tone?: 'default' | 'brand'
	// Shrinks long values (amounts) to one line.
	fitValue?: boolean
	// Flex and spacing inside a stats row.
	className?: string
}

// Stat tile: a Card-styled box (Niebla, 1.5px border, radius 16).
export function StatCard({
	value,
	label,
	layout = 'row',
	icon,
	tone = 'default',
	fitValue = false,
	className = 'flex-1',
}: StatCardProps) {
	const brand = tone === 'brand'

	const valueText = (
		<Text
			className={`font-display-x ${layout === 'overline' ? 'mt-1 text-[28px]' : 'text-[20px]'} ${brand ? 'text-blanco' : 'text-tinta'} ${layout === 'stack' ? 'text-center' : ''}`}
			numberOfLines={1}
			adjustsFontSizeToFit={fitValue}
			minimumFontScale={0.7}
		>
			{value}
		</Text>
	)

	const labelText = (
		<Text
			className={`${layout === 'overline' ? 'text-overline' : 'text-meta mt-1'} ${brand ? 'text-hoja' : 'text-tinta-2'} ${layout === 'stack' ? 'text-center' : ''}`}
		>
			{label}
		</Text>
	)

	return (
		<View
			accessible
			accessibilityLabel={`${label}: ${value}`}
			className={`min-w-0 rounded-2xl border-1.5 p-4 ${brand ? 'border-bosque bg-esmeralda' : 'border-card-border bg-niebla'} ${layout === 'row' ? 'flex-row items-center gap-3' : layout === 'stack' ? 'items-center justify-center px-2' : ''} ${className}`}
		>
			{layout === 'row' && icon && <IconBox icon={icon} />}

			{layout === 'overline' ? (
				<>
					{labelText}
					{valueText}
				</>
			) : (
				<View className={layout === 'row' ? 'min-w-0 flex-1' : ''}>
					{valueText}
					{labelText}
				</View>
			)}
		</View>
	)
}
