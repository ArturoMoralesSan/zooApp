import {
	GeoJSONSource,
	ImageSource,
	Layer,
	RasterSource,
} from '@maplibre/maplibre-react-native'
import colors from '@/theme/colors'
import type { useMapFeatures } from '@/hooks/useMapFeatures'
import type { useRoute } from '@/hooks/useRoute'

type MapLayersProps = Pick<
	ReturnType<typeof useMapFeatures>,
	'mapImages' | 'zonesGeoJson' | 'pathsGeoJson'
> & {
	routeGeoJson: ReturnType<typeof useRoute>['routeGeoJson']
}

export function MapLayers({
	mapImages,
	zonesGeoJson,
	pathsGeoJson,
	routeGeoJson,
}: MapLayersProps) {
	return (
		<>
			<RasterSource
				id='osm-raster'
				tiles={['https://tile.openstreetmap.org/{z}/{x}/{y}.png']}
				tileSize={256}
				minzoom={0}
				maxzoom={19}
			>
				<Layer
					id='osm-raster-layer'
					type='raster'
					paint={{
						'raster-opacity': 1,
					}}
				/>
			</RasterSource>

			{mapImages.map((image) => (
				<ImageSource
					key={`zone-image-source-${image.id}`}
					id={`zone-image-source-${image.id}`}
					url={image.url}
					coordinates={image.coordinates}
				>
					<Layer
						id={`zone-image-layer-${image.id}`}
						type='raster'
						paint={{
							'raster-opacity': 1,
						}}
					/>
				</ImageSource>
			))}

			<GeoJSONSource id='zoo-zones-source' data={zonesGeoJson as any}>
				<Layer
					id='zoo-zones-fill'
					type='fill'
					source='zoo-zones-source'
					paint={{
						'fill-color': colors.esmeralda,
						'fill-opacity': 0.12,
					}}
				/>

				<Layer
					id='zoo-zones-outline'
					type='line'
					source='zoo-zones-source'
					paint={{
						'line-color': colors.esmeralda,
						'line-width': 2,
						'line-opacity': 0.7,
					}}
				/>
			</GeoJSONSource>

			<GeoJSONSource id='zoo-paths-source' data={pathsGeoJson as any}>
				<Layer
					id='zoo-paths-outline'
					type='line'
					source='zoo-paths-source'
					paint={{
						'line-color': colors.tinta,
						'line-width': 9,
						'line-opacity': 0.5,
					}}
					layout={{
						'line-cap': 'round',
						'line-join': 'round',
					}}
				/>

				<Layer
					id='zoo-paths-line'
					type='line'
					source='zoo-paths-source'
					paint={{
						'line-color': colors.blanco,
						'line-width': 6,
						'line-opacity': 1,
					}}
					layout={{
						'line-cap': 'round',
						'line-join': 'round',
					}}
				/>
			</GeoJSONSource>

			<GeoJSONSource id='zoo-route-source' data={routeGeoJson as any}>
				<Layer
					id='zoo-route-outline'
					type='line'
					source='zoo-route-source'
					filter={['==', ['get', 'type'], 'real-path']}
					paint={{
						'line-color': colors.blanco,
						'line-width': 12,
						'line-opacity': 0.95,
					}}
					layout={{
						'line-cap': 'round',
						'line-join': 'round',
					}}
				/>

				<Layer
					id='zoo-route-line'
					type='line'
					source='zoo-route-source'
					filter={['==', ['get', 'type'], 'real-path']}
					paint={{
						'line-color': colors.bosque,
						'line-width': 7,
						'line-opacity': 1,
					}}
					layout={{
						'line-cap': 'round',
						'line-join': 'round',
					}}
				/>

				<Layer
					id='zoo-route-connector'
					type='line'
					source='zoo-route-source'
					filter={['==', ['get', 'type'], 'connector']}
					paint={{
						'line-color': colors.bosque,
						'line-width': 5,
						'line-opacity': 0.9,
						'line-dasharray': [1.5, 2.5],
					}}
					layout={{
						'line-cap': 'round',
						'line-join': 'round',
					}}
				/>
			</GeoJSONSource>
		</>
	)
}
