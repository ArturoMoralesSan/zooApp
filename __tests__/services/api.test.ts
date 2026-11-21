import { describe, expect, test } from '@jest/globals'
import { http, HttpResponse } from 'msw'

import { api, isNetworkError, NetworkError } from '@/services/api'

import { API, server } from '../../test-utils/server'

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
