import { useCallback, useEffect, useSyncExternalStore } from 'react'

import { getHintValue, setHintValue } from '@/services/hints'

// Shared by the three tabs that show the banner, so closing it on one hides
// it on all. undefined until read from storage.
let dismissedTitle: string | null | undefined
let loading: Promise<void> | null = null
const listeners = new Set<() => void>()

const emit = () => listeners.forEach((listener) => listener())

const subscribe = (listener: () => void) => {
	listeners.add(listener)
	return () => listeners.delete(listener)
}

const getSnapshot = () => dismissedTitle

function load() {
	loading ??= getHintValue('points_season_dismissed').then((value) => {
		// A dismiss during the read wins over the stored value.
		if (dismissedTitle === undefined) dismissedTitle = value
		emit()
	})
}

// Whether the season banner with this title was closed. It comes back when
// the zoo publishes a season with another title.
export function useSeasonDismissal(title: string | undefined) {
	const stored = useSyncExternalStore(subscribe, getSnapshot)

	useEffect(load, [])

	const dismiss = useCallback(() => {
		if (!title) return

		dismissedTitle = title
		emit()
		void setHintValue('points_season_dismissed', title)
	}, [title])

	return {
		// Hidden until storage is read, so a closed banner never flashes.
		dismissed: stored === undefined || stored === title,
		dismiss,
	}
}
