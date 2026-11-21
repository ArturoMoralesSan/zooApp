import { describe, expect, test } from '@jest/globals'
import { http, HttpResponse } from 'msw'

import { api, ApiError, isNetworkError, NetworkError } from '@/services/api'

import { API, server } from '../../test-utils/server'

const html = (status: number) =>
	new HttpResponse('<html><body>Bad Gateway</body></html>', {
		status,
		headers: { 'Content-Type': 'text/html' },
	})

describe('api responses', () => {
	test('a success with no body resolves to undefined', async () => {
		server.use(
			http.delete(
				`${API}/thing`,
				() => new HttpResponse(null, { status: 204 }),
			),
		)

		await expect(api('/thing', { method: 'DELETE' })).resolves.toBeUndefined()
	})

	test('an HTML error page is a server error with its status', async () => {
		server.use(http.get(`${API}/thing`, () => html(502)))

		const error = await api('/thing').catch((caught: unknown) => caught)

		expect(error).toBeInstanceOf(ApiError)
		expect((error as ApiError).status).toBe(502)
		expect(isNetworkError(error)).toBe(false)
	})

	test('an HTML page with a success status is a server error too', async () => {
		server.use(http.get(`${API}/thing`, () => html(200)))

		const error = await api('/thing').catch((caught: unknown) => caught)

		expect(error).toBeInstanceOf(ApiError)
		expect((error as ApiError).status).toBe(200)
	})
})

describe('isNetworkError', () => {
	test('a request that never reaches the server is a network error', async () => {
		server.use(http.get(`${API}/thing`, () => HttpResponse.error()))

		const error = await api('/thing').catch((caught: unknown) => caught)

		expect(error).toBeInstanceOf(NetworkError)
		expect(isNetworkError(error)).toBe(true)
	})

	test('a bug in the code is not a lost connection', () => {
		expect(isNetworkError(new TypeError("Cannot read 'outcome'"))).toBe(false)
	})
})
