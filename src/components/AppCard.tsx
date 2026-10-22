import { colors } from '@/styles/panel'
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

	backgroundColor = colors.card,
	borderColor = colors.border,

	iconColor = colors.primary,
	iconBackgroundColor = colors.active,

	arrowColor = colors.white,
	arrowBackgroundColor = colors.primary,

	textColor = colors.text,
	descriptionColor = colors.textSecondary,

	imageHeight = 150,
	minHeight,
	style,
}: AppCardProps) {
	const pressedBackgroundColor = lightenColor(backgroundColor, 0.15)

	const iconElement = avatarUrl ? (
		<Image
			source={{ uri: avatarUrl }}
			resizeMode='cover'
			style={{
				width: 48,
				height: 48,
				borderRadius: 24,
				borderWidth: 1,
				borderColor,
				backgroundColor: iconBackgroundColor,
			}}
		/>
	) : icon ? (
		<View
			style={{
				width: 48,
				height: 48,
				borderRadius: 16,
				backgroundColor: iconBackgroundColor,
				borderWidth: 1,
				borderColor,
				alignItems: 'center',
				justifyContent: 'center',
			}}
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
		<View style={{ flex: 1, minWidth: 0 }}>
			{title ? (
				<Text
					style={{
						color: textColor,
						fontWeight: '800',
						fontSize: 16,
						flexShrink: 1,
					}}
				>
					{title}
				</Text>
			) : null}

			{description ? (
				<Text
					style={{
						marginTop: title ? 4 : 0,
						color: descriptionColor,
						fontSize: 12,
						lineHeight: 18,
						flexShrink: 1,
					}}
				>
					{description}
				</Text>
			) : null}
		</View>
	)

	const arrowElement = showArrow ? (
		<View
			style={{
				width: 32,
				height: 32,
				borderRadius: 16,
				backgroundColor: arrowBackgroundColor,
				alignItems: 'center',
				justifyContent: 'center',
				flexShrink: 0,
				marginLeft: 10,
			}}
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
			style={[
				{
					backgroundColor,
					borderColor,
					borderWidth: 1.5,
					borderRadius: 18,
					marginBottom: 12,
					overflow: 'hidden',
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
						style={{ width: '100%', height: imageHeight }}
					/>
				) : null}

				<View
					style={{
						flexDirection: iconPosition === 'top' ? 'column' : 'row',
						alignItems: iconPosition === 'top' ? 'stretch' : 'center',
						paddingHorizontal: 16,
						paddingVertical: 14,
						minHeight: 78,
					}}
				>
					{iconPosition === 'top' && iconElement ? (
						<View style={{ marginBottom: 12, alignSelf: 'flex-start' }}>
							{iconElement}
						</View>
					) : null}

					{iconPosition === 'left' && iconElement ? (
						<View style={{ marginRight: 14 }}>{iconElement}</View>
					) : null}

					{iconPosition === 'right' ? (
						<>
							{textElement}
							{iconElement ? (
								<View style={{ marginLeft: 14 }}>{iconElement}</View>
							) : null}
						</>
					) : (
						textElement
					)}

					{arrowElement}
				</View>

				{children ? (
					<View style={{ paddingHorizontal: 14, paddingBottom: 14 }}>
						{children}
					</View>
				) : null}
			</Pressable>
		</View>
	)
}
