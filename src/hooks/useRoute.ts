import { useMemo, useState } from 'react'

import type {
	Coordinate,
	GraphEdge,
	GraphNode,
	RouteResult,
	Zone,
} from '@/types/map'
import {
	findNearestPathPoint,
	haversineDistance,
	normalizePathGraph,
} from '@/utils/map'

export function useRoute(zones: Zone[]) {
	const navigationGraph = useMemo(() => {
		const nodes = new globalThis.Map<string, GraphNode>()

		const edges = new globalThis.Map<string, GraphEdge[]>()

		zones.forEach((zone) => {
			;(zone.paths ?? []).forEach((path) => {
				const graph = normalizePathGraph(path.coordinates)

				graph.nodes.forEach((node) => {
					const globalId = `${path.id}-${node.id}`

					nodes.set(globalId, {
						id: globalId,
						coordinate: node.coordinate,
					})

					if (!edges.has(globalId)) {
						edges.set(globalId, [])
					}
				})

				graph.edges.forEach((value, key) => {
					const globalKey = `${path.id}-${key}`

					if (!edges.has(globalKey)) {
						edges.set(globalKey, [])
					}

					value.forEach((edge) => {
						edges.get(globalKey)!.push({
							to: `${path.id}-${edge.to}`,
							distance: edge.distance,
						})
					})
				})
			})
		})

		const graphNodes = Array.from(nodes.values())

		for (let i = 0; i < graphNodes.length; i++) {
			for (let j = i + 1; j < graphNodes.length; j++) {
				const nodeA = graphNodes[i]

				const nodeB = graphNodes[j]

				const pathA = nodeA.id.split('-')[0]

				const pathB = nodeB.id.split('-')[0]

				if (pathA === pathB) {
					continue
				}

				const distance = haversineDistance(nodeA.coordinate, nodeB.coordinate)

				if (distance <= 3) {
					if (!edges.has(nodeA.id)) {
						edges.set(nodeA.id, [])
					}

					if (!edges.has(nodeB.id)) {
						edges.set(nodeB.id, [])
					}

					edges.get(nodeA.id)!.push({
						to: nodeB.id,
						distance,
					})

					edges.get(nodeB.id)!.push({
						to: nodeA.id,
						distance,
					})
				}
			}
		}

		return {
			nodes,
			edges,
		}
	}, [zones])

	const [route, setRoute] = useState<RouteResult | null>(null)

	const calculateRoute = (
		origin: Coordinate,
		destination: Coordinate,
	): RouteResult | null => {
		if (navigationGraph.nodes.size === 0) {
			return null
		}

		const nearestOrigin = findNearestPathPoint(origin, navigationGraph)

		const nearestDestination = findNearestPathPoint(
			destination,
			navigationGraph,
		)

		if (!nearestOrigin || !nearestDestination) {
			return null
		}

		const startId = nearestOrigin.nodeId

		const endId = nearestDestination.nodeId

		const distances = new globalThis.Map<string, number>()

		const previous = new globalThis.Map<string, string | null>()

		const unvisited = new Set<string>()

		navigationGraph.nodes.forEach((node) => {
			distances.set(node.id, Number.POSITIVE_INFINITY)

			previous.set(node.id, null)

			unvisited.add(node.id)
		})

		distances.set(startId, 0)

		while (unvisited.size > 0) {
			let currentId: string | null = null

			let currentDistance = Number.POSITIVE_INFINITY

			unvisited.forEach((id) => {
				const distance = distances.get(id) ?? Number.POSITIVE_INFINITY

				if (distance < currentDistance) {
					currentDistance = distance

					currentId = id
				}
			})

			if (currentId === null || currentDistance === Number.POSITIVE_INFINITY) {
				break
			}

			unvisited.delete(currentId)

			if (currentId === endId) {
				break
			}

			const neighbors = navigationGraph.edges.get(currentId) ?? []

			neighbors.forEach((edge) => {
				if (!unvisited.has(edge.to)) {
					return
				}

				const alternative = currentDistance + edge.distance

				const currentBest = distances.get(edge.to) ?? Number.POSITIVE_INFINITY

				if (alternative < currentBest) {
					distances.set(edge.to, alternative)

					previous.set(edge.to, currentId)
				}
			})
		}

		if (startId !== endId && !previous.get(endId)) {
			return null
		}

		const ids: string[] = []

		let current: string | null = endId

		while (current !== null) {
			ids.unshift(current)

			if (current === startId) {
				break
			}

			current = previous.get(current) ?? null
		}

		if (ids.length === 0 || ids[0] !== startId) {
			return null
		}

		const graphCoordinates = ids
			.map((id) => navigationGraph.nodes.get(id)?.coordinate)
			.filter(
				(coordinate): coordinate is Coordinate => coordinate !== undefined,
			)

		if (graphCoordinates.length < 1) {
			return null
		}

		const pathCoordinates: Coordinate[] = [
			nearestOrigin.point,
			...graphCoordinates,
		]

		const cleanedPathCoordinates = pathCoordinates.filter(
			(coordinate, index) => {
				if (index === 0) {
					return true
				}

				const previous = pathCoordinates[index - 1]

				return haversineDistance(previous, coordinate) > 0.05
			},
		)

		if (nearestDestination.distance > 0.5) {
			cleanedPathCoordinates.push(nearestDestination.point)
		}

		const connectors: Coordinate[][] = []

		if (nearestOrigin.distance > 0.5) {
			connectors.push([origin, nearestOrigin.point])
		}

		if (nearestDestination.distance > 0.5) {
			connectors.push([nearestDestination.point, destination])
		}

		const graphDistance = distances.get(endId) ?? 0

		const totalDistance =
			nearestOrigin.distance + graphDistance + nearestDestination.distance

		return {
			coordinates: [origin, ...cleanedPathCoordinates, destination],
			distance: totalDistance,
			pathCoordinates: cleanedPathCoordinates,
			connectors,
		}
	}

	const routeGeoJson = useMemo(() => {
		if (!route) {
			return {
				type: 'FeatureCollection',
				features: [],
			}
		}

		const features: any[] = []

		if (route.pathCoordinates.length >= 2) {
			features.push({
				type: 'Feature',
				properties: {
					type: 'real-path',
				},
				geometry: {
					type: 'LineString',
					coordinates: route.pathCoordinates,
				},
			})
		}

		route.connectors.forEach((connector, index) => {
			if (connector.length < 2) {
				return
			}

			features.push({
				type: 'Feature',
				properties: {
					type: 'connector',
					id: `connector-${index}`,
				},
				geometry: {
					type: 'LineString',
					coordinates: connector,
				},
			})
		})

		return {
			type: 'FeatureCollection',
			features,
		}
	}, [route])

	return { route, setRoute, calculateRoute, routeGeoJson }
}
