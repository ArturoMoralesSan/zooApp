import { useEffect, useState } from 'react'
import { StatusBar } from 'react-native'

// Light status bar icons while a modal with the Tinta backdrop is open.
// Android's Modal is its own window and copies the status bar style from
// the activity when it opens, so the style is pushed first and the modal
// is shown one frame later. Returns the `visible` value for the Modal.
export function useOverlayStatusBar(visible: boolean) {
	const [ready, setReady] = useState(false)

	useEffect(() => {
		if (!visible) return

		const entry = StatusBar.pushStackEntry({ barStyle: 'light-content' })
		const frame = requestAnimationFrame(() => setReady(true))

		return () => {
			cancelAnimationFrame(frame)
			StatusBar.popStackEntry(entry)
			setReady(false)
		}
	}, [visible])

	return visible && ready
}
