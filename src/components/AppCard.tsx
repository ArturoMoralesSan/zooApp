import colors from '@/theme/colors'
import { ArrowRight01Icon, UserIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import type { ReactNode } from 'react'
import {
	Image,
	Pressable,
	Text,
	View,
	type ImageSourcePropType,
	type StyleProp,
	type ViewStyle,
} from 'react-native'

type IconPosition = 'left' | 'top' | 'right'

type AppCardProps = {
	onPress?: () => void
	icon?: typeof UserIcon
	iconPosition?: IconPosition
	image?: ImageSourcePropType
	avatarUrl?: string | null
	title?: string
	description?: string
	showArrow?: boolean
	children?: ReactNode

	backgroundColor?: string
	borderColor?: string

	iconColor?: string
	iconBackgroundColor?: string

	arrowColor?: string
	arrowBackgroundColor?: string

	textColor?: string
	descriptionColor?: string

	imageHeight?: number
	minHeight?: number
	style?: StyleProp<ViewStyle>
}

function lightenColor(color: string, amount = 0.15): string {
	const hex = color.trim().replace('#', '')

	if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(hex)) {
		return color
	}

	const fullHex =
		hex.length === 3
			? hex
					.split('')
					.map((char) => char + char)
					.join('')
			: hex

	const value = Number.parseInt(fullHex, 16)
	const red = (value >> 16) & 255
	const green = (value >> 8) & 255
	const blue = value & 255

	const lighten = (channel: number) =>
		Math.round(channel + (255 - channel) * amount)

	return `#${[red, green, blue]
		.map((channel) => lighten(channel).toString(16).padStart(2, '0'))
		.join('')}`
}

export default function AppCard({
	onPress,
	icon,
	iconPosition = 'left',
	image,
	avatarUrl,
	title,
	description,
	showArrow = true,
	children,

	backgroundColor = colors.niebla,
	borderColor = colors.cardBorder,

	iconColor = colors.esmeralda,
	iconBackgroundColor = colors.hoja,

	arrowColor = colors.blanco,
	arrowBackgroundColor = colors.esmeralda,

	textColor = colors.tinta,
	descriptionColor = colors.tinta,

	imageHeight = 150,
	minHeight,
	style,
}: AppCardProps) {
	const pressedBackgroundColor = lightenColor(backgroundColor, 0.15)

	const iconElement = avatarUrl ? (
		<Image
			source={{ uri: avatarUrl }}
			resizeMode='cover'
			className='h-12 w-12 rounded-3xl border'
			style={{ borderColor, backgroundColor: iconBackgroundColor }}
		/>
	) : icon ? (
		<View
			className='h-12 w-12 items-center justify-center rounded-2xl border'
			style={{ backgroundColor: iconBackgroundColor, borderColor }}
		>
			<HugeiconsIcon
				icon={icon}
				size={25}
				strokeWidth={1.8}
				color={iconColor}
			/>
		</View>
	) : null

	const textElement = (
		// Inline on purpose: NativeWind's flex-1 expands to grow/shrink/basis,
		// which collapses this block when iconPosition is 'top' (column layout).
		<View style={{ flex: 1, minWidth: 0 }}>
			{title ? (
				<Text
					className='shrink text-[16px] font-extrabold'
					style={{ color: textColor }}
				>
					{title}
				</Text>
			) : null}

			{description ? (
				<Text
					className={`shrink text-[12px] leading-[18px] ${title ? 'mt-1' : ''}`}
					style={{ color: descriptionColor }}
				>
					{description}
				</Text>
			) : null}
		</View>
	)

	const arrowElement = showArrow ? (
		<View
			className='ml-2.5 h-8 w-8 shrink-0 items-center justify-center rounded-2xl'
			style={{ backgroundColor: arrowBackgroundColor }}
		>
			<HugeiconsIcon
				icon={ArrowRight01Icon}
				size={20}
				strokeWidth={2}
				color={arrowColor}
			/>
		</View>
	) : null

	return (
		<View
			className='mb-3 overflow-hidden rounded-[18px] border-1.5'
			style={[
				{
					backgroundColor,
					borderColor,
					...(minHeight !== undefined ? { minHeight } : {}),
				},
				style,
			]}
		>
			<Pressable
				onPress={onPress}
				disabled={!onPress}
				android_ripple={
					onPress
						? { color: pressedBackgroundColor, borderless: false }
						: undefined
				}
				style={({ pressed }) => ({
					backgroundColor:
						pressed && onPress ? pressedBackgroundColor : backgroundColor,
				})}
			>
				{image ? (
					<Image
						source={image}
						resizeMode='cover'
						className='w-full'
						style={{ height: imageHeight }}
					/>
				) : null}

				<View
					className={`min-h-[78px] px-4 py-3.5 ${iconPosition === 'top' ? 'flex-col items-stretch' : 'flex-row items-center'}`}
				>
					{iconPosition === 'top' && iconElement ? (
						<View className='mb-3 self-start'>{iconElement}</View>
					) : null}

					{iconPosition === 'left' && iconElement ? (
						<View className='mr-3.5'>{iconElement}</View>
					) : null}

					{iconPosition === 'right' ? (
						<>
							{textElement}
							{iconElement ? (
								<View className='ml-3.5'>{iconElement}</View>
							) : null}
						</>
					) : (
						textElement
					)}

					{arrowElement}
				</View>

				{children ? <View className='px-3.5 pb-3.5'>{children}</View> : null}
			</Pressable>
		</View>
	)
}
