// App-wide SWR setup. SWR's defaults assume a browser, so on React Native:
// - the app always counts as visible; foreground/background is tracked
//   through AppState instead, and returning to the app revalidates;
// - NetInfo drives reconnect: when the connection comes back, every mounted
//   query revalidates;
// - failed requests aren't retried while offline (they would fail again and
//   waste battery); reconnect revalidation picks them up instead. A failed
//   revalidation keeps the cached data, so screens show it with the offline
//   banner rather than an error;
// - a provider is required for SWR to use the custom focus/reconnect hooks.
//   It gives the app its own cache, so the global `mutate` exported by swr
//   doesn't reach it; writes go through useSWRConfig() in src/hooks instead.
import type { ReactNode } from 'react'
import { isOfflineState } from '@/hooks/useNetworkStatus'
import { isNetworkError } from '@/services/api'
import NetInfo from '@react-native-community/netinfo'
import { AppState, type AppStateStatus } from 'react-native'
import { SWRConfig, type SWRConfiguration } from 'swr'

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

function initReconnect(callback: () => void) {
	let offline = false

	return NetInfo.addEventListener((state) => {
		const nextOffline = isOfflineState(state)

		if (offline && !nextOffline) {
			callback()
		}

		offline = nextOffline
	})
}

const onErrorRetry: SWRConfiguration['onErrorRetry'] = async (
	error,
	_key,
	config,
	revalidate,
	{ retryCount },
) => {
	if (isNetworkError(error) || isOfflineState(await NetInfo.fetch())) {
		return
	}

	// SWR's default: exponential backoff, up to errorRetryCount attempts.
	if (
		config.errorRetryCount !== undefined &&
		retryCount > config.errorRetryCount
	) {
		return
	}

	const timeout =
		~~((Math.random() + 0.5) * (1 << Math.min(retryCount, 8))) *
		config.errorRetryInterval

	setTimeout(() => revalidate({ retryCount }), timeout)
}

export function DataProvider({ children }: DataProviderProps) {
	return (
		<SWRConfig
			value={{
				provider: () => new Map(),
				isVisible: () => true,
				initFocus,
				revalidateOnReconnect: true,
				initReconnect,
				onErrorRetry,
			}}
		>
			{children}
		</SWRConfig>
	)
}
