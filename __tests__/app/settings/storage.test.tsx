import { expect, jest, test } from '@jest/globals'
import { fireEvent, screen } from '@testing-library/react-native'

import StorageSettingsScreen from '@/app/settings/storage'

import { renderWithProviders } from '../../../test-utils/render'
import { routerSpies } from '../../../test-utils/router'

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

test('freeing temporary files empties them and says so', async () => {
	await renderWithProviders(<StorageSettingsScreen />)

	await fireEvent.press(screen.getByText('Liberar archivos temporales'))

	expect(await screen.findByText('Espacio liberado')).toBeTruthy()
	expect(
		screen.getByText('0 KB · se vuelven a crear al usar la app'),
	).toBeTruthy()
})

test('the ZooDeck pack row opens its own screen', async () => {
	await renderWithProviders(<StorageSettingsScreen />)

	await fireEvent.press(screen.getByLabelText(/^Paquete ZooDeck,/))

	expect(routerSpies.push).toHaveBeenCalledWith('/deck/offline')
})
