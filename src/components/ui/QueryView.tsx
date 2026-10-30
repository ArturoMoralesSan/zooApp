import { EmptyState, type EmptyStateProps } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState, type SkeletonLayout } from '@/components/ui/LoadingState'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import type { QueryResult } from '@/hooks/useQuery'
import { isNetworkError } from '@/services/api'
import type { ReactNode } from 'react'

type QueryViewProps<T> = {
	query: QueryResult<T>
	// LoadingState text and optional skeletons.
	loadingMessage?: string
	loadingLayout?: SkeletonLayout
	// ErrorState title, e.g. "No pudimos cargar los eventos".
	errorTitle: string
	// When it returns true the EmptyState from `empty` is shown instead.
	isEmpty?: (data: T) => boolean
	empty?: Omit<EmptyStateProps, 'className'>
	// Spacing around whichever state is shown.
	className?: string
	children: (data: T) => ReactNode
}

// Renders the module 09 state for a QueryResult: loading or error only while
// there's no data, so cached data stays on screen when a refresh fails
// (the OfflineBanner tells the user). Retry calls `refresh`.
export function QueryView<T>({
	query,
	loadingMessage,
	loadingLayout,
	errorTitle,
	isEmpty,
	empty,
	className,
	children,
}: QueryViewProps<T>) {
	const { isOffline } = useNetworkStatus()
	const { data, error, isLoading, refresh } = query

	if (data === undefined) {
		if (isLoading) {
			return (
				<LoadingState
					message={loadingMessage}
					layout={loadingLayout}
					className={className}
				/>
			)
		}

		if (error) {
			return (
				<ErrorState
					title={errorTitle}
					offline={isOffline || isNetworkError(error)}
					onRetry={() => {
						void refresh()
					}}
					className={className}
				/>
			)
		}

		return null
	}

	if (empty && isEmpty?.(data)) {
		return <EmptyState {...empty} className={className} />
	}

	return children(data)
}
