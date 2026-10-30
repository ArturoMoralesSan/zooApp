import NetInfo, {
	useNetInfo,
	type NetInfoState,
} from '@react-native-community/netinfo'

// Offline only when NetInfo says so for sure; `null` means it doesn't know
// yet (e.g. at startup), which counts as online to avoid false offline flashes.
export function isOfflineState(
	state: Pick<NetInfoState, 'isConnected' | 'isInternetReachable'>,
) {
	return state.isConnected === false || state.isInternetReachable === false
}

// One-off check for writes, so they aren't sent while offline.
export async function checkOffline() {
	return isOfflineState(await NetInfo.fetch())
}

// Subscribes to NetInfo (addEventListener under the hood) and re-renders when
// the connection changes.
export function useNetworkStatus() {
	const state = useNetInfo()

	return { isOffline: isOfflineState(state) }
}
