import { describe, expect, test } from '@jest/globals'
import { renderHook, waitFor } from '@testing-library/react-native'
import { delay, http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'

import { useZooDeckMap } from '@/hooks/useZooDeckMap'
import { DataProvider } from '@/services/swr-config'
import type { Coordinate, ZooDeckMap } from '@/types/map'

import { API, server } from '../../test-utils/server'

type Props = {
	location: Coordinate | null
	options?: Parameters<typeof useZooDeckMap>[2]
}

function Providers({ children }: { children: ReactNode }) {
	return <DataProvider>{children}</DataProvider>
}

const mapFor = (zone: string): ZooDeckMap => ({
	visit: {
		enforced: true,
		ticket: true,
		inside_zoo: true,
		can_duel: true,
		reason: null,
	},
	zones: [{ id: 1, name: zone }],
})

// Answers each position with a zone named after its latitude, slowly enough
// to look at the state while a new position loads.
function serveMap(requests: string[]) {
	server.use(
		http.get(`${API}/map/species`, async ({ request }) => {
			const url = new URL(request.url)

			requests.push(`${url.pathname}${url.search}`)
			await delay(30)

			return HttpResponse.json({
				success: true,
				data: mapFor(url.searchParams.get('latitude') ?? 'zoo'),
			})
		}),
	)
}

const render = (initialProps: Props) =>
	renderHook(
		({ location, options }: Props) => useZooDeckMap(location, 9, options),
		{ initialProps, wrapper: Providers },
	)

const zoneName = (data: ZooDeckMap | undefined) => data?.zones[0]?.name

describe('useZooDeckMap', () => {
	test('waits for its first fix when disabled', async () => {
		const requests: string[] = []

		serveMap(requests)

		const { result } = await render({
			location: null,
			options: { enabled: false },
		})

		expect(result.current).toMatchObject({ data: undefined, isLoading: false })
		expect(requests).toEqual([])
	})

	test("keeps the last map while a new position loads, so it doesn't flash", async () => {
		const requests: string[] = []

		serveMap(requests)

		const { result, rerender } = await render({ location: [-104.58, 24.07] })

		await waitFor(() => expect(zoneName(result.current.data)).toBe('24.0700'))

		await rerender({ location: [-104.58, 24.08] })

		expect(zoneName(result.current.data)).toBe('24.0700')
		await waitFor(() => expect(zoneName(result.current.data)).toBe('24.0800'))
		expect(requests).toEqual([
			'/api/map/species?latitude=24.0700&longitude=-104.5800&accuracy=10',
			'/api/map/species?latitude=24.0800&longitude=-104.5800&accuracy=10',
		])
	})

	// A check that blocks a duel never answers with a previous position.
	test('exact drops the last map while the new raw position loads', async () => {
		const requests: string[] = []

		serveMap(requests)

		const { result, rerender } = await render({
			location: [-104.58, 24.07],
			options: { exact: true },
		})

		await waitFor(() => expect(zoneName(result.current.data)).toBe('24.07'))

		await rerender({ location: [-104.58, 24.08], options: { exact: true } })

		expect(result.current.data).toBeUndefined()
		await waitFor(() => expect(zoneName(result.current.data)).toBe('24.08'))
		expect(requests[1]).toBe(
			'/api/map/species?latitude=24.08&longitude=-104.58&accuracy=9',
		)
	})
})
