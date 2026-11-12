import { useIsFocused } from 'expo-router'
import { StatusBar, type StatusBarStyle } from 'expo-status-bar'

type ScreenStatusBarProps = {
	style: StatusBarStyle
}

// A screen's own status bar style, only while that screen is focused. React
// Native keeps the last mounted style, and screens below in a stack (or
// hidden tabs) stay mounted, so a dark screen's 'light' would otherwise
// stick to every screen opened after it. The root's 'dark' is the default.
export function ScreenStatusBar({ style }: ScreenStatusBarProps) {
	const focused = useIsFocused()

	return focused ? <StatusBar style={style} /> : null
}
