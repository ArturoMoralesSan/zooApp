import useSWR from 'swr'

// Shared shape for the domain hooks, so screens never touch SWR directly.
export type QueryResult<T> = {
	data: T | undefined
	error: Error | undefined
	isLoading: boolean
	refresh: () => Promise<T | undefined>
}

export function useQuery<T>(
	key: string | null,
	fetcher: () => Promise<T>,
): QueryResult<T> {
	const { data, error, isLoading, mutate } = useSWR<T, Error>(key, fetcher)

	return { data, error, isLoading, refresh: () => mutate() }
}
