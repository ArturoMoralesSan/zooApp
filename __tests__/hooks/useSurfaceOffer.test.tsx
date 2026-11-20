import { afterEach, beforeEach, expect, jest, test } from '@jest/globals'
import { act, renderHook } from '@testing-library/react-native'

import { useSurfaceOffer } from '@/hooks/useSurfaceOffer'

beforeEach(() => {
	jest.useFakeTimers()
})

afterEach(() => {
	jest.useRealTimers()
})

// "¿No encuentras una superficie?": offered after 10 s of AR without a
// surface, and gone as soon as one shows up.
test('offers the 360° view after 10 s without a surface', async () => {
	const { result, rerender } = await renderHook(
		({ searching }: { searching: boolean }) => useSurfaceOffer(searching),
		{ initialProps: { searching: true } },
	)

	await act(async () => {
		jest.advanceTimersByTime(9999)
	})
	expect(result.current).toBe(false)

	await act(async () => {
		jest.advanceTimersByTime(1)
	})
	expect(result.current).toBe(true)

	await rerender({ searching: false })
	expect(result.current).toBe(false)
})

test('a surface found in time never shows the offer', async () => {
	const { result, rerender } = await renderHook(
		({ searching }: { searching: boolean }) => useSurfaceOffer(searching),
		{ initialProps: { searching: true } },
	)

	await act(async () => {
		jest.advanceTimersByTime(5000)
	})
	await rerender({ searching: false })
	await act(async () => {
		jest.advanceTimersByTime(10_000)
	})

	expect(result.current).toBe(false)
})
