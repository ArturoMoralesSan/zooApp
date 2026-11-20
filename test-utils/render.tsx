import { render, renderHook } from '@testing-library/react-native'
import type { ReactElement, ReactNode } from 'react'

import { AuthProvider } from '@/contexts/AuthContext'
import { DataProvider } from '@/services/swr-config'

type Options = {
	// Also mount AuthProvider (useAuth, logout).
	auth?: boolean
}

// DataProvider creates a new cache on every mount, so each render starts
// with an empty SWR cache.
function providers({ auth = false }: Options) {
	return function Providers({ children }: { children: ReactNode }) {
		return (
			<DataProvider>
				{auth ? <AuthProvider>{children}</AuthProvider> : children}
			</DataProvider>
		)
	}
}

export function renderWithProviders(ui: ReactElement, options: Options = {}) {
	return render(ui, { wrapper: providers(options) })
}

export function renderHookWithProviders<Result>(
	hook: () => Result,
	options: Options = {},
) {
	return renderHook(hook, { wrapper: providers(options) })
}
