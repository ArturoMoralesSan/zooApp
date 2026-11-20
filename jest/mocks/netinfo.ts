import { jest } from '@jest/globals'
import { useEffect, useState } from 'react'

// Controllable NetInfo. Starts online on Wi-Fi (the library's own mock starts
// on expensive mobile data and never emits); tests switch it with
// __setNetState, which notifies every listener like a real change.
type NetState = {
	type: string
	isConnected: boolean | null
	isInternetReachable: boolean | null
	details: { isConnectionExpensive?: boolean } | null
}

type Listener = (state: NetState) => void

const WIFI: NetState = {
	type: 'wifi',
	isConnected: true,
	isInternetReachable: true,
	details: { isConnectionExpensive: false },
}

export const OFFLINE: Partial<NetState> = {
	type: 'none',
	isConnected: false,
	isInternetReachable: false,
	details: null,
}

export const CELLULAR: Partial<NetState> = {
	type: 'cellular',
	isConnected: true,
	isInternetReachable: true,
	details: { isConnectionExpensive: true },
}

let state: NetState = { ...WIFI }
const listeners = new Set<Listener>()

function addEventListener(listener: Listener) {
	listeners.add(listener)
	// The real module reports the current state right away.
	listener(state)

	return () => {
		listeners.delete(listener)
	}
}

const NetInfo = {
	fetch: jest.fn(async () => state),
	refresh: jest.fn(async () => state),
	configure: jest.fn(),
	addEventListener: jest.fn(addEventListener),
}

export default NetInfo

export function useNetInfo() {
	const [current, setCurrent] = useState(state)

	useEffect(() => addEventListener(setCurrent), [])

	return current
}

export function __setNetState(next: Partial<NetState>) {
	state = { ...state, ...next }
	listeners.forEach((listener) => listener(state))
}

export function __reset() {
	state = { ...WIFI }
	listeners.clear()
}
