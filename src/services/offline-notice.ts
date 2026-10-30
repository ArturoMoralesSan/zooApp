// Tiny event channel for the root OfflineBanner: failed revalidations and
// blocked writes ask it to show, optionally with their own message.
type Listener = (message?: string) => void

const listeners = new Set<Listener>()

export function notifyOffline(message?: string) {
	listeners.forEach((listener) => listener(message))
}

export function subscribeOffline(listener: Listener) {
	listeners.add(listener)

	return () => {
		listeners.delete(listener)
	}
}
