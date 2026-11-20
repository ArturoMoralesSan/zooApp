import { expect, jest, test } from '@jest/globals'
import { act, waitFor } from '@testing-library/react-native'
import * as SecureStore from 'expo-secure-store'
import { AppState, type AppStateStatus } from 'react-native'

import { usePackSync } from '@/hooks/usePackSync'
import * as packSync from '@/services/packSync'

import { __setNetState, CELLULAR, OFFLINE } from '../../jest/mocks/netinfo'
import { makeUser } from '../../test-utils/factories'
import { makePackedCard, seedPackUser, servePack } from '../../test-utils/pack'
import { renderHookWithProviders } from '../../test-utils/render'
import { server } from '../../test-utils/server'
import { serveCurrentUser } from '../../test-utils/session'

const WIFI = {
	type: 'wifi',
	isConnected: true,
	isInternetReachable: true,
	details: { isConnectionExpensive: false },
}

// The React Native preset's AppState records listeners; deliver a change to
// all of them, as the real module does.
function changeAppState(state: AppStateStatus) {
	jest
		.mocked(AppState.addEventListener)
		.mock.calls.filter(([type]) => type === 'change')
		.forEach(([, listener]) => listener(state))
}

// One scenario: packSync keeps its state in the module.
test('keeps the pack in sync on sign-in, foreground and reconnection', async () => {
	const user = makeUser()
	const checks: string[] = []

	await SecureStore.setItemAsync('zooapp_token', 'token-de-prueba')
	await seedPackUser(user.id)
	server.use(
		serveCurrentUser(user),
		...servePack([await makePackedCard(1)]).handlers,
	)
	server.events.on('request:start', ({ request }) => {
		if (request.url.endsWith('/api/cards/pack')) checks.push(request.url)
	})

	const pause = jest.spyOn(packSync, 'pausePackSync')
	const idle = () => packSync.getPackStatus().activity === 'idle'

	await renderHookWithProviders(() => usePackSync(), { auth: true })

	// Signed in: the user's pack is checked right away.
	await waitFor(() => expect(checks).toHaveLength(1))
	await waitFor(() => expect(idle()).toBe(true))

	// To the background: the download in progress pauses.
	await act(async () => changeAppState('background'))
	expect(pause).toHaveBeenCalledTimes(1)

	// Back to the app: checked again.
	await act(async () => changeAppState('active'))
	await waitFor(() => expect(checks).toHaveLength(2))
	await waitFor(() => expect(idle()).toBe(true))

	// Connection lost, then back: pause, then check again.
	await act(async () => __setNetState(OFFLINE))
	expect(pause).toHaveBeenCalledTimes(2)
	await act(async () => __setNetState(WIFI))
	await waitFor(() => expect(checks).toHaveLength(3))
	await waitFor(() => expect(idle()).toBe(true))

	// Mobile data alone doesn't check; moving to Wi-Fi does.
	await act(async () => __setNetState(CELLULAR))
	expect(checks).toHaveLength(3)
	await act(async () => __setNetState(WIFI))
	await waitFor(() => expect(checks).toHaveLength(4))

	server.events.removeAllListeners()
})
