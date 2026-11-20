import {
	afterEach,
	beforeEach,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals'
import { screen } from '@testing-library/react-native'
import { http, HttpResponse } from 'msw'
import { AccessibilityInfo } from 'react-native'

import { PointsEarnedCard } from '@/components/points/PointsEarnedCard'
import type { PointsAwardSeason } from '@/types/points'
import type { UserGamification } from '@/types/user'

import { makePointsAward, makeUser } from '../../test-utils/factories'
import { renderWithProviders } from '../../test-utils/render'
import { API, server } from '../../test-utils/server'

const season = (
	overrides: Partial<PointsAwardSeason> = {},
): PointsAwardSeason => ({
	title: 'Fin de semana doble',
	message: 'Comprar boletos da el doble de puntos.',
	base_points: 10,
	icon: 'pumpkin',
	color: null,
	...overrides,
})

// The profile the success screen revalidates after the action.
function serveProfile(gamification: UserGamification) {
	server.use(
		http.get(`${API}/profile`, () =>
			HttpResponse.json({
				success: true,
				user: makeUser({ points: gamification.points ?? 0, gamification }),
			}),
		),
	)
}

const plata: UserGamification = {
	points: 310,
	current_level: { id: 2, name: 'Plata' },
	next_level: { id: 3, name: 'Oro' },
	progress: 40,
	points_to_next_level: 190,
}

describe('PointsEarnedCard', () => {
	// The count-up keeps running after a test ends; these tests are about
	// what's shown, so they run with reduce motion on (final value at once).
	beforeEach(() => {
		jest
			.spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
			.mockResolvedValue(true)
	})

	afterEach(() => {
		jest.restoreAllMocks()
	})

	test('shows the points earned, the total and the way to the next level', async () => {
		serveProfile(plata)

		await renderWithProviders(
			<PointsEarnedCard
				points={makePointsAward({ awarded: 20, total: 310 })}
				subject='compra'
			/>,
		)

		expect(await screen.findByText('+20')).toBeTruthy()
		expect(screen.getByText('Total: 310 puntos · Nivel Plata')).toBeTruthy()
		expect(
			await screen.findByLabelText(
				'Ganaste 20 puntos. Total: 310 puntos. Te faltan 190 puntos para Oro.',
			),
		).toBeTruthy()
	})

	// Until the refreshed profile reports this action's total, its progress
	// is from before the purchase.
	test('hides the progress while the profile is still the old one', async () => {
		serveProfile({ ...plata, points: 290, points_to_next_level: 210 })

		await renderWithProviders(
			<PointsEarnedCard points={makePointsAward()} subject='compra' />,
		)

		expect(
			await screen.findByLabelText('Ganaste 10 puntos. Total: 310 puntos.'),
		).toBeTruthy()
		expect(screen.queryByText(/Te faltan/)).toBeNull()
	})

	test('announces a new level', async () => {
		serveProfile(plata)

		await renderWithProviders(
			<PointsEarnedCard
				points={makePointsAward({ level_up: true })}
				subject='compra'
			/>,
		)

		expect(await screen.findByText('¡Subiste a nivel Plata!')).toBeTruthy()
	})

	test('shows nothing at 0 points without a season, never "+0"', async () => {
		serveProfile(plata)

		await renderWithProviders(
			<PointsEarnedCard
				points={makePointsAward({ awarded: 0 })}
				subject='donación'
			/>,
		)

		expect(screen.queryByText('+0')).toBeNull()
		expect(screen.queryByText('Puntos ganados')).toBeNull()
	})

	test('explains a season that changed the points', async () => {
		serveProfile(plata)

		await renderWithProviders(
			<PointsEarnedCard
				points={makePointsAward({ awarded: 20, season: season() })}
				subject='compra'
			/>,
		)

		expect(
			await screen.findByText('Esta compra da 20 puntos en lugar de 10.'),
		).toBeTruthy()
		expect(
			screen.getByText('Comprar boletos da el doble de puntos.'),
		).toBeTruthy()
	})

	test('a season that turns the action off keeps only its notice', async () => {
		serveProfile(plata)

		await renderWithProviders(
			<PointsEarnedCard
				points={makePointsAward({
					awarded: 0,
					season: season({ base_points: 5 }),
				})}
				subject='donación'
			/>,
		)

		expect(
			await screen.findByText(
				'Esta temporada, esta donación no da puntos. Normalmente da 5.',
			),
		).toBeTruthy()
		expect(screen.queryByText('Puntos ganados')).toBeNull()
	})

	// Rule off or donation under the minimum: no base, so no comparison.
	test('does not blame the season for 0 points it did not cause', async () => {
		serveProfile(plata)

		await renderWithProviders(
			<PointsEarnedCard
				points={makePointsAward({
					awarded: 0,
					season: season({ base_points: null }),
				})}
				subject='donación'
			/>,
		)

		expect(await screen.findByText('Fin de semana doble')).toBeTruthy()
		expect(screen.queryByText(/en lugar de|no da puntos/)).toBeNull()
	})
})
