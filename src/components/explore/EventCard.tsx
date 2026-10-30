import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { Alert, Image, Pressable, Text, View } from 'react-native'
import colors from '@/theme/colors'
import type { ExploreEvent } from '@/types/explore'
import { formatEventDate, formatEventTime } from '@/utils/format'
import { getEventImageUrl } from '@/utils/explore'

type EventCardProps = {
	event: ExploreEvent
	isLast: boolean
}

export function EventCard({ event, isLast }: EventCardProps) {
	const imageUrl = getEventImageUrl(event.image)

	return (
		<View className={`w-[292px] ${isLast ? '' : 'mr-2.5'}`}>
			<View className='h-[203px] overflow-hidden rounded-3xl bg-bosque'>
				<Pressable
					className='flex-1 overflow-hidden rounded-[24px] active:opacity-[0.92]'
					onPress={() =>
						Alert.alert(
							event.name,
							event.description ||
								'Consulta próximamente todos los detalles de este evento.',
						)
					}
				>
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

						<View className='absolute bottom-0 left-0 right-0 h-[55%] bg-bosque opacity-[0.98]' />

						<View className='absolute left-2.5 top-2.5 rounded-[20px] bg-lima px-3 py-1'>
							<Text className='text-overline text-bosque'>
								{(event.type || 'Educativo').toUpperCase()}
							</Text>
						</View>

						<View className='absolute bottom-0 left-0 right-0 p-3.5'>
							<View className='flex-row items-end'>
								<View className='flex-1 pr-2'>
									<Text
										className='font-display text-[23px] leading-7 text-blanco'
										numberOfLines={1}
									>
										{event.name}
									</Text>

									{event.description ? (
										<Text
											className='text-meta mt-1 text-blanco'
											numberOfLines={1}
										>
											{event.description}
										</Text>
									) : null}
								</View>

								<Pressable
									accessibilityRole='button'
									accessibilityLabel={`Ver evento ${event.name}`}
									onPress={() =>
										Alert.alert(
											event.name,
											event.description ||
												'Consulta próximamente todos los detalles de este evento.',
										)
									}
									className='h-8 w-8 items-center justify-center rounded-full bg-lima'
								>
									<HugeiconsIcon
										icon={ArrowRight01Icon}
										size={22}
										strokeWidth={2}
										color={colors.bosque}
									/>
								</Pressable>
							</View>

							<View className='mt-2.5 flex-row items-center'>
								<Text
									className='font-sans-bold text-[12px] text-blanco'
									numberOfLines={1}
								>
									{formatEventDate(event.start_at)}
								</Text>

								<Text className='mx-2 font-sans-x text-lima'>•</Text>

								<Text className='font-sans-bold text-[12px] text-blanco'>
									{formatEventTime(event.start_at)}
								</Text>
							</View>
						</View>
					</View>
				</Pressable>
			</View>
		</View>
	)
}
