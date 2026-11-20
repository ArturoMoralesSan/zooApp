import {
	afterEach,
	beforeEach,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { AccessibilityInfo } from 'react-native'

import { OfflinePackCard } from '@/components/deck/OfflinePackCard'
import { DuelAnswer } from '@/components/duel/DuelAnswer'
import { DuelPoints } from '@/components/duel/DuelPoints'
import { VisitNotice } from '@/components/zoodeck/VisitNotice'
import type { PointsAward } from '@/types/points'
import type { VisitReason } from '@/types/map'

import { routerSpies } from '../../test-utils/router'

jest.mock(
	'expo-router',
	() =>
		jest.requireActual<typeof import('../../test-utils/router')>(
			'../../test-utils/router',
		).expoRouterMock,
)

const points = (overrides: Partial<PointsAward> = {}): PointsAward => ({
	awarded: 50,
	total: 1320,
	level: { id: 2, name: 'Plata' },
	level_up: false,
	...overrides,
})

describe('DuelPoints', () => {
	// The count-up animation keeps updating after a test ends; these tests
	// are about what's said, so they run with reduce motion on.
	beforeEach(() => {
		jest
			.spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
			.mockResolvedValue(true)
	})

	afterEach(() => {
		jest.restoreAllMocks()
	})

	// Read as one sentence, whatever the count-up animation shows.
	test('a screen reader hears the points, the total and a level up', async () => {
		await render(<DuelPoints points={points({ level_up: true })} />)

		expect(
			screen.getByLabelText(
				'Ganaste 50 puntos. Total: 1,320 puntos. Subiste a nivel Plata.',
			),
		).toBeTruthy()
	})

	test('with reduce motion the points and level show without counting', async () => {
		await render(<DuelPoints points={points({ level_up: true })} />)

		expect(await screen.findByText('+50')).toBeTruthy()
		expect(screen.getByText('¡Subiste a nivel Plata!')).toBeTruthy()
	})

	test('a card the season turns off still explains why there are no points', async () => {
		await render(
			<DuelPoints
				points={points({
					awarded: 0,
					season: {
						title: 'Fin de semana especial',
						message: null,
						base_points: 25,
						icon: null,
						color: null,
					},
				})}
			/>,
		)

		expect(screen.getByLabelText('Total: 1,320 puntos.')).toBeTruthy()
		expect(screen.queryByText('+0')).toBeNull()
		expect(
			screen.getByText(
				'Esta temporada, esta carta no da puntos. Normalmente da 25.',
			),
		).toBeTruthy()
	})

	test('fewer points during a season say how many it would give', async () => {
		await render(
			<DuelPoints
				points={points({
					awarded: 30,
					season: {
						title: 'Temporada difícil',
						message: 'Las capturas dan menos puntos.',
						base_points: 50,
						icon: null,
						color: null,
					},
				})}
			/>,
		)

		expect(
			screen.getByText('Esta carta da 30 puntos en lugar de 50.'),
		).toBeTruthy()
	})
})

describe('VisitNotice', () => {
	test.each<[VisitReason, string, string, keyof typeof actions]>([
		[
			'location_required',
			'Activa tu ubicación',
			'Permitir ubicación',
			'onAllowLocation',
		],
		[
			'outside_zoo',
			'Acércate al zoológico',
			'Reintentar ubicación',
			'onRetryLocation',
		],
		[
			'no_ticket',
			'Necesitas un boleto para hoy',
			'Comprar boleto',
			'onBuyTicket',
		],
	])('%s: "%s" with "%s"', async (reason, title, link, action) => {
		await render(<VisitNotice reason={reason} {...actions} />)

		expect(screen.getByText(title)).toBeTruthy()
		await fireEvent.press(screen.getByRole('link', { name: link }))
		expect(actions[action]).toHaveBeenCalledTimes(1)
		expect(screen.getAllByRole('link')).toHaveLength(1)
	})
})

const actions = {
	onAllowLocation: jest.fn(),
	onBuyTicket: jest.fn(),
	onRetryLocation: jest.fn(),
}

describe('OfflinePackCard', () => {
	test('shows the pack state and opens its screen', async () => {
		await render(<OfflinePackCard />)

		const card = screen.getByLabelText(
			'Paquete sin conexión, Conéctate para ver el paquete',
		)

		await fireEvent.press(card)
		expect(routerSpies.push).toHaveBeenCalledWith('/deck/offline')
	})
})

describe('DuelAnswer', () => {
	test('while answering it is a radio option', async () => {
		const onPress = jest.fn()

		await render(
			<DuelAnswer label='Carne' state='selected' onPress={onPress} />,
		)
		await fireEvent.press(
			screen.getByRole('radio', { name: 'Carne', checked: true }),
		)

		expect(onPress).toHaveBeenCalledTimes(1)
	})

	test('in the results it is read-only text with its result', async () => {
		await render(<DuelAnswer label='Pasto' state='incorrect' />)

		expect(screen.queryByRole('radio')).toBeNull()
		expect(screen.getByLabelText('Pasto, incorrecta')).toBeTruthy()
	})
})
