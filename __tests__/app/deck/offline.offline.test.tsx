import { expect, jest, test } from '@jest/globals'
import { act, fireEvent, screen } from '@testing-library/react-native'
import * as SecureStore from 'expo-secure-store'
import { http, HttpResponse } from 'msw'

import OfflinePackScreen from '@/app/deck/offline'
import { subscribeOffline } from '@/services/offline-notice'
import { emptyPackIndex, writePackIndex } from '@/services/packStore'
import { loadState } from '@/services/packSync'

import { __setNetState, OFFLINE } from '../../../jest/mocks/netinfo'
import { makeManifest, makePackFile } from '../../../test-utils/factories'
import { seedPackUser } from '../../../test-utils/pack'
import { renderWithProviders } from '../../../test-utils/render'
import { API, server } from '../../../test-utils/server'

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

const SCREEN_MESSAGE = 'Conéctate a internet para revisar el paquete.'

// Offline the pack can't be checked. Without a stored catalog there's
// nothing to do, so the button is disabled; with one, it explains why
// through the app's offline banner (never a second notice in that spot).
test('offline, the check is disabled until a catalog is known, then explains why', async () => {
	await SecureStore.setItemAsync('zooapp_token', 'token-de-prueba')
	await seedPackUser(7)
	__setNetState(OFFLINE)

	const notices: (string | undefined)[] = []
	const packChecks: string[] = []

	subscribeOffline((message) => notices.push(message))
	server.use(
		http.get(`${API}/cards/pack`, ({ request }) => {
			packChecks.push(request.url)

			return HttpResponse.json({})
		}),
		http.get(`${API}/cards`, () => HttpResponse.error()),
	)

	await renderWithProviders(<OfflinePackScreen />)

	const check = () =>
		screen.getByRole('button', { name: 'Buscar actualizaciones' })

	expect(check()).toBeDisabled()

	// The catalog saved on a previous visit is read from the phone.
	writePackIndex({
		...emptyPackIndex(),
		manifest: makeManifest([makePackFile()]),
	})
	await act(() => loadState())

	const download = screen.getByRole('button', { name: 'Descargar todo' })

	expect(download).toBeEnabled()
	await fireEvent.press(download)

	expect(notices).toContain(SCREEN_MESSAGE)
	expect(packChecks).toEqual([])
})
