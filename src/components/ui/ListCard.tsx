import { Card, type CardTone } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { IconBox } from '@/components/ui/IconBox'
import colors from '@/theme/colors'
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react-native'
import type { ReactNode } from 'react'
import { Image, type ImageSourcePropType, Text, View } from 'react-native'

type ListCardProps = {
	title: string
	description?: string
	icon?: IconSvgElement
	// Round 40px photo in place of the icon box (user avatar).
	avatarUrl?: string | null
	// Full-width photo above the text (species).
	image?: ImageSourcePropType
	imageHeight?: number
	// row: icon, text and chevron in a line · tile: icon above the text.
	layout?: 'row' | 'tile'
	tone?: Exclude<CardTone, 'surface'>
	onPress?: () => void
	// Defaults to true for pressable rows.
	showChevron?: boolean
	children?: ReactNode
	className?: string
}

const tones = {
	default: {
		title: 'text-tinta',
		description: 'text-tinta-2',
		iconBox: 'soft',
		chevron: 'bg-esmeralda',
		chevronIcon: colors.blanco,
	},
	hoja: {
		title: 'text-tinta',
		description: 'text-tinta-2',
		iconBox: 'surface',
		chevron: 'bg-esmeralda',
		chevronIcon: colors.blanco,
	},
	dark: {
		title: 'text-blanco',
		description: 'text-hoja',
		iconBox: 'accent',
		chevron: 'bg-lima',
		chevronIcon: colors.bosque,
	},
} as const

// Padding 16, radius 16, 40px icon box and a 32px chevron.
export function ListCard({
	title,
	description,
	icon,
	avatarUrl,
	image,
	imageHeight = 150,
	layout = 'row',
	tone = 'default',
	onPress,
	showChevron = Boolean(onPress) && layout === 'row',
	children,
	className = '',
}: ListCardProps) {
	const style = tones[tone]

	const leading = avatarUrl ? (
		<Image
			source={{ uri: avatarUrl }}
			resizeMode='cover'
			className='h-10 w-10 rounded-full border-1.5 border-card-border bg-hoja'
		/>
	) : icon ? (
		<IconBox icon={icon} tone={style.iconBox} />
	) : null

	return (
		<Card
			tone={tone}
			padding='none'
			onPress={onPress}
			accessibilityLabel={description ? `${title}, ${description}` : title}
			className={className}
		>
			{image && (
				<Image
					source={image}
					resizeMode='cover'
					className='w-full'
					style={{ height: imageHeight }}
				/>
			)}

			<View
				className={`gap-3 p-4 ${layout === 'tile' ? 'flex-col items-start' : 'flex-row items-center'}`}
			>
				{leading}

				{/* Inline on purpose: NativeWind's flex-1 expands to grow/shrink/basis,
				    which collapses this block in the tile (column) layout. */}
				<View style={{ flex: layout === 'row' ? 1 : undefined, minWidth: 0 }}>
					<Text className={`text-h3 ${style.title}`}>{title}</Text>

					{description && (
						<Text className={`text-meta mt-1 ${style.description}`}>
							{description}
						</Text>
					)}
				</View>

				{showChevron && (
					<View
						className={`h-8 w-8 shrink-0 items-center justify-center rounded-full ${style.chevron}`}
					>
						<Icon
							icon={ArrowRight01Icon}
							size={20}
							color={style.chevronIcon}
							strong
						/>
					</View>
				)}
			</View>

			{children && <View className='px-4 pb-4'>{children}</View>}
		</Card>
	)
}
