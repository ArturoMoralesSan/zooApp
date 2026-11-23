import {
	afterEach,
	beforeEach,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals'
import { act, renderHook } from '@testing-library/react-native'

import { useViroExit, useViroHandoff } from '@/hooks/useViroHandoff'

// Viro shares one native platform between views: mounting one while the
// previous is still being released crashes natively, and releasing one that
// is still loading leaves the next one black.
beforeEach(() => {
	jest.useFakeTimers()
})

afterEach(() => {
	jest.useRealTimers()
})

const advance = (ms: number) =>
	act(async () => {
		jest.advanceTimersByTime(ms)
	})

describe('useViroHandoff', () => {
	test('a new Viro view waits half a second before mounting', async () => {
		const { result } = await renderHook(() => useViroHandoff())

		expect(result.current).toBe(false)
		await advance(499)
		expect(result.current).toBe(false)
		await advance(1)
		expect(result.current).toBe(true)
	})
})

describe('useViroExit', () => {
	test('unmounts the view at once and navigates after its release', async () => {
		const then = jest.fn()
		const { result } = await renderHook(() => useViroExit('scene3d'))

		await act(async () => result.current.exit(then))
		expect(result.current.exiting).toBe(true)

		await advance(499)
		expect(then).not.toHaveBeenCalled()
		await advance(1)
		expect(then).toHaveBeenCalledTimes(1)
	})

	test('closing an AR session takes longer', async () => {
		const then = jest.fn()
		const { result } = await renderHook(() => useViroExit('ar'))

		await act(async () => result.current.exit(then))
		await advance(1499)
		expect(then).not.toHaveBeenCalled()
		await advance(1)
		expect(then).toHaveBeenCalledTimes(1)
	})

	// Viro's GL thread emitting a per-frame event while Fabric removes the
	// view deadlocked the app: the scene stops its events first.
	test('a view with per-frame events says it is closing 200 ms before it goes', async () => {
		const { result } = await renderHook(() => useViroExit('ar', false, true))

		expect(result.current.closing).toBe(false)
		await act(async () => result.current.exit(jest.fn()))
		expect(result.current.closing).toBe(true)
		expect(result.current.exiting).toBe(false)

		await advance(199)
		expect(result.current.exiting).toBe(false)
		await advance(1)
		expect(result.current.exiting).toBe(true)
	})

	test('without them it closes at once, and a load still holds it', async () => {
		const plain = await renderHook(() => useViroExit('ar'))

		await act(async () => plain.result.current.exit(jest.fn()))
		expect(plain.result.current.closing).toBe(true)
		expect(plain.result.current.exiting).toBe(true)

		const loading = await renderHook(
			({ busy }: { busy: boolean }) => useViroExit('ar', busy, true),
			{ initialProps: { busy: true } },
		)

		await act(async () => loading.result.current.exit(jest.fn()))
		await advance(1000)
		expect(loading.result.current.exiting).toBe(false)

		await loading.rerender({ busy: false })
		expect(loading.result.current.exiting).toBe(true)
	})

	test('waits for a model that is still loading', async () => {
		const then = jest.fn()
		const { result, rerender } = await renderHook(
			({ busy }: { busy: boolean }) => useViroExit('scene3d', busy),
			{ initialProps: { busy: true } },
		)

		await act(async () => result.current.exit(then))
		await advance(3000)
		expect(result.current.exiting).toBe(false)

		await rerender({ busy: false })
		expect(result.current.exiting).toBe(true)
		await advance(500)
		expect(then).toHaveBeenCalledTimes(1)
	})

	test('but never more than 6 s', async () => {
		const then = jest.fn()
		const { result } = await renderHook(() => useViroExit('scene3d', true))

		await act(async () => result.current.exit(then))
		await advance(5999)
		expect(result.current.exiting).toBe(false)
		await advance(1)
		expect(result.current.exiting).toBe(true)
		await advance(500)
		expect(then).toHaveBeenCalledTimes(1)
	})

	test('a second exit keeps the first destination', async () => {
		const first = jest.fn()
		const second = jest.fn()
		const { result } = await renderHook(() => useViroExit('scene3d'))

		await act(async () => result.current.exit(first))
		await act(async () => result.current.exit(second))
		await advance(500)

		expect(first).toHaveBeenCalledTimes(1)
		expect(second).not.toHaveBeenCalled()
	})

	test('reset lets the view mount again for another exit', async () => {
		const first = jest.fn()
		const second = jest.fn()
		const { result } = await renderHook(() => useViroExit('scene3d'))

		await act(async () => result.current.exit(first))
		await advance(500)
		expect(first).toHaveBeenCalledTimes(1)

		await act(async () => result.current.reset())
		expect(result.current.exiting).toBe(false)
		expect(result.current.closing).toBe(false)

		await act(async () => result.current.exit(second))
		expect(result.current.exiting).toBe(true)
		await advance(500)
		expect(second).toHaveBeenCalledTimes(1)
	})
})
