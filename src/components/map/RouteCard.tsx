import { Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SelectedItemThumb } from '@/components/map/SelectedItemThumb'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { Notice } from '@/components/ui/Notice'
import { StatCard } from '@/components/ui/StatCard'
import type { Coordinate, RouteResult, SelectableItem } from '@/types/map'
import { formatDistance, formatMinutes } from '@/utils/map'
import {
	ArrowDown01Icon,
	Location01Icon,
	WalkingIcon,
} from '@hugeicons/core-free-icons'

type RouteCardProps = {
	selectedItem: SelectableItem
	route: RouteResult | null
	userLocation: Coordinate | null
	isUserInsideZoo: boolean
	onCollapse: () => void
	onHowToGetThere: () => void
	onShowDestination: () => void
	// Species only: opens its detail ("Ver especie").
	onViewSpecies?: () => void
}

// Bottom sheet over the map (A-13..A-15): top radius 24, grab handle,
// padding 20, content above the navigation bar.
export function RouteCard({
	selectedItem,
	route,
	userLocation,
	isUserInsideZoo,
	onCollapse,
	onHowToGetThere,
	onShowDestination,
	onViewSpecies,
}: RouteCardProps) {
	const insets = useSafeAreaInsets()
	const canRoute = Boolean(userLocation) && isUserInsideZoo

	return (
		<View
			className='absolute bottom-0 left-0 right-0 rounded-t-3xl border-1.5 border-b-0 border-card-border bg-blanco px-5 pt-3'
			style={{ paddingBottom: insets.bottom + 20 }}
		>
			<View className='mb-4 h-1 w-10 self-center rounded-full bg-card-border' />

			<View className='flex-row items-center gap-3'>
				<SelectedItemThumb selectedItem={selectedItem} size={48} />

				<View className='min-w-0 flex-1'>
					<Text className='text-overline text-esmeralda'>
						{selectedItem.type === 'species' ? 'Especie' : 'Punto de interés'}
					</Text>

					<Text className='text-h3 mt-0.5 text-tinta' numberOfLines={1}>
						{selectedItem.name}
					</Text>
				</View>

				<IconButton
					icon={ArrowDown01Icon}
					onPress={onCollapse}
					accessibilityLabel='Minimizar'
				/>
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

			{route ? (
				<>
					<View className='mt-4 flex-row gap-3'>
						<StatCard
							layout='overline'
							label='Caminando'
							value={formatMinutes(route.distance / 80)}
						/>
						<StatCard
							layout='overline'
							label='Distancia'
							value={formatDistance(route.distance)}
						/>
					</View>

					<Button
						title='Ver destino'
						variant='secondary'
						icon={Location01Icon}
						iconPosition='leading'
						onPress={onShowDestination}
						className='mt-4'
					/>
				</>
			) : (
				<>
					{!userLocation ? (
						<Notice
							tone='warning'
							title='Sin acceso a tu ubicación'
							message='Activa la ubicación para calcular la ruta.'
							className='mt-4'
						/>
					) : !isUserInsideZoo ? (
						<Notice
							tone='warning'
							title='No podemos calcular la ruta'
							message='Debes estar dentro del zoológico para calcular una ruta por los caminos internos.'
							className='mt-4'
						/>
					) : (
						<Text className='text-meta mt-3'>
							Presiona “Cómo llegar” para calcular la ruta por los caminos del
							zoológico.
						</Text>
					)}

					<View className='mt-4 flex-row gap-3'>
						{onViewSpecies && (
							<View className='flex-1'>
								<Button
									title='Ver especie'
									variant='secondary'
									onPress={onViewSpecies}
								/>
							</View>
						)}

						<View className='flex-1'>
							<Button
								title='Cómo llegar'
								icon={WalkingIcon}
								iconPosition='leading'
								onPress={onHowToGetThere}
								disabled={!canRoute}
							/>
						</View>
					</View>
				</>
			)}
		</View>
	)
}
