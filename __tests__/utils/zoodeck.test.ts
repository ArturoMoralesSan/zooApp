import { describe, expect, test } from '@jest/globals'

import type { MapSpecies, Zone } from '@/types/map'
import { duelCardOf, duelStatus, zoneNamesByItem } from '@/utils/zoodeck'

import { makeZooDeckCard } from '../../test-utils/factories'

const species = (cards: MapSpecies['cards']): MapSpecies => ({
	id: 1,
	common_name: 'Lobo gris',
	cards,
})

describe('duelCardOf', () => {
	const owned = makeZooDeckCard({ id: 1, status: 'owned', can_duel: false })
	const locked = makeZooDeckCard({ id: 2, status: 'locked', can_duel: false })
	const available = makeZooDeckCard({ id: 3, can_duel: false })
	const playable = makeZooDeckCard({ id: 4, can_duel: true })

	test('prefers a card that can be played now', () => {
		expect(duelCardOf(species([owned, available, playable]))?.id).toBe(4)
	})

	test('then an available one, then the first', () => {
		expect(duelCardOf(species([owned, available]))?.id).toBe(3)
		expect(duelCardOf(species([locked, owned]))?.id).toBe(2)
	})

	test('nothing for a species without cards', () => {
		expect(duelCardOf(species([]))).toBeNull()
		expect(duelCardOf(species(undefined))).toBeNull()
		expect(duelCardOf(null)).toBeNull()
	})
})

describe('zoneNamesByItem', () => {
	test('maps each species location item to its zone name', () => {
		const location = (id: number) => ({
			id,
			species_id: 1,
			zone_id: 1,
			latitude: 0,
			longitude: 0,
		})
		const zones: Zone[] = [
			{
				id: 1,
				name: 'Bosque',
				species_locations: [location(10), location(11)],
			},
			{ id: 2, name: 'Sabana', species_locations: [location(20)] },
			{ id: 3, name: 'Acuario' },
		]

		expect(zoneNamesByItem(zones)).toEqual({
			'species-10': 'Bosque',
			'species-11': 'Bosque',
			'species-20': 'Sabana',
		})
	})
})

describe('duelStatus', () => {
	test('owned', () => {
		expect(duelStatus(makeZooDeckCard({ status: 'owned' }))).toEqual({
			label: 'En tu colección',
			tone: 'success',
			detail: null,
		})
	})

	test('available shows the attempts left', () => {
		expect(
			duelStatus(
				makeZooDeckCard({ attempts: { max: 3, left: 2, locked_until: null } }),
			),
		).toEqual({
			label: 'Disponible',
			tone: 'success',
			detail: '2 de 3 intentos',
		})
	})

	test('locked shows when it unlocks', () => {
		const status = duelStatus(
			makeZooDeckCard({
				status: 'locked',
				attempts: { max: 3, left: 0, locked_until: '2026-11-05T18:30:00Z' },
			}),
		)

		expect(status).toMatchObject({ label: 'Bloqueada', tone: 'pending' })
		expect(status.detail?.replace(/[\u00a0\u202f]/g, ' ')).toBe(
			'Disponible: 5 de noviembre, 12:30 p.m.',
		)
	})

	test('locked without an unlock time', () => {
		expect(
			duelStatus(
				makeZooDeckCard({
					status: 'locked',
					attempts: { max: 3, left: 0, locked_until: null },
				}),
			).detail,
		).toBe('Sin intentos por ahora')
	})
})
