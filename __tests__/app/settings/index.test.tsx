import { expect, jest, test } from '@jest/globals'
import { fireEvent, screen } from '@testing-library/react-native'
import * as SecureStore from 'expo-secure-store'

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
test('the placement choice is saved and read back next time', async () => {
	viroMock.isARSupportedOnDevice.mockResolvedValue({ isARSupported: true })

	const first = await renderWithProviders(<SettingsScreen />)

	// On a surface by default; automatic is marked experimental.
	await fireEvent.press(
		await screen.findByLabelText('Colocación del animal, En una superficie'),
	)
	expect(await screen.findByText('Experimental')).toBeTruthy()
	// The badge is read out with the option, not only shown.
	await fireEvent.press(screen.getByLabelText(/^Automática, Experimental\./))

	expect(
		await screen.findByLabelText(
			'Colocación del animal, Automática · Experimental',
		),
	).toBeTruthy()
	expect(await SecureStore.getItemAsync('zooapp_pref_ar_placement')).toBe(
		'auto',
	)
	await first.unmount()

	// The screen closed and opened again: the choice is still there.
	await renderWithProviders(<SettingsScreen />)

	expect(
		await screen.findByLabelText(
			'Colocación del animal, Automática · Experimental',
		),
	).toBeTruthy()
})
