import { isARSupportedOnDevice } from '@reactvision/react-viro'
import { useCameraPermissions } from 'expo-camera'
import { useEffect, useRef, useState } from 'react'

import { ZOODECK_FORCE_360, ZOODECK_NO_AR } from '@/utils/zoodeckDebug'

// Why a card's animal shows in AR or in the 360° view:
// - 'ar': supported and the camera is allowed
// - 'unsupported': no ARCore on this phone
// - 'no-camera': the camera was denied
// - 'forced': the dev flag (EXPO_PUBLIC_ZOODECK_FORCE_360=1)
export type ArAvailability =
	'checking' | 'ar' | 'unsupported' | 'no-camera' | 'forced'

type Options = {
	// False when the camera isn't needed: the duel already has it (the QR
	// scan asked), or the 360° view was chosen. Asked again when it turns true.
	camera?: boolean
}

// ARCore can answer "TRANSIENT" while it's still checking the phone.
const SUPPORT_ATTEMPTS = 3
const RETRY_MS = 500

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// On Android it resolves only when supported, and rejects with the ARCore
// state otherwise ('UNSUPPORTED', 'UNKNOWN', 'TRANSIENT').
async function checkSupport() {
	for (let attempt = 1; ; attempt++) {
		try {
			const result = await isARSupportedOnDevice()

			return result.isARSupported
		} catch (error) {
			const transient = error instanceof Error && error.message === 'TRANSIENT'

			if (!transient || attempt >= SUPPORT_ATTEMPTS) return false

			await wait(RETRY_MS)
		}
	}
}

// The phone doesn't change during a session: asked once.
let support: Promise<boolean> | null = null

export function useArAvailability({ camera = true }: Options = {}) {
	const [supported, setSupported] = useState<boolean | null>(null)
	const [permission, requestPermission] = useCameraPermissions()
	// Asked once per screen. The status may already read 'denied' (an
	// earlier no) while the dialog asks again: wait for this answer.
	const asked = useRef(false)
	const [answered, setAnswered] = useState(false)

	useEffect(() => {
		if (ZOODECK_FORCE_360) return

		let active = true

		// The dev flag answers like a phone without ARCore, still asynchronously.
		support ??= ZOODECK_NO_AR ? Promise.resolve(false) : checkSupport()
		void support.then((value) => {
			if (active) setSupported(value)
		})

		return () => {
			active = false
		}
	}, [])

	const needsCamera = camera && supported === true

	// Not needed any more (the 360° view was chosen): the next time AR is
	// chosen on this screen, the camera is asked for again.
	if (!needsCamera && answered) setAnswered(false)

	// Asked only on a phone that can do AR.
	useEffect(() => {
		if (!needsCamera) {
			asked.current = false
			return
		}
		if (!permission || permission.granted) return
		if (!permission.canAskAgain || asked.current) return

		asked.current = true
		void requestPermission().finally(() => setAnswered(true))
	}, [needsCamera, permission, requestPermission])

	if (ZOODECK_FORCE_360) return 'forced'
	if (supported === null) return 'checking'
	if (!supported) return 'unsupported'
	if (!camera) return 'ar'
	if (!permission) return 'checking'
	if (permission.granted) return 'ar'
	if (permission.canAskAgain && !answered) {
		return 'checking'
	}

	return 'no-camera'
}
