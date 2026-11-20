import { afterEach, describe, expect, jest, test } from '@jest/globals'
import * as SecureStore from 'expo-secure-store'
import { http, HttpResponse } from 'msw'

import { NetworkError } from '@/services/api'
import {
	getCellularUpdates,
	getPackManifest,
	setCellularUpdates,
} from '@/services/pack'

import { makeManifest, makePackFile } from '../../test-utils/factories'
import { API, server } from '../../test-utils/server'

// Only spies: restoring every mock would also drop the in-memory
// SecureStore's implementation.
afterEach(() => {
	jest.restoreAllMocks()
})

describe('getPackManifest', () => {
	const manifest = makeManifest([makePackFile()])

	test('returns the catalog and its ETag', async () => {
		server.use(
			http.get(`${API}/cards/pack`, () =>
				HttpResponse.json(
					{ success: true, data: manifest },
					{ headers: { ETag: '"m2"' } },
				),
			),
		)

		await expect(getPackManifest(null)).resolves.toEqual({
			etag: '"m2"',
			manifest,
		})
	})

	test('sends the stored ETag and returns null when unchanged (304)', async () => {
		let sent: string | null = null

		server.use(
			http.get(`${API}/cards/pack`, ({ request }) => {
				sent = request.headers.get('If-None-Match')

				return new HttpResponse(null, { status: 304 })
			}),
		)

		await expect(getPackManifest('"m1"')).resolves.toBeNull()
		expect(sent).toBe('"m1"')
	})

	// A hung connection (weak signal at the zoo) mustn't stall the sync. Fake
	// timers break MSW's abort handling, so only the 15 s timer is shortened.
	test('gives up after 15 s', async () => {
		const realSetTimeout = globalThis.setTimeout
		const setTimeoutSpy = jest
			.spyOn(globalThis, 'setTimeout')
			.mockImplementation(((
				callback: () => void,
				ms?: number,
			): ReturnType<typeof setTimeout> =>
				realSetTimeout(callback, ms === 15_000 ? 0 : ms)) as typeof setTimeout)

		server.use(
			http.get(`${API}/cards/pack`, () => new Promise<Response>(() => {})),
		)

		await expect(getPackManifest(null)).rejects.toBeInstanceOf(NetworkError)
		expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 15_000)
	})
})

describe('mobile data setting', () => {
	test('is off until the user turns it on', async () => {
		await expect(getCellularUpdates()).resolves.toBe(false)

		await setCellularUpdates(true)
		await expect(getCellularUpdates()).resolves.toBe(true)

		await setCellularUpdates(false)
		await expect(getCellularUpdates()).resolves.toBe(false)
	})

	test('reads as off when storage fails', async () => {
		jest
			.mocked(SecureStore.getItemAsync)
			.mockRejectedValueOnce(new Error('Keystore unavailable'))

		await expect(getCellularUpdates()).resolves.toBe(false)
	})
})
