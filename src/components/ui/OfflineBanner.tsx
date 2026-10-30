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
	const [message, setMessage] = useState<string | null>(null)

	const [wasOffline, setWasOffline] = useState(isOffline)

	const hide = useCallback(() => setMessage(null), [])

	// Show on going offline, hide on coming back (state adjusted in render).
	if (wasOffline !== isOffline) {
		setWasOffline(isOffline)
		setMessage(isOffline ? DEFAULT_MESSAGE : null)
	}

	useEffect(
		() => subscribeOffline((next) => setMessage(next ?? DEFAULT_MESSAGE)),
		[],
	)

	return (
		<Toast
			visible={message !== null}
			type='warning'
			title='Sin conexión'
			message={message ?? ''}
			onHide={hide}
			duration={5000}
		/>
	)
}
