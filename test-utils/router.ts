import { jest } from '@jest/globals'
import { useEffect, type EffectCallback } from 'react'

// expo-router for screens and hooks rendered outside a navigator. Mock it
// per file, lazily, so the spies below are the ones the code under test
// calls:
//
//   jest.mock('expo-router', () =>
//     jest.requireActual<typeof import('<path>/test-utils/router')>(
//       '<path>/test-utils/router',
//     ).expoRouterMock,
//   )
export const routerSpies = {
	push: jest.fn(),
	replace: jest.fn(),
	back: jest.fn(),
}

export const searchParams = jest.fn((): Record<string, string> => ({}))

export const expoRouterMock = {
	router: routerSpies,
	useRouter: () => routerSpies,
	useLocalSearchParams: () => searchParams(),
	// Outside a navigator the screen is always focused.
	useFocusEffect: (effect: EffectCallback) => useEffect(effect, [effect]),
	useIsFocused: () => true,
	Redirect: () => null,
}
