import { Card, type CardTone } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { IconBox, type IconBoxTone } from '@/components/ui/IconBox'
import colors from '@/theme/colors'
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react-native'
import type { ReactNode } from 'react'
import { Image, type ImageSourcePropType, Text, View } from 'react-native'

type ListCardProps = {
	title: string
	description?: string
	icon?: IconSvgElement
	// Overrides the tone's icon box, e.g. a solid icon on a hoja card.
	iconTone?: IconBoxTone
	// Round 56px photo in place of the icon box (user avatar).
	avatarUrl?: string | null
	// Shown in an Esmeralda circle when there is no avatar photo.
	avatarInitials?: string
	// Full-width photo above the text (species).
	image?: ImageSourcePropType
	imageHeight?: number
	// row: icon, text and chevron in a line · tile: icon above the text.
	layout?: 'row' | 'tile'
	tone?: Exclude<CardTone, 'surface'>
	onPress?: () => void
	// Defaults to true for pressable rows.
	showChevron?: boolean
	// Large faint icon behind the content, cut by the right edge (A-05 Entradas tile).
	watermark?: IconSvgElement
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
	iconTone,
	avatarUrl,
	avatarInitials,
	image,
	imageHeight = 150,
	layout = 'row',
	tone = 'default',
	onPress,
	showChevron = Boolean(onPress) && layout === 'row',
	watermark,
	children,
	className = '',
}: ListCardProps) {
	const style = tones[tone]

	const leading = avatarUrl ? (
		<Image
			source={{ uri: avatarUrl }}
			resizeMode='cover'
			className='h-14 w-14 rounded-full border-1.5 border-card-border bg-hoja'
		/>
	) : avatarInitials ? (
		<View className='h-14 w-14 items-center justify-center rounded-full bg-esmeralda'>
			<Text className='font-display text-[20px] text-blanco'>
				{avatarInitials}
			</Text>
		</View>
	) : icon ? (
		<IconBox icon={icon} tone={iconTone ?? style.iconBox} />
	) : null

	return (
		<Card
			tone={tone}
			padding='none'
			onPress={onPress}
			accessibilityLabel={description ? `${title}, ${description}` : title}
			className={className}
		>
			{watermark && (
				<View pointerEvents='none' className='absolute -right-4 top-[32%]'>
					<Icon icon={watermark} size={104} color={colors.hoja} />
				</View>
			)}

			{image && (
				<Image
					source={image}
					resizeMode='cover'
					className='w-full'
					style={{ height: imageHeight }}
				/>
			)}

			<View
				className={`gap-3 p-4 ${layout === 'tile' ? 'grow flex-col items-start justify-between' : 'flex-row items-center'}`}
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
