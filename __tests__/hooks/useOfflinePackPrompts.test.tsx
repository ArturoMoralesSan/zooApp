import { beforeAll, describe, expect, jest, test } from '@jest/globals'
import { act, renderHook, waitFor } from '@testing-library/react-native'
import * as SecureStore from 'expo-secure-store'

import { useOfflinePackPrompts } from '@/hooks/useOfflinePackPrompts'
import { emptyPackIndex, writePackIndex } from '@/services/packStore'
import * as packSync from '@/services/packSync'

import { __setNetState, CELLULAR, OFFLINE } from '../../jest/mocks/netinfo'
import { makeManifest, makePackFile } from '../../test-utils/factories'
import { seedPackUser } from '../../test-utils/pack'

jest.mock(
	'expo-router',
	() =>
		jest.requireActual<typeof import('../../test-utils/router')>(
			'../../test-utils/router',
		).expoRouterMock,
)

const INTRO = 'zooapp_hint_deck_offline_intro'
const MOBILE = 'zooapp_hint_deck_offline_mobile'

// Nothing shows until both hints are read, so a "nothing shows" check must
// wait for them or it would pass before the hook decided anything.
async function hintsRead() {
	await waitFor(() =>
		expect(SecureStore.getItemAsync).toHaveBeenCalledWith(MOBILE),
	)
	await act(async () => undefined)
}

// A catalog with files and nothing downloaded or asked for: the state in
// which ZooDeck offers the pack. packSync keeps it in the module, so it's
// loaded once for the file and none of these tests changes it.
beforeAll(async () => {
	await seedPackUser(7)
	writePackIndex({
		...emptyPackIndex(),
		manifest: makeManifest([makePackFile({ bytes: 1024 })]),
	})
	await packSync.loadState()
})

describe('ZooDeck offline pack prompts', () => {
	test('the intro shows on the first visit; any answer hides it for good', async () => {
		const { result } = await renderHook(() => useOfflinePackPrompts())

		await waitFor(() => expect(result.current.introVisible).toBe(true))
		expect(result.current.mobileNoticeVisible).toBe(false)

		await act(async () => result.current.later())

		expect(result.current.introVisible).toBe(false)
		await expect(SecureStore.getItemAsync(INTRO)).resolves.toBe('1')
	})

	test('after the intro, on mobile data, a notice suggests downloading at home once', async () => {
		await SecureStore.setItemAsync(INTRO, '1')
		__setNetState(CELLULAR)

		const { result } = await renderHook(() => useOfflinePackPrompts())

		await waitFor(() => expect(result.current.mobileNoticeVisible).toBe(true))
		expect(result.current.introVisible).toBe(false)
		await waitFor(() =>
			expect(SecureStore.getItemAsync(MOBILE)).resolves.toBe('1'),
		)
	})

	test('on Wi-Fi after the intro there is nothing to show', async () => {
		await SecureStore.setItemAsync(INTRO, '1')

		const { result } = await renderHook(() => useOfflinePackPrompts())

		await hintsRead()
		expect(result.current).toMatchObject({
			introVisible: false,
			mobileNoticeVisible: false,
		})
	})

	test('offline nothing is offered', async () => {
		__setNetState(OFFLINE)

		const { result } = await renderHook(() => useOfflinePackPrompts())

		await hintsRead()
		expect(result.current.introVisible).toBe(false)
	})

	test('"Descargar" hides the intro and starts the download the user asked for', async () => {
		const sync = jest
			.spyOn(packSync, 'syncPack')
			.mockResolvedValue({ kind: 'downloaded', count: 1, failed: 0 })
		const { result } = await renderHook(() => useOfflinePackPrompts())

		await waitFor(() => expect(result.current.introVisible).toBe(true))
		await act(async () => result.current.download())

		expect(result.current.introVisible).toBe(false)
		expect(sync).toHaveBeenCalledWith({ userTriggered: true })
		sync.mockRestore()
	})
})
