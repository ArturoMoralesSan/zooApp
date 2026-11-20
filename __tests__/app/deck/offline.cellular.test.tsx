import { expect, jest, test } from '@jest/globals'
import { fireEvent, screen, waitFor } from '@testing-library/react-native'
import * as SecureStore from 'expo-secure-store'

import OfflinePackScreen from '@/app/deck/offline'
import { emptyPackIndex, writePackIndex } from '@/services/packStore'
import { loadState } from '@/services/packSync'

import { __setNetState, CELLULAR } from '../../../jest/mocks/netinfo'
import { makeManifest } from '../../../test-utils/factories'
import {
	makePackedCard,
	seedPackUser,
	servePack,
} from '../../../test-utils/pack'
import { renderWithProviders } from '../../../test-utils/render'
import { server } from '../../../test-utils/server'

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
jest.mock('react-native-keyboard-controller', () =>
	jest.requireActual('react-native-keyboard-controller/jest'),
)

// On mobile data with "Usar datos móviles" off, downloading the pack asks
// first, and only "Descargar con datos" spends data.
test('on mobile data the download asks before using data', async () => {
	await SecureStore.setItemAsync('zooapp_token', 'token-de-prueba')
	await seedPackUser(7)

	const card = await makePackedCard(1)
	const pack = servePack([card])

	writePackIndex({ ...emptyPackIndex(), manifest: makeManifest([card.file]) })
	server.use(...pack.handlers)
	__setNetState(CELLULAR)
	await loadState()

	await renderWithProviders(<OfflinePackScreen />)

	const download = () =>
		fireEvent.press(screen.getByRole('button', { name: 'Descargar todo' }))

	// "Esperar al Wi-Fi": nothing is downloaded.
	await download()
	await fireEvent.press(
		await screen.findByRole('button', { name: 'Esperar al Wi-Fi' }),
	)
	await waitFor(() =>
		expect(screen.queryByText('¿Usar datos móviles?')).toBeNull(),
	)
	expect(pack.downloaded).toEqual([])

	// "Descargar con datos": the user chose to spend data.
	await download()
	await fireEvent.press(
		await screen.findByRole('button', { name: 'Descargar con datos' }),
	)

	expect(await screen.findByText('Paquete listo')).toBeTruthy()
	expect(pack.downloaded).toEqual([card.file.url])
})
