import useSWR from 'swr'

// Shared shape for the domain hooks, so screens never touch SWR directly.
export type QueryResult<T> = {
	data: T | undefined
	error: Error | undefined
	isLoading: boolean
	refresh: () => Promise<T | undefined>
}

type QueryOptions = {
	// Keep showing the last data while a new key loads (e.g. a moved location).
	keepPreviousData?: boolean
}

export function useQuery<T>(
	key: string | null,
	fetcher: () => Promise<T>,
	options?: QueryOptions,
): QueryResult<T> {
	const { data, error, isLoading, mutate } = useSWR<T, Error>(
		key,
		fetcher,
		options,
	)

	return { data, error, isLoading, refresh: () => mutate() }
}
