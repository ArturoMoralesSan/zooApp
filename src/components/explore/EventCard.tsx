import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { Image, Pressable, Text, View } from 'react-native'
import colors from '@/theme/colors'
import type { ExploreEvent } from '@/types/explore'
import { formatEventDate, formatEventTime } from '@/utils/format'
import { getEventImageUrl } from '@/utils/explore'

type EventCardProps = {
	event: ExploreEvent
	isLast: boolean
	onPress: () => void
}

export function EventCard({ event, isLast, onPress }: EventCardProps) {
	const imageUrl = getEventImageUrl(event.image)

	return (
		<View className={`w-[312px] ${isLast ? '' : 'mr-3'}`}>
			<View className='h-[240px] overflow-hidden rounded-2xl bg-bosque'>
				<Pressable className='flex-1 active:opacity-[0.92]' onPress={onPress}>
					<View className='flex-1'>
						{imageUrl ? (
							<Image
								source={{ uri: imageUrl }}
								className='absolute inset-0 h-full w-full'
								resizeMode='cover'
							/>
						) : (
							<View className='absolute inset-0 bg-tinta-2'>
								<View className='absolute left-0 right-0 top-0 h-[47%] bg-tinta-2' />
							</View>
						)}

						<View className='absolute bottom-0 left-0 right-0 h-[56%] bg-bosque' />

						<Badge
							label={(event.type || 'Educativo').toUpperCase()}
							tone='success'
							className='absolute left-3 top-3'
						/>

						<View className='absolute bottom-0 left-0 right-0 p-4'>
							<Text
								className='font-display text-[22px] leading-7 text-blanco'
								numberOfLines={1}
							>
								{event.name}
							</Text>

							{event.description ? (
								<Text className='text-body mt-1 text-hoja' numberOfLines={1}>
									{event.description}
								</Text>
							) : null}

							<View className='mt-3 flex-row items-center justify-between gap-3'>
								<View className='min-w-0 flex-1 flex-row items-center'>
									<Text
										className='font-sans-bold text-[13px] text-blanco'
										numberOfLines={1}
									>
										{formatEventDate(event.start_at)}
									</Text>

									<Text className='mx-2 font-sans-x text-lima'>•</Text>

									<Text className='font-sans-bold text-[13px] text-blanco'>
										{formatEventTime(event.start_at)}
									</Text>
								</View>

								<Pressable
									accessibilityRole='button'
									accessibilityLabel={`Ver evento ${event.name}`}
									onPress={onPress}
									className='h-10 w-10 items-center justify-center rounded-full bg-lima active:opacity-80'
								>
									<Icon
										icon={ArrowRight01Icon}
										size={22}
										color={colors.bosque}
										strong
									/>
								</Pressable>
							</View>
						</View>
					</View>
				</Pressable>
			</View>
		</View>
	)
}
