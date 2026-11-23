import { expect, jest, test } from '@jest/globals'
import { fireEvent, screen } from '@testing-library/react-native'

import GraphicsSettingsScreen from '@/app/settings/graphics'

import { renderWithProviders } from '../../../test-utils/render'

jest.mock(
	'expo-router',
	() =>
		jest.requireActual<typeof import('../../../test-utils/router')>(
			'../../../test-utils/router',
		).expoRouterMock,
)
jest.mock(
	'react-native-safe-area-context',
	() =>
		jest.requireActual<{ default: object }>(
			'react-native-safe-area-context/jest/mock',
		).default,
)
// A phone with 8 GB: 'auto' means Alta.
jest.mock('expo-device', () => ({
	totalMemory: 8 * 1024 ** 3,
}))

const option = (label: string) =>
	screen.getByRole('radio', { name: new RegExp(`^${label}\\.`) })
const scenario = () =>
	screen.getByRole('switch', { name: 'Escenario de la sabana' })

test('a level fills the switches, and touching one makes it Personalizada', async () => {
	await renderWithProviders(<GraphicsSettingsScreen />)

	// Automática on this phone shows what Alta turns on.
	expect(option('Automática')).toBeChecked()
	expect(scenario()).toBeChecked()

	await fireEvent.press(option('Ahorro'))

	expect(option('Ahorro')).toBeChecked()
	expect(scenario()).not.toBeChecked()

	await fireEvent.press(scenario())

	expect(option('Personalizada')).toBeChecked()
	expect(scenario()).toBeChecked()

	// Back to a level and again to Personalizada: the user's mix is kept.
	await fireEvent.press(option('Alta'))
	await fireEvent.press(option('Personalizada'))

	expect(scenario()).toBeChecked()
	expect(
		screen.getAllByRole('switch', { name: 'Sombra en el suelo' })[0],
	).not.toBeChecked()
})

test('the level and the mix are saved and read back', async () => {
	const first = await renderWithProviders(<GraphicsSettingsScreen />)

	await fireEvent.press(await screen.findByRole('radio', { name: /^Ahorro\./ }))
	await fireEvent.press(scenario())
	await first.unmount()

	await renderWithProviders(<GraphicsSettingsScreen />)

	expect(
		await screen.findByRole('radio', { name: /^Personalizada\./ }),
	).toBeChecked()
	expect(scenario()).toBeChecked()
	expect(
		screen.getAllByRole('switch', { name: 'Sombra en el suelo' })[0],
	).not.toBeChecked()
})

test('without the savanna the 360° shadow is off and says why', async () => {
	await renderWithProviders(<GraphicsSettingsScreen />)

	await fireEvent.press(await screen.findByRole('radio', { name: /^Alta\./ }))
	await fireEvent.press(scenario())

	const shadow360 = screen.getAllByRole('switch', {
		name: 'Sombra en el suelo',
	})[1]

	expect(shadow360).toBeDisabled()
	expect(shadow360).not.toBeChecked()
	expect(screen.getByText('Necesita el escenario de la sabana.')).toBeTruthy()
})
