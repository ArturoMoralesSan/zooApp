import { Image } from 'expo-image'
import { Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import colors from '@/theme/colors'
import { getFloatingBottom } from '@/theme/layout'
import type { Coordinate, RouteResult, SelectableItem } from '@/types/map'
import { formatDistance, formatMinutes } from '@/utils/map'
import { mapShadow } from '@/components/map/mapShadow'

type RouteCardProps = {
	selectedItem: SelectableItem
	route: RouteResult | null
	userLocation: Coordinate | null
	isUserInsideZoo: boolean
	onCollapse: () => void
	onHowToGetThere: () => void
	onShowDestination: () => void
}

export function RouteCard({
	selectedItem,
	route,
	userLocation,
	isUserInsideZoo,
	onCollapse,
	onHowToGetThere,
	onShowDestination,
}: RouteCardProps) {
	const insets = useSafeAreaInsets()

	return (
		<View
			className='absolute left-3 right-3 rounded-[22px] bg-niebla p-4'
			style={[mapShadow, { bottom: getFloatingBottom(insets.bottom) }]}
		>
			<View className='flex-row items-center'>
				<View
					className='h-[42px] w-[42px] items-center justify-center overflow-hidden rounded-2xl bg-hoja'
					style={
						selectedItem.type === 'marker' && {
							backgroundColor: selectedItem.color ?? colors.hoja,
						}
					}
				>
					{selectedItem.type === 'species' && selectedItem.thumbnail ? (
						<Image
							source={{
								uri: selectedItem.thumbnail,
							}}
							style={{ width: 42, height: 42, borderRadius: 16 }}
							contentFit='cover'
							cachePolicy='memory-disk'
						/>
					) : selectedItem.type === 'marker' && selectedItem.iconImage ? (
						<Image
							source={{
								uri: selectedItem.iconImage,
							}}
							style={{ width: 34, height: 34, borderRadius: 12 }}
							contentFit='contain'
							cachePolicy='memory-disk'
						/>
					) : (
						<Text className='font-sans'>
							{selectedItem.type === 'species'
								? (selectedItem.icon ?? '🦁')
								: (selectedItem.icon ?? '📍')}
						</Text>
					)}
				</View>

				<View className='mx-2.5 min-w-0 flex-1'>
					<Text className='text-h3 text-tinta' numberOfLines={1}>
						{selectedItem.name}
					</Text>

					<Text className='text-meta mt-0.5'>
						{selectedItem.type === 'species' ? 'Especie' : 'Punto de interés'}
					</Text>
				</View>

				<Pressable
					onPress={onCollapse}
					className='h-[34px] w-[34px] items-center justify-center rounded-2xl bg-hoja active:opacity-70'
				>
					<Text className='font-sans text-[23px] leading-[25px] text-tinta'>
						×
					</Text>
				</Pressable>
			</View>

			{selectedItem.type === 'species' &&
				selectedItem.species?.scientific_name && (
					<Text className='text-meta mt-2 italic'>
						{selectedItem.species.scientific_name}
					</Text>
				)}

			{selectedItem.description && (
				<Text className='text-body mt-3 text-tinta-2' numberOfLines={3}>
					{selectedItem.description}
				</Text>
			)}

			<View className='mt-3.5 w-full'>
				<View
					className={`h-14 w-full overflow-hidden rounded-2xl border ${!userLocation || !isUserInsideZoo ? 'border-apagado bg-apagado' : 'border-bosque bg-esmeralda'}`}
					style={mapShadow}
				>
					<Pressable
						onPress={onHowToGetThere}
						disabled={!userLocation || !isUserInsideZoo}
						className='flex-1 items-center justify-center bg-transparent active:opacity-70'
					>
						<Text
							className='text-button m-0 p-0 text-center leading-[56px] text-blanco'
							style={{
								includeFontPadding: false,
								textAlignVertical: 'center',
							}}
						>
							Cómo llegar ➜
						</Text>
					</Pressable>
				</View>
			</View>

			{!isUserInsideZoo && userLocation && (
				<Text className='text-meta mt-2.5'>
					Debes estar dentro del zoológico para calcular una ruta por los
					caminos internos.
				</Text>
			)}

			{route && (
				<View className='mt-3.5 flex-row items-center justify-between gap-2.5 border-t border-t-card-border pt-[13px]'>
					<View className='min-w-0 flex-1'>
						<Text className='text-meta'>Ruta por caminos</Text>

						<Text className='mt-0.5 font-display-x text-[17px] text-bosque'>
							{formatDistance(route.distance)}
						</Text>
					</View>

					<View className='min-w-12 items-center'>
						<Text className='font-display-x text-[13px] text-tinta'>
							{formatMinutes(route.distance / 80)}
						</Text>

						<Text className='text-meta'>caminando</Text>
					</View>

					<Pressable
						className='rounded-2xl bg-bosque px-[15px] py-2.5 active:opacity-70'
						style={mapShadow}
						onPress={onShowDestination}
					>
						<Text className='font-display text-[13px] text-blanco'>
							Ver destino
						</Text>
					</Pressable>
				</View>
			)}

			{!route && userLocation && isUserInsideZoo && (
				<Text className='text-meta mt-2.5'>
					Presiona “Cómo llegar” para calcular la ruta por los caminos del
					zoológico.
				</Text>
			)}

			{!userLocation && (
				<Text className='text-meta mt-3'>
					No tenemos acceso a tu ubicación para calcular la ruta.
				</Text>
			)}
		</View>
	)
}
