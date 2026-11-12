import { useState } from 'react'
import {
	Image,
	type LayoutChangeEvent,
	type NativeScrollEvent,
	type NativeSyntheticEvent,
	Pressable,
	View,
} from 'react-native'
import Animated, {
	Extrapolation,
	interpolate,
	type SharedValue,
	useAnimatedRef,
	useAnimatedScrollHandler,
	useAnimatedStyle,
	useSharedValue,
} from 'react-native-reanimated'

import { useCardFace } from '@/hooks/useCardAsset'
import type { OwnedCard } from '@/types/cards'

type CardCarouselProps = {
	cards: OwnedCard[]
	index: number
	onChange: (index: number) => void
}

// Real card proportions (5.72 × 10.16 cm, same as the card image).
const ITEM_WIDTH = 104
const ITEM_HEIGHT = Math.round(ITEM_WIDTH / 0.563)
// Distance between card centers: smaller than the width, so they overlap.
const STEP = 68

// Straight carousel of card images (A-26/A-27). The centered card is on top
// and full size; the others shrink and stack behind it the further they are.
// Plain views + Reanimated: no 3D, so it stays cheap next to the viewer.
export function CardCarousel({ cards, index, onChange }: CardCarouselProps) {
	const scrollRef = useAnimatedRef<Animated.ScrollView>()
	const scrollX = useSharedValue(index * STEP)
	const [width, setWidth] = useState(0)

	const onScroll = useAnimatedScrollHandler((event) => {
		scrollX.value = event.contentOffset.x
	})

	const settle = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
		const next = Math.round(event.nativeEvent.contentOffset.x / STEP)
		const clamped = Math.max(0, Math.min(cards.length - 1, next))

		if (clamped !== index) onChange(clamped)
	}

	const select = (next: number) => {
		scrollRef.current?.scrollTo({ x: next * STEP, animated: true })
		if (next !== index) onChange(next)
	}

	const sidePadding = Math.max(0, (width - ITEM_WIDTH) / 2)

	return (
		<View
			onLayout={(event: LayoutChangeEvent) =>
				setWidth(event.nativeEvent.layout.width)
			}
			style={{ height: ITEM_HEIGHT }}
		>
			{width > 0 && (
				<Animated.ScrollView
					ref={scrollRef}
					horizontal
					showsHorizontalScrollIndicator={false}
					snapToInterval={STEP}
					decelerationRate='fast'
					contentOffset={{ x: index * STEP, y: 0 }}
					onScroll={onScroll}
					scrollEventThrottle={16}
					onMomentumScrollEnd={settle}
					// Overlap and padding depend on the measured width.
					contentContainerStyle={{ paddingHorizontal: sidePadding }}
				>
					{cards.map((card, i) => (
						<CarouselItem
							key={card.id}
							card={card}
							position={i}
							total={cards.length}
							selected={i === index}
							scrollX={scrollX}
							onPress={() => select(i)}
						/>
					))}
				</Animated.ScrollView>
			)}
		</View>
	)
}

type CarouselItemProps = {
	card: OwnedCard
	position: number
	total: number
	selected: boolean
	scrollX: SharedValue<number>
	onPress: () => void
}

function CarouselItem({
	card,
	position,
	total,
	selected,
	scrollX,
	onPress,
}: CarouselItemProps) {
	const animatedStyle = useAnimatedStyle(() => {
		// 0 when centered, 1 per card of distance.
		const distance = Math.abs(scrollX.value / STEP - position)

		return {
			// Front cards cover the ones behind them.
			zIndex: 100 - Math.round(distance * 10),
			opacity: interpolate(
				distance,
				[0, 1, 3],
				[1, 0.9, 0.5],
				Extrapolation.CLAMP,
			),
			transform: [
				{
					scale: interpolate(
						distance,
						[0, 1, 2],
						[1, 0.86, 0.74],
						Extrapolation.CLAMP,
					),
				},
			],
		}
	})

	const { uri: image } = useCardFace(card)

	return (
		<Animated.View
			// Each card advances STEP, not its full width: the rest overlaps.
			style={[
				{
					width: ITEM_WIDTH,
					height: ITEM_HEIGHT,
					marginRight: position === total - 1 ? 0 : STEP - ITEM_WIDTH,
				},
				animatedStyle,
			]}
		>
			<Pressable
				onPress={onPress}
				accessibilityRole='button'
				accessibilityState={{ selected }}
				accessibilityLabel={`${card.name}, tarjeta ${position + 1} de ${total}`}
				className='h-full w-full'
			>
				{image ? (
					<Image
						source={{ uri: image }}
						resizeMode='cover'
						accessibilityIgnoresInvertColors
						className='h-full w-full rounded-xl bg-hoja'
					/>
				) : (
					<View className='h-full w-full rounded-xl bg-hoja' />
				)}
			</Pressable>
		</Animated.View>
	)
}
