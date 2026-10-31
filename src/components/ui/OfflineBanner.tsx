import Toast from '@/components/ui/Toast'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { subscribeOffline } from '@/services/offline-notice'
import { useCallback, useEffect, useState } from 'react'

const DEFAULT_MESSAGE = 'Mostraremos la información guardada en tu teléfono.'

// The A-43 "Sin conexión" toast. Mounted once in the root layout: shows when
// the device goes offline or a request fails for lack of network, and hides
// on its own or as soon as the connection is back.
export function OfflineBanner() {
	const { isOffline } = useNetworkStatus()
	// `id` changes with every notice so the toast restarts its timer even
	// when it is already showing (e.g. a retry or a blocked write).
	const [notice, setNotice] = useState<{ message: string; id: number } | null>(
		null,
	)

	const [wasOffline, setWasOffline] = useState(isOffline)

	const hide = useCallback(() => setNotice(null), [])

	// Show on going offline, hide on coming back (state adjusted in render).
	if (wasOffline !== isOffline) {
		setWasOffline(isOffline)
		setNotice(isOffline ? { message: DEFAULT_MESSAGE, id: 0 } : null)
	}

	useEffect(
		() =>
			subscribeOffline((next) =>
				setNotice({ message: next ?? DEFAULT_MESSAGE, id: Date.now() }),
			),
		[],
	)

	return (
		<Toast
			key={notice?.id}
			visible={notice !== null}
			type='warning'
			title='Sin conexión'
			message={notice?.message ?? ''}
			onHide={hide}
			duration={5000}
		/>
	)
}
