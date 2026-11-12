import { useFocusEffect } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'

import { markHintShown, wasHintShown } from '@/services/hints'
import { syncPack } from '@/services/packSync'

import { useNetworkStatus } from './useNetworkStatus'
import { usePackStatus } from './usePackStatus'

type Hints = { intro: boolean; mobile: boolean }

// ZooDeck's one-time prompts for the offline pack: the intro modal on the
// first visit with nothing downloaded, then (on mobile data) a notice to
// download it at home. Neither shows offline or once the user asked for it.
export function useOfflinePackPrompts() {
	const status = usePackStatus()
	const { isOffline, isCellular } = useNetworkStatus()
	const [focused, setFocused] = useState(false)
	// Read once per mount: the notice stays up for the rest of this visit
	// even after it's remembered.
	const [hints, setHints] = useState<Hints | null>(null)

	useFocusEffect(
		useCallback(() => {
			setFocused(true)

			return () => setFocused(false)
		}, []),
	)

	useEffect(() => {
		void Promise.all([
			wasHintShown('deck_offline_intro'),
			wasHintShown('deck_offline_mobile'),
		]).then(([intro, mobile]) => setHints({ intro, mobile }))
	}, [])

	const nothingDownloaded =
		status.loaded &&
		status.hasManifest &&
		status.totalCount > 0 &&
		status.doneCount === 0 &&
		!status.enabled &&
		// A background check (possibly slow on mobile data) doesn't hide it.
		status.activity !== 'downloading'

	const canPrompt = hints !== null && !isOffline && nothingDownloaded
	const introVisible = canPrompt && focused && !hints.intro
	const mobileNoticeVisible =
		canPrompt && hints.intro && !hints.mobile && isCellular

	useEffect(() => {
		if (mobileNoticeVisible) void markHintShown('deck_offline_mobile')
	}, [mobileNoticeVisible])

	// Any answer counts: the modal never comes back. The mobile notice waits
	// for a later visit, not right after the modal (only in this state).
	const closeIntro = () => {
		setHints({ intro: true, mobile: true })
		void markHintShown('deck_offline_intro')
	}

	return {
		introVisible,
		mobileNoticeVisible,
		isCellular,
		download: () => {
			closeIntro()
			void syncPack({ userTriggered: true })
		},
		later: closeIntro,
	}
}
