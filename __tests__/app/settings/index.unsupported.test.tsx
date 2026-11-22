import { expect, jest, test } from '@jest/globals'
import { fireEvent, screen } from '@testing-library/react-native'

import SettingsScreen from '@/app/settings'

import { viroMock } from '../../../test-utils/ar'
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
jest.mock(
	'@reactvision/react-viro',
	() =>
		jest.requireActual<typeof import('../../../test-utils/ar')>(
			'../../../test-utils/ar',
		).viroMock,
)
jest.mock(
	'expo-camera',
	() =>
		jest.requireActual<typeof import('../../../test-utils/ar')>(
			'../../../test-utils/ar',
		).expoCameraMock,
)

// One scenario: useArAvailability keeps ARCore's answer in the module.
test('without ARCore placement is off, and a choice shows on its row', async () => {
	viroMock.isARSupportedOnDevice.mockRejectedValue(new Error('UNSUPPORTED'))

	await renderWithProviders(<SettingsScreen />)

	expect(
		await screen.findByText('Tu teléfono no es compatible con AR'),
	).toBeTruthy()
	expect(screen.getByText('No disponible en este teléfono')).toBeTruthy()

	await fireEvent.press(screen.getByLabelText('Calidad gráfica, Automática'))
	await fireEvent.press(await screen.findByText('Ahorro'))

	expect(await screen.findByLabelText('Calidad gráfica, Ahorro')).toBeTruthy()
})
