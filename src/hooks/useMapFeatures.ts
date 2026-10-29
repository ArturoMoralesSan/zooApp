import { useMemo } from 'react'

import colors from '@/theme/colors'
import type { ImageCorners, SelectableItem, Zone } from '@/types/map'
import {
	isImageIcon,
	normalizeImageBounds,
	normalizeMapImageUrl,
	normalizeMarkerIconUrl,
	normalizePathGraph,
	normalizeSpeciesImageUrl,
	normalizeZoneGeometry,
	toNumber,
} from '@/utils/map'

// GeoJSON and selectable items derived from the zones the map renders.
export function useMapFeatures(zones: Zone[]) {
	const zonesGeoJson = useMemo(() => {
		const features = zones
			.map((zone) => {
				const geometry = normalizeZoneGeometry(zone.geometry)

				if (!geometry) {
					return null
				}

				return {
					type: 'Feature' as const,
					properties: {
						id: Number(zone.id),
						name: String(zone.name ?? ''),
					},
					geometry,
				}
			})
			.filter((item): item is NonNullable<typeof item> => item !== null)

		return {
			type: 'FeatureCollection',
			features,
		}
	}, [zones])

	const mapImages = useMemo(() => {
		return zones
			.filter((zone) => Boolean(zone.map_image))
			.map((zone) => {
				const geometry = normalizeZoneGeometry(zone.geometry)

				const url = normalizeMapImageUrl(zone.map_image)

				const coordinates = normalizeImageBounds(
					zone.map_image_bounds,
					geometry,
				)

				if (!url || !coordinates) {
					return null
				}

				return {
					id: Number(zone.id),
					name: String(zone.name ?? ''),
					url,
					coordinates,
				}
			})
			.filter(
				(
					item,
				): item is {
					id: number
					name: string
					url: string
					coordinates: ImageCorners
				} => item !== null,
			)
	}, [zones])

	const pathsGeoJson = useMemo(() => {
		const features: any[] = []

		zones.forEach((zone) => {
			;(zone.paths ?? []).forEach((path) => {
				const normalized = normalizePathGraph(path.coordinates)

				normalized.lines.forEach((line, lineIndex) => {
					if (line.length < 2) {
						return
					}

					features.push({
						type: 'Feature',
						properties: {
							id: `${path.id}-${lineIndex}`,
							path_id: Number(path.id),
							zone_id: Number(zone.id),
							name: String(path.name ?? ''),
						},
						geometry: {
							type: 'LineString',
							coordinates: line,
						},
					})
				})
			})
		})

		return {
			type: 'FeatureCollection',
			features,
		}
	}, [zones])

	const selectableItems = useMemo(() => {
		const items: SelectableItem[] = []

		zones.forEach((zone) => {
			;(zone.markers ?? []).forEach((marker) => {
				const longitude = toNumber(marker.longitude)

				const latitude = toNumber(marker.latitude)

				if (longitude === null || latitude === null) {
					return
				}

				const rawIcon = marker.icon?.trim() ?? null

				const iconIsImage = isImageIcon(rawIcon)

				const iconImage = iconIsImage ? normalizeMarkerIconUrl(rawIcon) : null

				items.push({
					id: `marker-${marker.id}`,
					name: String(marker.name ?? 'Punto'),
					type: 'marker',
					description: marker.description,
					coordinate: [longitude, latitude],
					color: marker.color ?? colors.esmeralda,
					icon: rawIcon ?? '📍',
					iconImage,
				})
			})

			;(zone.species_locations ?? []).forEach((speciesLocation) => {
				const longitude = toNumber(speciesLocation.longitude)

				const latitude = toNumber(speciesLocation.latitude)

				if (longitude === null || latitude === null) {
					return
				}

				const thumbnailImage =
					speciesLocation.species?.images?.find(
						(image) =>
							image.type === 'thumbnail' &&
							typeof image.path === 'string' &&
							image.path.trim() !== '',
					) ?? null

				const thumbnail = normalizeSpeciesImageUrl(thumbnailImage?.path)

				items.push({
					id: `species-${speciesLocation.id}`,
					name:
						speciesLocation.name ||
						speciesLocation.species?.common_name ||
						'Especie',
					type: 'species',
					description:
						speciesLocation.description ?? speciesLocation.species?.description,
					coordinate: [longitude, latitude],
					color: colors.esmeralda,
					icon: '🦁',
					thumbnail,
					species: speciesLocation.species,
				})
			})
		})

		return items
	}, [zones])

	return { zonesGeoJson, mapImages, pathsGeoJson, selectableItems }
}
