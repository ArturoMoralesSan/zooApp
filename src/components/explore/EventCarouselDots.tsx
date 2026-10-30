import { View } from 'react-native'
import type { ExploreEvent } from '@/types/explore'

type EventCarouselDotsProps = {
	events: ExploreEvent[]
	activeEventIndex: number
}

export function EventCarouselDots({
	events,
	activeEventIndex,
}: EventCarouselDotsProps) {
	return (
		<View className='mt-3 flex-row items-center justify-center gap-1.5'>
			{events.map((event, index) => (
				<View
					key={event.id}
					className={`h-[7px] rounded-[10px] ${index === activeEventIndex ? 'w-[21px] bg-esmeralda' : 'w-[7px] bg-tinta-2 opacity-80'}`}
				/>
			))}
		</View>
	)
}
