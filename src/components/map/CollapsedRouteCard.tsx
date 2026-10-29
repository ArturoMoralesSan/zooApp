import { ArrowUp01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { Image } from 'expo-image'
import { Pressable, Text, View } from 'react-native'
import colors from '@/theme/colors'
import type { RouteResult, SelectableItem } from '@/types/map'
import { formatDistance, formatMinutes } from '@/utils/map'
import { mapShadow } from '@/components/map/mapShadow'

type CollapsedRouteCardProps = {
	selectedItem: SelectableItem
	route: RouteResult | null
	onExpand: () => void
}

export function CollapsedRouteCard({
	selectedItem,
	route,
	onExpand,
}: CollapsedRouteCardProps) {
	return (
		<View
			className='absolute bottom-[15px] left-3 right-3 h-[72px] rounded-[20px] bg-niebla'
			style={mapShadow}
		>
			<Pressable
				onPress={onExpand}
				className='relative h-[72px] w-full justify-center rounded-[20px] bg-niebla px-3 active:opacity-70'
			>
				<View
					className='absolute left-3 top-[15px] h-[35px] w-[35px] items-center justify-center overflow-hidden rounded-[14px] bg-esmeralda'
					style={
						selectedItem.type === 'marker' && {
							backgroundColor: selectedItem.color ?? colors.esmeralda,
						}
					}
				>
					{selectedItem.type === 'species' && selectedItem.thumbnail ? (
						<Image
							source={{
								uri: selectedItem.thumbnail,
							}}
							style={{ width: 35, height: 35, borderRadius: 14 }}
							contentFit='cover'
							cachePolicy='memory-disk'
						/>
					) : selectedItem.type === 'marker' && selectedItem.iconImage ? (
						<Image
							source={{
								uri: selectedItem.iconImage,
							}}
							style={{ width: 30, height: 30, borderRadius: 12 }}
							contentFit='contain'
							cachePolicy='memory-disk'
						/>
					) : (
						<Text className='text-[18px]'>
							{selectedItem.type === 'species'
								? (selectedItem.icon ?? '🦁')
								: (selectedItem.icon ?? '📍')}
						</Text>
					)}
				</View>

				<View className='absolute left-[59px] right-[92px] top-3 h-12 justify-center'>
					<View className='w-full justify-center'>
						<Text
							className='text-[14px] font-extrabold leading-[18px] text-tinta'
							numberOfLines={1}
						>
							{selectedItem.name}
						</Text>

						<Text className='mt-0.5 text-[9px] leading-3 text-tinta-2'>
							Ruta por caminos
						</Text>
					</View>

					{route && (
						<View className='absolute -right-[30px] top-0 h-12 w-[125px] flex-row items-center justify-end'>
							<View className='w-[52px] items-center justify-center'>
								<Text className='text-center text-[14px] font-extrabold leading-[17px] text-bosque'>
									{formatDistance(route.distance)}
								</Text>

								<Text className='mt-px text-center text-[7px] leading-[9px] text-tinta-2'>
									distancia
								</Text>
							</View>

							<View className='mx-[5px] h-6 w-px bg-card-border' />

							<View className='w-[52px] items-center justify-center'>
								<Text className='text-center text-[13px] font-extrabold leading-4 text-tinta'>
									{formatMinutes(route.distance / 80)}
								</Text>

								<Text className='mt-px text-center text-[7px] leading-[9px] text-tinta-2'>
									caminando
								</Text>
							</View>
						</View>
					)}
				</View>

				<View className='absolute right-3 top-5 h-8 w-8 items-center justify-center rounded-2xl bg-hoja'>
					<HugeiconsIcon
						icon={ArrowUp01Icon}
						size={18}
						color={colors.esmeralda}
					/>
				</View>
			</Pressable>
		</View>
	)
}
