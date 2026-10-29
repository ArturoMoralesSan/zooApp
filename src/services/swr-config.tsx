// App-wide SWR setup. SWR's defaults assume a browser, so on React Native:
// - the app always counts as visible; foreground/background is tracked
//   through AppState instead, and returning to the app revalidates;
// - reconnect revalidation is off until we add NetInfo with the offline state;
// - a provider is required for SWR to use the custom focus/reconnect hooks.
//   It gives the app its own cache, so the global `mutate` exported by swr
//   doesn't reach it; writes go through useSWRConfig() in src/hooks instead.
import type { ReactNode } from 'react'
import { AppState, type AppStateStatus } from 'react-native'
import { SWRConfig } from 'swr'

type DataProviderProps = {
	children: ReactNode
}

function initFocus(callback: () => void) {
	let appState: AppStateStatus = AppState.currentState

	const subscription = AppState.addEventListener('change', (nextAppState) => {
		if (/inactive|background/.test(appState) && nextAppState === 'active') {
			callback()
		}

		appState = nextAppState
	})

	return () => subscription.remove()
}

export function DataProvider({ children }: DataProviderProps) {
	return (
		<SWRConfig
			value={{
				provider: () => new Map(),
				isVisible: () => true,
				initFocus,
				revalidateOnReconnect: false,
				initReconnect: () => {
					// add NetInfo here together with the offline state
					return () => {}
				},
			}}
		>
			{children}
		</SWRConfig>
	)
}
