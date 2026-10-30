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
					className={`h-2 rounded-full ${index === activeEventIndex ? 'w-6 bg-esmeralda' : 'w-2 bg-tinta-2'}`}
				/>
			))}
		</View>
	)
}
